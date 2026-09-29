import { mockDb } from '@/lib/supabase/client'
import type { LedgerEntry } from '@/lib/data/seedLedger'

const OFFLINE_LEDGER_QUEUE_KEY = 'kisan_offline_ledger_queue'

export interface QueuedLedgerEntry {
  id: string
  entry: Omit<LedgerEntry, 'id' | 'created_at'>
  queued_at: string
}

export const getQueuedLedgerEntries = (): QueuedLedgerEntry[] => {
  const raw = localStorage.getItem(OFFLINE_LEDGER_QUEUE_KEY)
  return raw ? JSON.parse(raw) : []
}

export const enqueueOfflineLedgerEntry = (
  entry: Omit<LedgerEntry, 'id' | 'created_at'>
): QueuedLedgerEntry => {
  const queue = getQueuedLedgerEntries()
  const queuedItem: QueuedLedgerEntry = {
    id: 'offline_' + Math.random().toString(36).substring(2, 9),
    entry,
    queued_at: new Date().toISOString(),
  }
  queue.push(queuedItem)
  localStorage.setItem(OFFLINE_LEDGER_QUEUE_KEY, JSON.stringify(queue))
  return queuedItem
}

export const syncOfflineLedgerQueue = async (): Promise<number> => {
  const queue = getQueuedLedgerEntries()
  if (queue.length === 0) return 0

  let syncedCount = 0
  for (const item of queue) {
    try {
      mockDb.createLedgerEntry(item.entry)
      syncedCount++
    } catch (err) {
      console.error('Failed to sync queued ledger entry:', err)
    }
  }

  // Clear queue on completion
  localStorage.removeItem(OFFLINE_LEDGER_QUEUE_KEY)
  window.dispatchEvent(new CustomEvent('kisan_ledger_synced', { detail: { syncedCount } }))
  return syncedCount
}

// Global listener for automatic background sync upon internet restoration
export const initOfflineSyncListeners = () => {
  window.addEventListener('online', () => {
    syncOfflineLedgerQueue().then((count) => {
      if (count > 0) {
        console.log(`[PWA Offline Sync] Successfully synced ${count} ledger entries.`)
      }
    })
  })
}

// Service worker registration helper
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered with scope:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err)
        })
    })
  }
}
