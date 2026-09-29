import React from 'react'
import { AlertTriangle, CloudRain, ThermometerSnowflake, Bell, Check, X } from 'lucide-react'
import type { InAppNotification } from '@/lib/supabase/types'
import { useMarkNotificationRead } from '@/lib/api/cropCare'
import { useAuth } from '@/context/AuthContext'

interface WeatherAlertsBannerProps {
  notifications: InAppNotification[]
  district?: string
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({
  notifications,
  district = 'Hisar',
}) => {
  const { user } = useAuth()
  const markRead = useMarkNotificationRead()

  const weatherAlerts = notifications.filter(
    (n) => n.type === 'weather_alert' && !n.is_read
  )

  if (weatherAlerts.length === 0) {
    return null
  }

  const getAlertIcon = (title: string, severity: string) => {
    const t = title.toLowerCase()
    if (t.includes('frost') || t.includes('cold') || t.includes('winter')) {
      return <ThermometerSnowflake className="w-5 h-5 text-[var(--forest)] shrink-0" />
    }
    if (t.includes('rain') || t.includes('shower') || t.includes('storm')) {
      return <CloudRain className="w-5 h-5 text-[var(--forest)] shrink-0" />
    }
    if (severity === 'warning' || severity === 'danger') {
      return <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0" />
    }
    return <Bell className="w-5 h-5 text-[var(--forest)] shrink-0" />
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] animate-ping" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
            Active Weather Advisories &bull; {district} District
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--muted)]">
          {weatherAlerts.length} Active {weatherAlerts.length === 1 ? 'Alert' : 'Alerts'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {weatherAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] flex items-start justify-between gap-3 shadow-sm transition-all hover:border-[var(--forest)]"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] mt-0.5">
                {getAlertIcon(alert.title, alert.severity)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">
                    {alert.title}
                  </h4>
                  {alert.severity === 'warning' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--warning)] text-[var(--ink)]">
                      Advisory
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                  {alert.message}
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-[var(--muted)]">
                  <span>
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>&bull;</span>
                  <button
                    onClick={() => {
                      if (user?.id) {
                        markRead.mutate({ userId: user.id, notifId: alert.id })
                      }
                    }}
                    className="hover:underline font-semibold text-[var(--forest)] flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (user?.id) {
                  markRead.mutate({ userId: user.id, notifId: alert.id })
                }
              }}
              title="Dismiss alert"
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
