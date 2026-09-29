import React, { useState, useRef, useEffect } from 'react'
import { Bell, ThermometerSnowflake, Check, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  useInAppNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/api/cropCare'

export const NotificationBell: React.FC = () => {
  const { user } = useAuth()
  const { data: notifications = [] } = useInAppNotifications(user?.id)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadList = notifications.filter((n) => !n.is_read)
  const unreadCount = unreadList.length

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications & Weather Alerts"
        className="relative w-10 h-10 min-h-touch min-w-touch rounded-full bg-[var(--surface-alt)] hover:bg-[var(--surface)] text-[var(--forest)] hover:text-[var(--ink)] border border-[var(--line)] flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
        title="Notifications & Weather Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--warning)] text-[var(--ink)] text-[11px] font-black flex items-center justify-center border-2 border-[var(--bg-page)] shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--forest)]" />
              <h4 className="text-sm font-bold text-[var(--ink)]">Field Alerts & Advisories</h4>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => user?.id && markAllRead.mutate(user.id)}
                className="text-[11px] font-semibold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted)]">
                No active notifications or advisories.
              </div>
            ) : (
              notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    notif.is_read ? 'bg-[var(--bg-page)] opacity-70' : 'bg-[var(--surface-alt)]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'weather_alert' ? (
                      <ThermometerSnowflake className="w-4 h-4 text-[var(--warning)]" />
                    ) : (
                      <Bell className="w-4 h-4 text-[var(--forest)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-[var(--ink)] truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-[var(--muted)] shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/80 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={() =>
                        user?.id && markRead.mutate({ userId: user.id, notifId: notif.id })
                      }
                      title="Mark as read"
                      className="p-1 text-[var(--muted)] hover:text-[var(--forest)] shrink-0 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-[var(--line)] bg-[var(--surface)] text-center">
            <Link
              to="/crop-care"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[var(--forest)] hover:underline inline-flex items-center gap-1"
            >
              Open Crop Care & Plant Doctor &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
