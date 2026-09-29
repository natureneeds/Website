import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  Languages,
  Clock,
  CheckCircle,
  X,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { useKnowledgeArticles } from '@/lib/api/cropCare'
import type { KnowledgeArticle } from '@/lib/data/seedArticles'
import { Button } from '@/components/ui/Button'

export const KnowledgeLibraryTab: React.FC = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  const { data: articles = [], isLoading } = useKnowledgeArticles(search, category, lang)

  const categories = [
    { id: 'all', label: 'All Topics', labelHi: 'सभी विषय' },
    { id: 'disease_control', label: 'Disease Control', labelHi: 'रोग नियंत्रण' },
    { id: 'nutrient_management', label: 'Nutrients & Fertilizer', labelHi: 'उर्वरक प्रबंधन' },
    { id: 'water_saving', label: 'Irrigation & Water', labelHi: 'सिंचाई व जल' },
    { id: 'soil_health', label: 'Soil Health', labelHi: 'मिट्टी स्वास्थ्य' },
    { id: 'harvest_tips', label: 'Harvesting', labelHi: 'कटाई सलाह' },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--forest)] text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Agronomy Knowledge Library &bull; 10 Verified Guides
            </div>
            <h3 className="text-2xl font-black text-[var(--ink)] tracking-tight">
              {lang === 'hi' ? 'किसान ज्ञानकोश एवं फसल सुरक्षा' : 'Field Advisory & Agronomy Guides'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              {lang === 'hi'
                ? 'कृषि वैज्ञानिकों द्वारा सत्यापित लघु लेख एवं त्वरित रोग समाधान।'
                : 'Actionable, research-backed guides curated by ICAR & agricultural scientists in English and Hindi.'}
            </p>
          </div>

          {/* Language Toggle Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--line)]">
            <Languages className="w-4 h-4 ml-1.5 text-[var(--forest)]" />
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'hi'
                  ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'बीमारी, उर्वरक या फसल का नाम खोजें (उदा. पीला रतुआ, यूरिया, गेहूं)...'
                : 'Search articles by disease, crop, or practice (e.g., yellow rust, nano urea, wheat)...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                category === c.id
                  ? 'bg-[var(--forest)] text-[var(--white)]'
                  : 'bg-[var(--bg-page)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
              }`}
            >
              {lang === 'hi' ? c.labelHi : c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Grid */}
      {isLoading ? (
        <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--lime)] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] text-sm">
          No articles match your search criteria. Try a different keyword or category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => {
            const displayTitle = lang === 'hi' ? art.title_hi : art.title
            const displaySummary = lang === 'hi' ? art.summary_hi : art.summary

            return (
              <div
                key={art.id}
                className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--forest)] transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--forest)]">
                      <Tag className="w-3 h-3" />
                      {art.crop_tag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--muted)] font-medium">
                      <Clock className="w-3 h-3" />
                      {art.read_time_minutes} min read
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[var(--ink)] leading-snug">
                    {displayTitle}
                  </h4>

                  <p className="text-xs text-[var(--ink)]/80 leading-relaxed line-clamp-3">
                    {displaySummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    {art.category.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="text-xs font-bold text-[var(--forest)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{lang === 'hi' ? 'पूरा लेख पढ़ें' : 'Read Full Guide'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200 space-y-6">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--surface)] text-[var(--forest)] border border-[var(--line)]">
                  {selectedArticle.crop_tag}
                </span>
                <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedArticle.read_time_minutes} min read
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                {lang === 'hi' ? selectedArticle.title_hi : selectedArticle.title}
              </h3>
            </div>

            {/* Article Content */}
            <div className="prose prose-sm text-xs sm:text-sm text-[var(--ink)]/90 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
              {lang === 'hi' ? selectedArticle.content_hi : selectedArticle.content}
            </div>

            {/* Action Steps Checklist */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[var(--forest)]" />
                {lang === 'hi' ? 'महत्वपूर्ण कार्य सूची (Checklist)' : 'Action Steps For Farmers'}
              </h4>
              <div className="space-y-2">
                {(lang === 'hi'
                  ? selectedArticle.action_steps_hi
                  : selectedArticle.action_steps
                ).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] flex items-start gap-2.5 text-xs text-[var(--ink)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[var(--lime)] text-[var(--ink)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <span className="text-[11px] text-[var(--muted)]">
                Source: ICAR Crop Protection Handbook &bull; Kisan OS
              </span>
              <Button variant="primary" onClick={() => setSelectedArticle(null)}>
                Done Reading
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
