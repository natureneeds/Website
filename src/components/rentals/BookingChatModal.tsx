import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBookingMessages, useSendBookingMessage } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'

interface BookingChatModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingType: 'rental' | 'labour'
  title: string
  counterpartyName: string
  status: string
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingType,
  title,
  counterpartyName,
  status,
}) => {
  const { user, profile } = useAuth()
  const { data: messages = [] } = useBookingMessages(isOpen ? bookingId : undefined)
  const sendMessage = useSendBookingMessage()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  if (!isOpen) return null

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !user?.id) return

    await sendMessage.mutateAsync({
      booking_id: bookingId,
      booking_type: bookingType,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Farmer',
      message: inputText.trim(),
    })
    setInputText('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg h-[600px] flex flex-col rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--forest)]">
              <MessageSquare className="w-5 h-5 text-[var(--forest)]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--ink)] line-clamp-1">{title}</h4>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span>With: <strong className="text-[var(--ink)]">{counterpartyName}</strong></span>
                <span>&bull;</span>
                <span className="capitalize px-1.5 py-0.2 rounded bg-[var(--surface-alt)] text-[var(--forest)] font-bold text-[10px]">
                  {status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisory banner */}
        <div className="px-4 py-2 bg-[var(--surface-alt)] border-b border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
          <span>Keep coordination chats polite. Avoid sharing one-time OTP passwords.</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--bg-page)]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--muted)] text-xs">
              <MessageSquare className="w-8 h-8 text-[var(--line)] mb-2" />
              <p className="font-semibold text-[var(--ink)]">No messages yet</p>
              <p className="text-[11px] mt-0.5">
                Send a message to coordinate arrival time, exact field location, or fuel terms.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-[var(--muted)] mb-0.5 px-1">
                    {isMe ? 'You' : msg.sender_name} &bull;{' '}
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? 'bg-[var(--ink)] text-[var(--white)] rounded-br-none shadow-sm'
                        : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--line)] bg-[var(--surface)] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-full border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputText.trim() || sendMessage.isPending}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[var(--ink)]" />
          </Button>
        </form>
      </div>
    </div>
  )
}
