import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import type {
  RentalListing,
  RentalBooking,
  LabourListing,
  LabourBooking,
  BookingMessage,
  BookingReview,
} from '@/lib/supabase/types'

// ============================================================================
// 1. RENTAL LISTINGS & BOOKINGS
// ============================================================================

export const useRentalListings = (filters?: {
  district?: string
  type?: string
  date?: string
}) => {
  return useQuery({
    queryKey: ['rental-listings', filters],
    queryFn: async (): Promise<RentalListing[]> => {
      if (!isMockAuth) {
        try {
          let query = supabase.from('rental_listings').select('*').eq('availability', true)
          if (filters?.district && filters.district !== 'all') {
            query = query.ilike('district', filters.district)
          }
          if (filters?.type && filters.type !== 'all') {
            query = query.eq('type', filters.type)
          }
          const { data, error } = await query.order('created_at', { ascending: false })
          if (!error && data && data.length > 0) {
            return data as RentalListing[]
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getRentalListings(filters)
    },
  })
}

export const useCreateRentalListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      listing: Omit<RentalListing, 'id' | 'created_at' | 'rating' | 'review_count'>
    ) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('rental_listings')
            .insert({
              owner_id: listing.owner_id,
              owner_name: listing.owner_name,
              owner_phone: listing.owner_phone,
              type: listing.type,
              title: listing.title,
              description: listing.description,
              price: listing.price,
              price_unit: listing.price_unit,
              district: listing.district,
              area_served: listing.area_served,
              images: listing.images,
              specs: listing.specs,
              availability: true,
            })
            .select('*')
            .single()

          if (!error && data) {
            return data as RentalListing
          }
        } catch {
          // fallback
        }
      }
      return mockDb.addRentalListing(listing)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-listings'] })
    },
  })
}

export const useRentalBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['rental-bookings', userId],
    queryFn: async (): Promise<RentalBooking[]> => {
      if (!userId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('rental_bookings')
            .select('*, listing:rental_listings(*)')
            .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
            .order('created_at', { ascending: false })

          if (!error && data) {
            return data as RentalBooking[]
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getRentalBookings(userId)
    },
    enabled: Boolean(userId),
    refetchInterval: 5000, // Live poll for status changes
  })
}

export const useCreateRentalBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      booking: Omit<RentalBooking, 'id' | 'created_at' | 'listing'>
    ) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('rental_bookings')
            .insert({
              listing_id: booking.listing_id,
              renter_id: booking.renter_id,
              owner_id: booking.owner_id,
              renter_name: booking.renter_name,
              renter_phone: booking.renter_phone,
              start_date: booking.start_date,
              end_date: booking.end_date,
              hours_or_days: booking.hours_or_days,
              total_price: booking.total_price,
              status: 'requested',
              notes: booking.notes,
            })
            .select('*, listing:rental_listings(*)')
            .single()

          if (!error && data) {
            return data as RentalBooking
          }
        } catch {
          // fallback
        }
      }
      return mockDb.createRentalBooking(booking)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rental-bookings', variables.renter_id] })
      queryClient.invalidateQueries({ queryKey: ['rental-bookings', variables.owner_id] })
    },
  })
}

export const useUpdateRentalBookingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
      declineReason,
    }: {
      bookingId: string
      status: RentalBooking['status']
      declineReason?: string
    }) => {
      if (!isMockAuth) {
        try {
          await supabase
            .from('rental_bookings')
            .update({ status, decline_reason: declineReason, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
        } catch {
          // fallback
        }
      }
      mockDb.updateRentalBookingStatus(bookingId, status, declineReason)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['rental-listings'] })
    },
  })
}

// ============================================================================
// 2. LABOUR LISTINGS & BOOKINGS
// ============================================================================

