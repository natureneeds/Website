import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  ChevronDown,
  Sprout,
  Layers,
  ShieldAlert,
  Zap,
  Wrench,
  Droplets,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import { useCart } from '@/lib/api/cart'

export interface TopNavProps {
  className?: string
  onQuickAction?: () => void
}

const MARKETPLACE_CATEGORIES = [
  { id: 'c1', name: 'Seeds', slug: 'seeds', icon: Sprout },
  { id: 'c2', name: 'Fertilizers', slug: 'fertilizers', icon: Layers },
  { id: 'c3', name: 'Pesticides', slug: 'pesticides', icon: ShieldAlert },
  { id: 'c4', name: 'Spray Pumps & Sprayers', slug: 'spray-pumps-&-sprayers', icon: Zap },
  { id: 'c5', name: 'Tools & Equipment', slug: 'tools-&-equipment', icon: Wrench },
  { id: 'c6', name: 'Irrigation', slug: 'irrigation', icon: Droplets },
  { id: 'c7', name: 'Organic Inputs', slug: 'organic-inputs', icon: Leaf },
  { id: 'c8', name: 'Farm Safety', slug: 'farm-safety', icon: ShieldCheck },
]

export const TopNav: React.FC<TopNavProps> = ({ className = '', onQuickAction: _onQuickAction }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: cartItems = [] } = useCart()
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.qty, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/market?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'py-2.5 bg-[var(--bg-page)]/85 backdrop-blur-md shadow-sm border-b border-[var(--line)]/50'
          : 'py-3 sm:py-4 bg-transparent'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 w-full">
        {/* Left Pill: Logo with Nature Needs Emblem */}
        <Link
          to="/"
          className="bg-white rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm flex items-center gap-2.5 hover:shadow-md transition-all focus:outline-none shrink-0 border border-[var(--line)] group"
        >
          <img
            src="/nature-needs-logo.png"
            alt="Nature Needs Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 group-hover:scale-105 transition-transform"
          />
          <span className="text-lg font-bold tracking-tight text-[var(--ink)]">
            Nature Needs
          </span>
        </Link>

        {/* Center Pill: Desktop Navigation Links + Search + Cart (>= 1024px) */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-7 bg-white rounded-full px-6 xl:px-8 py-2 shadow-sm text-sm font-medium text-[var(--ink)] border border-[var(--line)]"
        >
          <Link
            to="/"
            className="text-[var(--forest)] font-semibold hover:text-[var(--ink)] transition-colors"
          >
            Home
          </Link>

          {/* Marketplace with Desktop Hover Dropdown */}
          <div className="relative group">
            <Link
              to="/market"
              className="flex items-center gap-1 hover:text-[var(--forest)] transition-colors py-1"
            >
              <span>Marketplace</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {/* Dropdown Menu - Hover on Desktop Mode Only */}
            <div className="absolute top-full left-0 pt-2 hidden lg:group-hover:block z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-[var(--line)] p-2.5 min-w-[260px] animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-3 py-1.5 mb-1 border-b border-[var(--line)]/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Categories</span>
                  <Link
                    to="/market"
                    className="text-[11px] font-semibold text-[var(--forest)] hover:underline"
                  >
                    All Products &rarr;
                  </Link>
                </div>
                <div className="flex flex-col gap-0.5">
                  {MARKETPLACE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.id}
                        to={`/market/${cat.slug}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--ink)] hover:bg-[var(--surface)] hover:text-[var(--forest)] transition-colors group/cat"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[var(--surface)] group-hover/cat:bg-[var(--lime)]/30 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-3.5 h-3.5 text-[var(--forest)]" />
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <Link to="/crop-planner" className="hover:text-[var(--forest)] transition-colors">
            How it Works
          </Link>

          {/* Services dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[var(--forest)] transition-colors py-1 cursor-pointer font-medium"
            >
              <span>Services</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute top-full left-0 pt-2 hidden lg:group-hover:block z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-[var(--line)] p-2.5 min-w-[240px] animate-in fade-in slide-in-from-top-1 duration-200">
                <Link
                  to="/rent"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  DJI Drone Spraying &amp; Rentals
                </Link>
                <Link
                  to="/crop-care"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Disease &amp; Pest Inspection
                </Link>
                <Link
                  to="/labour"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Farm Labour Booking
                </Link>
                <Link
                  to="/finance"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Government Subsidies &amp; KCC
                </Link>
                <Link
                  to="/sell"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Live Mandi &amp; Grain Sales
                </Link>
                <Link
                  to="/storage"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Cold Storage &amp; Warehouses
                </Link>
                <Link
                  to="/ledger"
                  className="px-3 py-2 rounded-xl text-xs hover:bg-[var(--surface)] text-[var(--ink)] font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] shrink-0" />
                  Farm Profit Ledger
                </Link>
              </div>
            </div>
          </div>

          <Link to="/crop-care" className="hover:text-[var(--forest)] transition-colors">
            Blog
          </Link>

          <Link to="/support" className="hover:text-[var(--forest)] transition-colors">
            Contact us
          </Link>

          {/* Embedded Pill Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-3.5 py-1.5 rounded-full border border-[var(--line)] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none w-20 xl:w-28"
            />
          </form>

          {/* Shopping Bag Pill Button */}
          <Link
            to="/cart"
            className="w-9 h-9 rounded-full bg-[var(--surface-alt)] hover:bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] relative transition-colors shrink-0"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[var(--ink)]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--lime)] text-[var(--forest)] text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Pill (Desktop >= 640px): Contact Us Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/support"
            className="bg-white rounded-full px-6 py-2.5 shadow-sm text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface)] transition-all shrink-0 border border-[var(--line)]"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile View (< 1024px): Only Logo pill and Cart button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/cart"
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--ink)] relative border border-[var(--line)] hover:scale-105 transition-transform"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[var(--ink)]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--lime)] text-[var(--forest)] text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
