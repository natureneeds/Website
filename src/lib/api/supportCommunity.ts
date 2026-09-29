import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import type {
  SupportTicket,
  SupportTicketMessage,
  CommunityPost,
  CommunityComment,
} from '@/lib/data/seedSupportCommunity'

// ============================================================================
// 1. SUPPORT TICKETS
// ============================================================================

export const useSupportTickets = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!isMockAuth && user?.id) {
        try {
          const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.getSupportTickets(user?.id)
    },
    staleTime: 5000,
  })
}

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>
    ): Promise<SupportTicket> => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('support_tickets')
            .insert(ticket)
            .select('*')
            .single()
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.createSupportTicket(ticket)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

// ============================================================================
// 2. TICKET MESSAGES (THREAD WITH REALTIME UPDATES)
// ============================================================================

export const useTicketMessages = (ticketId: string | undefined) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async (): Promise<SupportTicketMessage[]> => {
      if (!ticketId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('support_ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.getTicketMessages(ticketId)
    },
    enabled: Boolean(ticketId),
    refetchInterval: 3000, // Live poll fallback
  })

  // Realtime subscription (Supabase channel + custom DOM event)
  useEffect(() => {
    if (!ticketId) return

    // 1. Local realtime DOM event listener
    const handleLocalRealtime = (e: Event) => {
      const customEvent = e as CustomEvent<SupportTicketMessage>
      if (customEvent.detail && customEvent.detail.ticket_id === ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      }
    }
    window.addEventListener('kisan_ticket_message', handleLocalRealtime)

    // 2. Supabase Realtime channel if not in mock mode
    let channel: any = null
    if (!isMockAuth) {
      channel = supabase
        .channel(`ticket_${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_ticket_messages',
            filter: `ticket_id=eq.${ticketId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
          }
        )
        .subscribe()
    }

    return () => {
      window.removeEventListener('kisan_ticket_message', handleLocalRealtime)
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [ticketId, queryClient])

  return query
}

export const useCreateTicketMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      msg: Omit<SupportTicketMessage, 'id' | 'created_at'>
    ): Promise<SupportTicketMessage> => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('support_ticket_messages')
            .insert(msg)
            .select('*')
            .single()
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.createTicketMessage(msg)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', data.ticket_id] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

// ============================================================================
// 3. COMMUNITY POSTS, UPVOTES & COMMENTS
// ============================================================================

export const useCommunityPosts = (cropTag?: string) => {
  return useQuery({
    queryKey: ['community-posts', cropTag],
    queryFn: async (): Promise<CommunityPost[]> => {
      if (!isMockAuth) {
        try {
          let q = supabase.from('community_posts').select('*').order('created_at', { ascending: false })
          if (cropTag && cropTag !== 'all') {
            q = q.ilike('crop_tag', `%${cropTag}%`)
          }
          const { data, error } = await q
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.getCommunityPosts(cropTag)
    },
    staleTime: 5000,
  })
}

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      post: Omit<
        CommunityPost,
        'id' | 'upvotes_count' | 'upvoted_by' | 'reported_by' | 'comments_count' | 'created_at'
      >
    ): Promise<CommunityPost> => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('community_posts')
            .insert({ ...post, upvotes_count: 0, upvoted_by: [], reported_by: [], comments_count: 0 })
            .select('*')
            .single()
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.createCommunityPost(post)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })
}

export const useUpvoteCommunityPost = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (postId: string) => {
      const uId = user?.id || 'usr_OTg3NjU0MzIxMA00'
      mockDb.upvoteCommunityPost(postId, uId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })
}

export const useReportCommunityPost = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (postId: string) => {
      const uId = user?.id || 'usr_OTg3NjU0MzIxMA00'
      mockDb.reportCommunityPost(postId, uId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })
}

export const useCommunityComments = (postId: string | undefined) => {
  return useQuery({
    queryKey: ['community-comments', postId],
    queryFn: async (): Promise<CommunityComment[]> => {
      if (!postId) return []
      return mockDb.getCommunityComments(postId)
    },
    enabled: Boolean(postId),
  })
}

export const useCreateCommunityComment = () => {
  const queryClient = useQueryClient()
  const { user, profile } = useAuth()

  return useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment: string }) => {
      const uId = user?.id || 'usr_OTg3NjU0MzIxMA00'
      const authorName = profile?.full_name || 'Farmer Contributor'
      return mockDb.createCommunityComment(postId, uId, authorName, comment)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
  })
}
