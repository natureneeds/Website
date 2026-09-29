import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui'

export interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { user, hasCompletedOnboarding, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6 gap-4">
        <Skeleton variant="circle" />
        <Skeleton variant="text" className="w-48" />
        <Skeleton variant="text" className="w-32" />
      </div>
    )
  }

  // 1. Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Logged in without profile -> redirect to /onboarding
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
