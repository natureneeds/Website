import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { SEEDED_FAQS } from '@/lib/data/seedSupportCommunity'

export const FaqAccordion: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(SEEDED_FAQS[0]?.id || null)
  const [lang, setLang] = useState<'hi' | 'en'>('en')

  const categories = [
    { key: 'all', label: 'All FAQs' },
    { key: 'crop', label: 'Crop & Agronomy' },
    { key: 'product', label: 'Seeds & Bio-Inputs' },
    { key: 'order', label: 'Orders & Deliveries' },
    { key: 'finance', label: 'KCC Loans & Insurance' },
  ]

  const filteredFaqs = SEEDED_FAQS.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        faq.question_en.toLowerCase().includes(q) ||
        faq.question_hi.toLowerCase().includes(q) ||
        faq.answer_en.toLowerCase().includes(q) ||
        faq.answer_hi.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Category Pills & Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === c.key
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Lang toggle */}
          <div className="flex rounded-full bg-[var(--surface-alt)] p-0.5 border border-[var(--line)] text-[11px] font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                lang === 'en' ? 'bg-[var(--forest)] text-white' : 'text-[var(--muted)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                lang === 'hi' ? 'bg-[var(--forest)] text-white' : 'text-[var(--muted)]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--muted)]">
          No FAQs match your search query. Try another keyword or create an expert ticket.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id
            const question = lang === 'hi' ? faq.question_hi : faq.question_en
            const answer = lang === 'hi' ? faq.answer_hi : faq.answer_en

            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface-alt)]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--forest)] flex items-center justify-center shrink-0 text-xs font-bold">
                      Q
                    </span>
                    <span className="font-bold text-sm text-[var(--ink)]">{question}</span>
                  </div>

                  <div className="shrink-0 text-[var(--muted)]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--forest)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[var(--ink)]/80 leading-relaxed border-t border-[var(--line)] bg-[var(--bg-page)]/50 animate-in fade-in duration-150">
                    <div className="flex items-start gap-3 mt-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--forest)]/10 text-[var(--forest)] flex items-center justify-center shrink-0 text-xs font-bold">
                        A
                      </span>
                      <p>{answer}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
