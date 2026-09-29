import React from 'react'
import { useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { GlobalHelpButton } from './GlobalHelpButton'

export interface LayoutShellProps {
  children: React.ReactNode
  showFooter?: boolean
  hideTopNav?: boolean
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  children,
  showFooter = true,
  hideTopNav = false,
}) => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--ink)] font-sans flex flex-col selection:bg-[var(--lime)] selection:text-[var(--ink)]">
      {!hideTopNav && <TopNav />}
      <main className={`flex-1 w-full ${!hideTopNav && !isHome ? 'pt-20 sm:pt-24' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
      <BottomNav />
      <GlobalHelpButton />
    </div>
  )
}
