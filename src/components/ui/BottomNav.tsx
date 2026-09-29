import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  ShoppingBag,
  Calendar,
  DollarSign,
  Menu,
  X,
  Tractor,
  Activity,
  Coins,
  TrendingUp,
  Warehouse,
  Receipt,
  HelpCircle,
  Palette,
  Phone,
  User,
  Package,
} from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

export interface BottomNavProps {
  className?: string
}

export const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { href: '/plan', label: t('nav.cropPlanner'), icon: Calendar },
    { href: '/sell', label: t('nav.sell'), icon: DollarSign },
  ]

  const menuSections = [
    {
      title: 'Platform Modules',
      links: [
        { href: '/rent', label: 'Rent Equipment & Drones', icon: Tractor, badge: 'Drones' },
        { href: '/market', label: 'Marketplace & Seed Inputs', icon: ShoppingBag },
        { href: '/plan', label: 'Autonomous Crop Planner', icon: Calendar },
        { href: '/crop-care', label: 'Crop Care & AI Plant Doctor', icon: Activity },
        { href: '/labour', label: 'Farm Labour Groups', icon: User },
        { href: '/finance', label: 'Subsidies, KCC & PMFBY', icon: Coins, badge: 'Govt' },
        { href: '/sell', label: 'Live Mandi & Grain Sales', icon: TrendingUp },
        { href: '/storage', label: 'Cold Storage & Warehouses', icon: Warehouse },
        { href: '/ledger', label: 'Farm Profit Ledger', icon: Receipt },
      ],
    },
    {
      title: 'Account & Support',
      links: [
        { href: '/orders', label: 'My Orders & Timeline', icon: Package },
        { href: '/profile', label: 'Farm Profile & Land Records', icon: User },
        { href: '/support', label: 'Help Centre & Expert Tickets', icon: HelpCircle },
        { href: '/design-system', label: 'Design System & Tokens', icon: Palette },
      ],
    },
  ]

  return (
    <>
      {/* 1. Floating Glassmorphic Bottom Navigation Bar (< 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className={`lg:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-[340px] sm:max-w-[380px] bg-white/80 backdrop-blur-xl border border-[var(--line)] shadow-2xl shadow-black/10 rounded-full p-1.5 flex items-center justify-between transition-all duration-300 ${className}`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.href ||
            (item.href === '/marketplace' && location.pathname.startsWith('/market')) ||
            (item.href === '/plan' && location.pathname.startsWith('/plan'))

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setDrawerOpen(false)}
              aria-label={item.label}
              title={item.label}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive && !drawerOpen
                  ? 'bg-[var(--lime)] text-[var(--forest)] shadow-md shadow-[var(--lime)]/30 scale-105'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5 text-current" strokeWidth={isActive && !drawerOpen ? 2.3 : 1.8} />
            </Link>
          )
        })}

        {/* 5th Item: Hamburger Menu Button (Replaces "More") */}
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          title="Menu"
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            drawerOpen
              ? 'bg-[var(--forest)] text-[var(--lime)] shadow-md shadow-[var(--forest)]/30 scale-105'
              : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] active:scale-95'
          }`}
        >
          {drawerOpen ? (
            <X className="w-5 h-5 text-current" strokeWidth={2.3} />
          ) : (
            <Menu className="w-5 h-5 text-current" strokeWidth={1.8} />
          )}
        </button>
      </nav>

      {/* 2. Full Mobile Navigation Drawer (< 1024px) */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[var(--ink)]/50 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
          style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] bg-white rounded-t-[32px] border-t border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/nature-needs-logo.png"
                  alt="Nature Needs Logo"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <span className="text-lg font-bold tracking-tight text-[var(--ink)]">
                  Nature Needs
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-alt)] flex items-center justify-center border border-[var(--line)] transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="overflow-y-auto p-5 pb-24 space-y-6">
              {menuSections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] px-2">
                    {sec.title}
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {sec.links.map((link) => {
                      const Icon = link.icon
                      const isActive = location.pathname === link.href

                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[var(--surface)] text-[var(--forest)] font-bold border-l-4 border-[var(--lime)]'
                              : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-[var(--forest)] shrink-0" />
                            <span>{link.label}</span>
                          </div>
                          {link.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--lime)] text-[var(--forest)]">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-[var(--line)] flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-[var(--muted)]">Language</span>
                  <LanguageSwitcher />
                </div>
                <a
                  href="tel:18005472667"
                  className="flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--line)] hover:bg-[var(--surface-alt)] text-[var(--forest)] font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Farmer Helpline: 1800-KISAN-OS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
