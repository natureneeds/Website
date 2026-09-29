import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import type { UserProfile, Farm } from '@/lib/supabase/types'
import i18n from '@/lib/i18n'

interface AuthContextType {
  user: { id: string; phone: string } | null
  profile: UserProfile | null
  farm: Farm | null
  isLoading: boolean
  hasCompletedOnboarding: boolean
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; devCode?: string }>
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>
  saveOnboarding: (
    profileData: { full_name: string; language: 'en' | 'hi' },
    farmData: Omit<Farm, 'user_id' | 'id'>
  ) => Promise<{ success: boolean; error?: string }>
  updateProfile: (
    profileData: Partial<UserProfile>,
    farmData?: Partial<Farm>
  ) => Promise<{ success: boolean; error?: string }>
  testRls: (targetUserId: string) => Promise<{ blocked: boolean; message: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; phone: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUserData = useCallback(async (userId: string) => {
    try {
      if (isMockAuth) {
        const p = mockDb.getProfile(userId)
        const f = mockDb.getFarm(userId)
        setProfile(p)
        setFarm(f)
        if (p?.language) {
          i18n.changeLanguage(p.language)
        }
      } else {
        // Live Supabase query with RLS
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        const { data: farmData } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData as UserProfile)
          if (profileData.language) {
            i18n.changeLanguage(profileData.language)
          }
        }
        if (farmData) {
          setFarm(farmData as Farm)
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      try {
        if (isMockAuth) {
          const session = mockDb.getSession()
          if (session) {
            setUser(session.user)
            await loadUserData(session.user.id)
          }
        } else {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user) {
            const u = {
              id: data.session.user.id,
              phone: data.session.user.phone || '',
            }
            setUser(u)
            await loadUserData(u.id)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [loadUserData])

  const sendOtp = async (phone: string) => {
    if (isMockAuth) {
      const res = mockDb.sendOtp(phone)
      if (!res.success) {
        return { success: false, error: res.error }
      }
      return { success: true, devCode: res.code }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    }
  }

  const verifyOtp = async (phone: string, token: string) => {
    setIsLoading(true)
    try {
      if (isMockAuth) {
        const res = mockDb.verifyOtp(phone, token)
        if (res.success && res.session) {
          setUser(res.session.user)
          await loadUserData(res.session.user.id)
          return { success: true }
        }
        return { success: false, error: res.error || 'Verification failed' }
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms',
        })
        if (error) {
          return { success: false, error: error.message }
        }
        if (data.user) {
          const u = { id: data.user.id, phone: data.user.phone || phone }
          setUser(u)
          await loadUserData(u.id)
        }
        return { success: true }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const saveOnboarding = async (
    profileData: { full_name: string; language: 'en' | 'hi' },
    farmData: Omit<Farm, 'user_id' | 'id'>
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const newProfile: UserProfile = {
        id: user.id,
        phone: user.phone,
        full_name: profileData.full_name,
        language: profileData.language,
      }

      const newFarm: Farm = {
        ...farmData,
        user_id: user.id,
      }

      if (isMockAuth) {
        mockDb.saveProfile(newProfile)
        mockDb.saveFarm(newFarm)
      } else {
        const { error: profileError } = await supabase.from('profiles').upsert(newProfile)
        if (profileError) return { success: false, error: profileError.message }

        const { error: farmError } = await supabase.from('farms').upsert(newFarm)
        if (farmError) return { success: false, error: farmError.message }
      }

      setProfile(newProfile)
      setFarm(newFarm)
      i18n.changeLanguage(profileData.language)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save onboarding data'
      return { success: false, error: msg }
    }
  }

  const updateProfile = async (
    profileData: Partial<UserProfile>,
    farmData?: Partial<Farm>
  ) => {
    if (!user || !profile) return { success: false, error: 'Not authenticated' }

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        ...profileData,
      }

      let updatedFarm: Farm | null = farm
      if (farmData && farm) {
        updatedFarm = {
          ...farm,
          ...farmData,
        }
      }

      if (isMockAuth) {
        mockDb.saveProfile(updatedProfile)
        if (updatedFarm) {
          mockDb.saveFarm(updatedFarm)
        }
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
        if (profileError) return { success: false, error: profileError.message }

        if (farmData && farm) {
          const { error: farmError } = await supabase
            .from('farms')
            .update(farmData)
            .eq('user_id', user.id)
          if (farmError) return { success: false, error: farmError.message }
        }
      }

      setProfile(updatedProfile)
      if (updatedFarm) setFarm(updatedFarm)
      if (profileData.language) i18n.changeLanguage(profileData.language)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed'
      return { success: false, error: msg }
    }
  }

  // RLS test probe: attempts to query another user's record
  const testRls = async (targetUserId: string) => {
    if (isMockAuth) {
      return mockDb.testRlsViolation(targetUserId)
    } else {
      try {
        // Query foreign profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)

        if (error) {
          return {
            blocked: true,
            message: `RLS Policy Triggered: ${error.message} (Code: ${error.code})`,
          }
        }

        if (!data || data.length === 0) {
          return {
            blocked: true,
            message: `RLS Verified: SELECT on user '${targetUserId}' returned 0 rows (invisible to this user).`,
          }
        }

        return {
          blocked: false,
          message: 'Warning: Row was visible. Verify RLS policy definition.',
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Blocked'
        return { blocked: true, message: `RLS Block: ${msg}` }
      }
    }
  }

  const signOut = async () => {
    if (isMockAuth) {
      mockDb.setSession(null)
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setFarm(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  const hasCompletedOnboarding = Boolean(profile?.full_name && farm?.state)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        farm,
        isLoading,
        hasCompletedOnboarding,
        sendOtp,
        verifyOtp,
        saveOnboarding,
        updateProfile,
        testRls,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
