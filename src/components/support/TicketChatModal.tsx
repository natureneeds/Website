import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTicketMessages, useCreateTicketMessage } from '@/lib/api/supportCommunity'
import { useAuth } from '@/context/AuthContext'
import type { SupportTicket } from '@/lib/data/seedSupportCommunity'

interface TicketChatModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: SupportTicket | null
}

export const TicketChatModal: React.FC<TicketChatModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const { user, profile } = useAuth()
  const { data: messages = [], isLoading } = useTicketMessages(ticket?.id)
  const createMessage = useCreateTicketMessage()

  const [inputMsg, setInputMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  if (!isOpen || !ticket) return null

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || !user?.id) return

    const text = inputMsg.trim()
    setInputMsg('')

    await createMessage.mutateAsync({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Farmer',
      sender_role: 'farmer',
      message: text,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-xl h-[85vh] flex flex-col rounded-3xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]">
                Ticket #{ticket.id.substring(4, 9)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  ticket.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--ink)] line-clamp-1">
              {ticket.subject}
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Category: {ticket.category.toUpperCase()} &bull; Live Realtime Channel Active
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1.5 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--bg-page)]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              Loading ticket conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              No messages yet in this ticket.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_role === 'farmer'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] px-1">
                    {!isMe && (
                      <span className="flex items-center gap-1 font-bold text-[var(--forest)]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {msg.sender_name}
                      </span>
                    )}
                    {isMe && <span className="font-semibold text-[var(--ink)]">You</span>}
                    <span>&bull;</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[var(--forest)] text-white rounded-tr-none'
                        : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>

                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-black/10 flex gap-2">
                        {msg.attachments.map((att, idx) => (
                          <img
                            key={idx}
                            src={att}
                            alt="Attachment"
                            className="w-20 h-20 rounded-lg object-cover border border-white/20"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t border-[var(--line)] bg-[var(--surface)] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your reply to the agronomist..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[var(--bg-page)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={createMessage.isPending || !inputMsg.trim()}
            className="rounded-full px-4 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
