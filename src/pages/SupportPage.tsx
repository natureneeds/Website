import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { Button } from '@/components/ui/Button'
import { FaqAccordion } from '@/components/support/FaqAccordion'
import { CommunityFeed } from '@/components/support/CommunityFeed'
import { CreateTicketModal } from '@/components/support/CreateTicketModal'
import { TicketChatModal } from '@/components/support/TicketChatModal'
import { useSupportTickets } from '@/lib/api/supportCommunity'
import type { SupportTicket } from '@/lib/data/seedSupportCommunity'
import {
  PhoneCall,
  MessageSquare,
  Users,
  BookOpen,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export const SupportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'faqs' | 'tickets' | 'community'>('faqs')
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [activeChatTicket, setActiveChatTicket] = useState<SupportTicket | null>(null)

  const { data: tickets = [], isLoading: isLoadingTickets } = useSupportTickets()

  useEffect(() => {
    if (tabParam === 'ticket' || tabParam === 'tickets') {
      setActiveTab('tickets')
      if (searchParams.get('create') === 'true') {
        setIsCreateTicketOpen(true)
      }
    } else if (tabParam === 'community') {
      setActiveTab('community')
    } else if (tabParam === 'faqs') {
      setActiveTab('faqs')
    }
  }, [tabParam, searchParams])

  const handleTabChange = (t: 'faqs' | 'tickets' | 'community') => {
    setActiveTab(t)
    setSearchParams({ tab: t })
  }

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--forest)]" />
                24x7 Agri Helpline & Agronomist Support
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] tracking-tight">
                Farmer Support & Knowledge Hub
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                Connect directly with certified KVK agronomists, browse comprehensive disease & input FAQs in Hindi and English, or discuss field techniques with fellow farmers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* One tap call helpline */}
              <a href="tel:18001801551">
                <Button
                  variant="primary"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                >
                  <PhoneCall className="w-4 h-4 text-[var(--lime)]" />
                  <span>Call Helpline 1800-180-1551</span>
                </Button>
              </a>

              <Button
                variant="secondary"
                onClick={() => setIsCreateTicketOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4 text-[var(--forest)]" />
                <span>Talk to Expert</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[var(--line)] gap-2 pt-2 overflow-x-auto">
            <button
              onClick={() => handleTabChange('faqs')}
              className={`pb-3 px-4 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'faqs'
                  ? 'border-[var(--forest)] text-[var(--forest)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Help Centre & FAQs</span>
            </button>

            <button
              onClick={() => handleTabChange('tickets')}
              className={`pb-3 px-4 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'tickets'
                  ? 'border-[var(--forest)] text-[var(--forest)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Expert Tickets ({tickets.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('community')}
              className={`pb-3 px-4 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'community'
                  ? 'border-[var(--forest)] text-[var(--forest)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Farmer Community Discussions</span>
            </button>
          </div>
        </div>

        {/* Tab 1: FAQs & Knowledge */}
        {activeTab === 'faqs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FaqAccordion />

            {/* Banner to raise ticket if FAQ didn't solve */}
            <div className="p-6 rounded-2xl bg-[var(--ink)] border border-[var(--line)] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-base">Didn't find what you need?</h4>
                <p className="text-xs text-white/70">
                  Upload a photo of your leaf or order invoice to get personalized guidance from agronomists.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsCreateTicketOpen(true)}
                className="shrink-0 text-xs py-2 px-4"
              >
                Raise Expert Ticket
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: My Support Tickets & Realtime Chat */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)]">Your Active Tickets</h3>
                <p className="text-xs text-[var(--muted)]">
                  Live conversations with assigned agricultural extension officers.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsCreateTicketOpen(true)}
                className="flex items-center gap-1.5 text-xs py-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </Button>
            </div>

            {isLoadingTickets ? (
              <div className="py-16 text-center text-xs text-[var(--muted)]">
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
                <MessageSquare className="w-12 h-12 text-[var(--muted)] mx-auto" />
                <h4 className="text-base font-bold text-[var(--ink)]">No Support Tickets Raised</h4>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  Have a question about pest attacks, delayed delivery, or loan documentation? Raise a ticket and get an agronomist response.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsCreateTicketOpen(true)}
                  className="mt-2 text-xs"
                >
                  Raise First Ticket
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((tkt, idx) => {
                  const isDark = idx % 2 === 1

                  return (
                    <div
                      key={tkt.id}
                      className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-5 ${
                        isDark
                          ? 'bg-[var(--ink)] border-[var(--line)] text-white'
                          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                                isDark
                                  ? 'bg-white/10 text-[var(--lime)] border border-white/10'
                                  : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]'
                              }`}
                            >
                              {tkt.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                tkt.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {tkt.status}
                            </span>
                          </div>

                          <span className={`text-[11px] ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                            {new Date(tkt.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base sm:text-lg font-bold line-clamp-1">
                            {tkt.subject}
                          </h4>
                          <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                            {tkt.description}
                          </p>
                        </div>

                        {tkt.photos && tkt.photos.length > 0 && (
                          <div className="flex gap-2">
                            {tkt.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt="Problem"
                                className="w-14 h-14 rounded-xl object-cover border border-white/20"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-[var(--line)]'}`}>
                        <div className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--lime)]" />
                          <span>KVK Agronomist Assigned</span>
                        </div>

                        <Button
                          variant={isDark ? 'primary' : 'secondary'}
                          onClick={() => setActiveChatTicket(tkt)}
                          className="flex items-center gap-1.5 text-xs py-1.5 px-3"
                        >
                          <span>Open Live Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Community Discussions */}
        {activeTab === 'community' && (
          <div className="animate-in fade-in duration-200">
            <CommunityFeed />
          </div>
        )}

        {/* Modals */}
        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => setIsCreateTicketOpen(false)}
        />

        <TicketChatModal
          isOpen={Boolean(activeChatTicket)}
          onClose={() => setActiveChatTicket(null)}
          ticket={activeChatTicket}
        />
      </div>
    </LayoutShell>
  )
}
export default SupportPage
