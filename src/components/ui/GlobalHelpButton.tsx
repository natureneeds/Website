import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  PhoneCall,
  MessageSquare,
  Users,
  FileQuestion,
  X,
  ExternalLink,
} from 'lucide-react'

export const GlobalHelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-30">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--forest)] border border-[var(--line)]">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-black text-[var(--ink)]">Farmer Help Desk</h4>
                <p className="text-[10px] text-[var(--muted)]">24x7 Agri Assistance & Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. One-tap Call Helpline */}
          <a
            href="tel:18001801551"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--forest)] text-white hover:bg-[var(--forest-dark)] transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[var(--lime)] group-hover:scale-110 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--lime)]">
                  Kisan Call Centre (Toll Free)
                </div>
                <div className="text-sm font-black font-mono">1800-180-1551</div>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
              Call Now
            </span>
          </a>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/support?tab=ticket"
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--forest)] transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-[var(--forest)]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[var(--ink)] group-hover:text-[var(--forest)]">
                  Talk to Expert
                </div>
                <div className="text-[10px] text-[var(--muted)]">Raise issue ticket</div>
              </div>
            </Link>

            <Link
              to="/support?tab=community"
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--forest)] transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-[var(--forest)]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[var(--ink)] group-hover:text-[var(--forest)]">
                  Community
                </div>
                <div className="text-[10px] text-[var(--muted)]">Farmer discussions</div>
              </div>
            </Link>
          </div>

          {/* Direct link to FAQs */}
          <Link
            to="/support?tab=faqs"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-xs text-[var(--ink)] hover:text-[var(--forest)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-[var(--forest)]" />
              <span className="font-semibold">Browse Knowledge FAQs</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)]" />
          </Link>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--forest)] text-white shadow-xl hover:bg-[var(--forest-dark)] hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-[var(--lime)]"
        aria-label="Open Farmer Help & Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--lime)] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--lime)]" />
        </span>
        <HelpCircle className="w-5 h-5 text-[var(--lime)]" />
        <span className="text-xs font-bold tracking-tight pr-1">Help</span>
      </button>
    </div>
  )
}
