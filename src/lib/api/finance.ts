import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import { SEEDED_SCHEMES, type SchemeData } from '@/lib/data/seedSchemes'

export const useSchemes = (section?: string) => {
  return useQuery({
    queryKey: ['finance-schemes', section],
    queryFn: async (): Promise<SchemeData[]> => {
      let list = [...SEEDED_SCHEMES]
      if (section && section !== 'all') {
        list = list.filter((s) => s.section === section)
      }
      return list
    },
    staleTime: 5 * 60 * 1000,
  })
}

export interface EligibilityInput {
  state: string
  landSize: number
  crop: string
  category: 'marginal' | 'small' | 'medium' | 'large' | 'all'
}

export const filterEligibleSchemes = (
  schemes: SchemeData[],
  input: EligibilityInput
): SchemeData[] => {
  return schemes.filter((s) => {
    // 1. State match
    const stateMatch =
      s.states.includes('ALL') ||
      s.states.some((st) => st.toLowerCase() === input.state.toLowerCase())

    if (!stateMatch) return false

    // 2. Land Size match
    const landSize = input.landSize || 1
    if (landSize < s.min_land_acre || landSize > s.max_land_acre) {
      return false
    }

    // 3. Crop match
    if (input.crop && input.crop !== 'all') {
      const cropMatch =
        s.eligible_crops.includes('All') ||
        s.eligible_crops.some((c) => c.toLowerCase() === input.crop.toLowerCase())
      if (!cropMatch) return false
    }

    return true
  })
}

export const useRequestFinanceCallback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      schemeId,
      schemeTitle,
      farmerName,
      phone,
      notes,
    }: {
      userId: string
      schemeId: string
      schemeTitle: string
      farmerName: string
      phone: string
      notes?: string
    }) => {
      const ticketPayload = {
        user_id: userId,
        subject: `Finance Helpdesk Call-back: ${schemeTitle} (#${schemeId}) for ${farmerName}`,
        category: 'finance',
        status: 'open',
        priority: 'high',
      }

      if (!isMockAuth) {
        try {
          await supabase.from('support_tickets').insert(ticketPayload)
        } catch {
          // fallback
        }
      }

      // Add in-app confirmation notification for farmer
      mockDb.addNotification(userId, {
        user_id: userId,
        title: `Finance Helpdesk: Call-Back Scheduled`,
        message: `Your call-back request for "${schemeTitle}" has been queued. A Krishi Banking Counselor will contact ${farmerName} at ${phone} to assist with paperwork.${
          notes ? ' Details: ' + notes : ''
        }`,
        type: 'general',
        severity: 'success',
        is_read: false,
      })

      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', variables.userId] })
    },
  })
}