export const useLabourListings = (filters?: {
  district?: string
  skill?: string
  date?: string
}) => {
  return useQuery({
    queryKey: ['labour-listings', filters],
    queryFn: async (): Promise<LabourListing[]> => {
      if (!isMockAuth) {
        try {
          let query = supabase.from('labour_listings').select('*').eq('availability', true)
          if (filters?.district && filters.district !== 'all') {
            query = query.ilike('district', filters.district)
          }
          const { data, error } = await query.order('created_at', { ascending: false })
          if (!error && data && data.length > 0) {
            let res = data as LabourListing[]
            if (filters?.skill && filters.skill !== 'all') {
              res = res.filter((l) =>
                l.skills.some((s) => s.toLowerCase().includes(filters.skill!.toLowerCase()))
              )
            }
            return res
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getLabourListings(filters)
    },
  })
}

export const useCreateLabourListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      listing: Omit<LabourListing, 'id' | 'created_at' | 'rating' | 'review_count'>
    ) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('labour_listings')
            .insert({
              leader_id: listing.leader_id,
              leader_name: listing.leader_name,
              leader_phone: listing.leader_phone,
              title: listing.title,
              description: listing.description,
              skills: listing.skills,
              group_size: listing.group_size,
              daily_rate: listing.daily_rate,
              district: listing.district,
              area_served: listing.area_served,
              photos: listing.photos,
              availability: true,
            })
            .select('*')
            .single()

          if (!error && data) {
            return data as LabourListing
          }
        } catch {
          // fallback
        }
      }
      return mockDb.addLabourListing(listing)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-listings'] })
    },
  })
}

export const useLabourBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['labour-bookings', userId],
    queryFn: async (): Promise<LabourBooking[]> => {
      if (!userId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('labour_bookings')
            .select('*, listing:labour_listings(*)')
            .or(`farmer_id.eq.${userId},leader_id.eq.${userId}`)
            .order('created_at', { ascending: false })

          if (!error && data) {
            return data as LabourBooking[]
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getLabourBookings(userId)
    },
    enabled: Boolean(userId),
    refetchInterval: 5000,
  })
}

export const useCreateLabourBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      booking: Omit<LabourBooking, 'id' | 'created_at' | 'listing'>
    ) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('labour_bookings')
            .insert({
              listing_id: booking.listing_id,
              farmer_id: booking.farmer_id,
              leader_id: booking.leader_id,
              farmer_name: booking.farmer_name,
              farmer_phone: booking.farmer_phone,
              start_date: booking.start_date,
              days_count: booking.days_count,
              total_amount: booking.total_amount,
              status: 'requested',
              notes: booking.notes,
            })
            .select('*, listing:labour_listings(*)')
            .single()

          if (!error && data) {
            return data as LabourBooking
          }
        } catch {
          // fallback
        }
      }
      return mockDb.createLabourBooking(booking)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['labour-bookings', variables.farmer_id] })
      queryClient.invalidateQueries({ queryKey: ['labour-bookings', variables.leader_id] })
    },
  })
}

export const useUpdateLabourBookingStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
      declineReason,
    }: {
      bookingId: string
      status: LabourBooking['status']
      declineReason?: string
    }) => {
      if (!isMockAuth) {
        try {
          await supabase
            .from('labour_bookings')
            .update({ status, decline_reason: declineReason, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
        } catch {
          // fallback
        }
      }
      mockDb.updateLabourBookingStatus(bookingId, status, declineReason)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['labour-listings'] })
    },
  })
}

// ============================================================================
// 3. BOOKING CHAT THREADS
// ============================================================================

export const useBookingMessages = (bookingId: string | undefined) => {
  return useQuery({
    queryKey: ['booking-messages', bookingId],
    queryFn: async (): Promise<BookingMessage[]> => {
      if (!bookingId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('booking_messages')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true })

          if (!error && data) {
            return data as BookingMessage[]
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getBookingMessages(bookingId)
    },
    enabled: Boolean(bookingId),
    refetchInterval: 3000, // Live chat polling
  })
}

export const useSendBookingMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (msg: Omit<BookingMessage, 'id' | 'created_at'>) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('booking_messages')
            .insert(msg)
            .select('*')
            .single()

          if (!error && data) {
            return data as BookingMessage
          }
        } catch {
          // fallback
        }
      }
      return mockDb.sendBookingMessage(msg)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking-messages', variables.booking_id] })
    },
  })
}

// ============================================================================
// 4. RATINGS & REVIEWS
// ============================================================================

export const useListingReviews = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: async (): Promise<BookingReview[]> => {
      if (!listingId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('booking_reviews')
            .select('*')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false })

          if (!error && data) {
            return data as BookingReview[]
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getListingReviews(listingId)
    },
    enabled: Boolean(listingId),
  })
}

export const useAddBookingReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: Omit<BookingReview, 'id' | 'created_at'>) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('booking_reviews')
            .insert(review)
            .select('*')
            .single()

          if (!error && data) {
            return data as BookingReview
          }
        } catch {
          // fallback
        }
      }
      return mockDb.addBookingReview(review)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing-reviews', variables.listing_id] })
      queryClient.invalidateQueries({ queryKey: ['rental-listings'] })
      queryClient.invalidateQueries({ queryKey: ['labour-listings'] })
    },
  })
}
