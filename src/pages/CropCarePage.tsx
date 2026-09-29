import React, { useState } from 'react'
import {
  Camera,
  Calendar,
  BookOpen,
  Sprout,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useInAppNotifications } from '@/lib/api/cropCare'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { WeatherAlertsBanner } from '@/components/cropcare/WeatherAlertsBanner'
import { PhotoDiagnosisCard } from '@/components/cropcare/PhotoDiagnosisCard'
import { CropCareTaskCalendar } from '@/components/cropcare/CropCareTaskCalendar'
import { KnowledgeLibraryTab } from '@/components/cropcare/KnowledgeLibraryTab'

export const CropCarePage: React.FC = () => {
  const { user, farm } = useAuth()
  const { data: notifications = [] } = useInAppNotifications(user?.id)
  const [activeTab, setActiveTab] = useState<'doctor' | 'calendar' | 'library'>('doctor')

  const district = farm?.district || 'Hisar'

  return (
    <LayoutShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* District Weather Alerts Banner */}
        <WeatherAlertsBanner notifications={notifications} district={district} />

        {/* Page Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
              <Sprout className="w-3.5 h-3.5" />
              Integrated Crop Care &bull; Phase 9
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight">
              Crop Care & AI Plant Doctor
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Scan leaf symptoms for instant pest & disease diagnosis, keep your active crop cycle on schedule with tick-off field reminders, and browse verified ICAR agronomy articles.
            </p>
          </div>

          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Sprout className="w-64 h-64 text-[var(--forest)]" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--surface-alt)] border border-[var(--line)] max-w-xl">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'doctor'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>AI Plant Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Task Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Library</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'doctor' && (
          <div className="animate-in fade-in duration-200">
            <PhotoDiagnosisCard />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-200">
            <CropCareTaskCalendar />
          </div>
        )}

        {activeTab === 'library' && (
          <div className="animate-in fade-in duration-200">
            <KnowledgeLibraryTab />
          </div>
        )}
      </main>
    </LayoutShell>
  )
}
