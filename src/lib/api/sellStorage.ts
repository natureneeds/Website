import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import {
  type MandiPriceItem,
  type ProduceListingItem,
  type ProduceOfferItem,
  type WarehouseItem,
} from '@/lib/data/seedSellStorage'

// ============================================================================
// 1. MANDI PRICES
// ============================================================================

export const useMandiPrices = (district?: string) => {
  return useQuery({
    queryKey: ['mandi-prices', district],
    queryFn: async (): Promise<MandiPriceItem[]> => {
      if (!isMockAuth) {
        try {
          let query = supabase.from('mandi_prices').select('*')
          if (district && district !== 'all') {
            query = query.ilike('market', `%${district}%`)
          }
          const { data, error } = await query
          if (!error && data && data.length > 0) {
            return data as any
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getMandiPrices(district)
    },
    staleTime: 60 * 1000,
  })
}

// ============================================================================
// 2. PRODUCE LISTINGS & BUYER OFFERS
// ============================================================================

export const useProduceListings = (district?: string) => {
  return useQuery({
    queryKey: ['produce-listings', district],
    queryFn: async (): Promise<ProduceListingItem[]> => {
      if (!isMockAuth) {
        try {
          let query = supabase.from('produce_listings').select('*').order('created_at', { ascending: false })
          if (district && district !== 'all') {
            query = query.ilike('district', district)
          }
          const { data, error } = await query
          if (!error && data) {
            return data as any
          }
        } catch {
          // fallback
        }
      }
      return mockDb.getProduceListings(district)
    },
  })
}

export const useCreateProduceListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      listing: Omit<ProduceListingItem, 'id' | 'created_at' | 'status'>
    ) => {
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('produce_listings')
            .insert({ ...listing, status: 'active' })
            .select('*')
            .single()
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.createProduceListing(listing)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce-listings'] })
    },
  })
}

export const useProduceOffers = (listingId?: string, userId?: string) => {
  return useQuery({
    queryKey: ['produce-offers', listingId, userId],
    queryFn: async (): Promise<ProduceOfferItem[]> => {
      return mockDb.getProduceOffers(listingId, userId)
    },
    refetchInterval: 4000, // live poll for offers and accepts
  })
}

export const useCreateProduceOffer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      offer: Omit<ProduceOfferItem, 'id' | 'created_at' | 'status'>
    ) => {
      return mockDb.createProduceOffer(offer)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produce-offers', variables.listing_id] })
      queryClient.invalidateQueries({ queryKey: ['produce-listings'] })
    },
  })
}

export const useUpdateProduceOfferStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
      counterPrice,
    }: {
      offerId: string
      status: ProduceOfferItem['status']
      counterPrice?: number
    }) => {
      mockDb.updateProduceOfferStatus(offerId, status, counterPrice)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce-offers'] })
      queryClient.invalidateQueries({ queryKey: ['produce-listings'] })
    },
  })
}

// ============================================================================
// 3. WAREHOUSES & BOOKINGS
// ============================================================================

export const useWarehouses = (district?: string) => {
  return useQuery({
    queryKey: ['warehouses', district],
    queryFn: async (): Promise<WarehouseItem[]> => {
      return mockDb.getWarehouses(district)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useWarehouseBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['warehouse-bookings', userId],
    queryFn: async () => {
      if (!userId) return []
      return mockDb.getWarehouseBookings(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useCreateWarehouseBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (booking: {
      warehouse_id: string
      farmer_id: string
      farmer_name: string
      farmer_phone: string
      crop_name: string
      qty_quintals: number
      start_date: string
      months_count: number
      total_cost: number
    }) => {
      return mockDb.createWarehouseBooking(booking)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-bookings', variables.farmer_id] })
    },
  })
}
