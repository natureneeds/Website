import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import type { CartItem, UserAddress, Order } from '@/lib/supabase/types'
import { SEEDED_PRODUCTS } from '@/lib/data/seedMarketplace'

// ============================================================================
// 1. CART API & HOOKS
// ============================================================================

export const fetchCart = async (userId: string | undefined): Promise<CartItem[]> => {
  if (!userId) return []

  if (!isMockAuth) {
    try {
      // Find or create cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: userId })
          .select('id')
          .single()
        if (createError) throw createError
        cart = newCart
      }

      if (cart) {
        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select('id, cart_id, product_id, qty, created_at, product:products(id, name, brand, price, mrp, unit, stock, images, category_id)')
          .eq('cart_id', cart.id)

        if (!itemsError && items) {
          return items.map((i: any) => ({
            id: i.id,
            cart_id: i.cart_id,
            product_id: i.product_id,
            qty: i.qty,
            created_at: i.created_at,
            product: i.product,
          }))
        }
      }
    } catch (err) {
      console.warn('Live cart fetch failed, falling back to mockDb:', err)
    }
  }

  return mockDb.getCart(userId)
}

export const useCart = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => fetchCart(user?.id),
    enabled: Boolean(user?.id),
    staleTime: 10 * 1000,
  })
}

export const useAddToCart = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, qty = 1 }: { productId: string; qty?: number }) => {
      if (!user) throw new Error('Authentication required to add to cart.')

      if (!isMockAuth) {
        try {
          let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle()
          if (!cart) {
            const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single()
            cart = newCart
          }

          if (cart) {
            const { data: existing } = await supabase
              .from('cart_items')
              .select('id, qty')
              .eq('cart_id', cart.id)
              .eq('product_id', productId)
              .maybeSingle()

            if (existing) {
              await supabase
                .from('cart_items')
                .update({ qty: existing.qty + qty })
                .eq('id', existing.id)
            } else {
              await supabase
                .from('cart_items')
                .insert({ cart_id: cart.id, product_id: productId, qty })
            }
            return
          }
        } catch {
          // fallback to mockDb
        }
      }

      mockDb.addToCart(user.id, productId, qty)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] })
    },
  })
}

export const useUpdateCartQty = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      if (!user) return

      if (!isMockAuth) {
        try {
          const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle()
          if (cart) {
            if (qty <= 0) {
              await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId)
            } else {
              await supabase
                .from('cart_items')
                .update({ qty })
                .eq('cart_id', cart.id)
                .eq('product_id', productId)
            }
            return
          }
        } catch {
          // fallback
        }
      }

      mockDb.updateCartQty(user.id, productId, qty)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] })
    },
  })
}

export const useRemoveFromCart = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return

      if (!isMockAuth) {
        try {
          const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle()
          if (cart) {
            await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId)
            return
          }
        } catch {
          // fallback
        }
      }

      mockDb.removeFromCart(user.id, productId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] })
    },
  })
}

// ============================================================================
// 2. ADDRESS BOOK API & HOOKS
// ============================================================================

export const fetchAddresses = async (userId: string | undefined): Promise<UserAddress[]> => {
  if (!userId) return []

  if (!isMockAuth) {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data as UserAddress[]
      }
    } catch {
      // fallback
    }
  }

  return mockDb.getAddresses(userId)
}

export const useAddresses = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => fetchAddresses(user?.id),
    enabled: Boolean(user?.id),
    staleTime: 30 * 1000,
  })
}

export const useSaveAddress = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: Partial<UserAddress> & {
      full_name: string
      phone: string
      village: string
      district: string
      state: string
      pincode: string
    }) => {
      if (!user) throw new Error('Authentication required')

      if (!isMockAuth) {
        try {
          if (address.id) {
            const { data, error } = await supabase
              .from('user_addresses')
              .update({
                full_name: address.full_name,
                phone: address.phone,
                village: address.village,
                landmark: address.landmark,
                district: address.district,
                state: address.state,
                pincode: address.pincode,
                is_default: address.is_default || false,
                updated_at: new Date().toISOString(),
              })
              .eq('id', address.id)
              .select('*')
              .single()
            if (!error && data) return data as UserAddress
          } else {
            const { data, error } = await supabase
              .from('user_addresses')
              .insert({
                user_id: user.id,
                full_name: address.full_name,
                phone: address.phone,
                village: address.village,
                landmark: address.landmark,
                district: address.district,
                state: address.state,
                pincode: address.pincode,
                is_default: address.is_default || false,
              })
              .select('*')
              .single()
            if (!error && data) return data as UserAddress
          }
        } catch {
          // fallback
        }
      }

      return mockDb.saveAddress(user.id, address)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] })
    },
  })
}

export const useDeleteAddress = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) return

      if (!isMockAuth) {
        try {
          await supabase.from('user_addresses').delete().eq('id', addressId)
          return
        } catch {
          // fallback
        }
      }

      mockDb.deleteAddress(user.id, addressId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] })
    },
  })
}

export const useSetDefaultAddress = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) return

      if (!isMockAuth) {
        try {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id)
          await supabase.from('user_addresses').update({ is_default: true }).eq('id', addressId)
          return
        } catch {
          // fallback
        }
      }

      mockDb.setDefaultAddress(user.id, addressId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] })
    },
  })
}

// ============================================================================
// 3. CHECKOUT & ORDERS API
// ============================================================================

export interface CreateOrderParams {
  items: Array<{ product_id: string; qty: number }>
  shipping_address: UserAddress
  payment_method: 'razorpay' | 'cod'
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

// Edge Function: create-razorpay-order with server-calculated price
export const createRazorpayOrder = async (
  items: Array<{ product_id: string; qty: number }>
) => {
  if (!isMockAuth) {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { items },
      })
      if (!error && data && data.success) {
        return data
      }
    } catch (err) {
      console.warn('Edge function create-razorpay-order failed, using local server simulation:', err)
    }
  }

  // Server price calculation simulation (never trust client)
  let subtotal = 0
  for (const item of items) {
    const prod = SEEDED_PRODUCTS.find((p) => p.id === item.product_id)
    if (prod) {
      subtotal += prod.price * item.qty
    }
  }

  const deliveryFee = subtotal >= 500 ? 0 : 40
  const totalAmount = subtotal + deliveryFee

  return {
    success: true,
    order_id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    key_id: 'rzp_test_kisan_dev',
    subtotal,
    delivery_fee: deliveryFee,
    total_amount: totalAmount,
  }
}

// Verify payment server-side and place order atomically with stock decrement
export const verifyAndPlaceOrder = async (
  userId: string,
  params: CreateOrderParams
): Promise<{ success: boolean; order?: Order; error?: string }> => {
  if (!isMockAuth) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_order_id: params.razorpay_order_id,
          razorpay_payment_id: params.razorpay_payment_id,
          razorpay_signature: params.razorpay_signature,
          payment_method: params.payment_method,
          items: params.items,
          shipping_address: params.shipping_address,
        },
      })

      if (!error && data && data.success) {
        return { success: true, order: data.order }
      }
    } catch (err) {
      console.warn('verify-razorpay-payment edge function failed, falling back to mockDb:', err)
    }
  }

  // Atomic order creation & stock drop in mockDb
  return mockDb.createOrderAtomic(userId, params)
}

// ============================================================================
// 4. ORDERS & TIMELINE API
// ============================================================================

export const fetchOrders = async (userId: string | undefined): Promise<Order[]> => {
  if (!userId) return []

  if (!isMockAuth) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, user_id, total_amount, status, shipping_address, payment_method, payment_status,
          razorpay_order_id, razorpay_payment_id, created_at, updated_at,
          items:order_items(id, order_id, product_id, qty, price, product:products(id, name, brand, price, unit, images)),
          events:order_events(id, order_id, status, time)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data as unknown as Order[]
      }
    } catch {
      // fallback
    }
  }

  return mockDb.getOrders(userId)
}

export const fetchOrderById = async (
  userId: string | undefined,
  orderId: string | undefined
): Promise<Order | null> => {
  if (!userId || !orderId) return null

  if (!isMockAuth) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, user_id, total_amount, status, shipping_address, payment_method, payment_status,
          razorpay_order_id, razorpay_payment_id, created_at, updated_at,
          items:order_items(id, order_id, product_id, qty, price, product:products(id, name, brand, price, unit, images)),
          events:order_events(id, order_id, status, time)
        `)
        .eq('user_id', userId)
        .eq('id', orderId)
        .maybeSingle()

      if (!error && data) {
        return data as unknown as Order
      }
    } catch {
      // fallback
    }
  }

  return mockDb.getOrderById(userId, orderId)
}

export const useOrders = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetchOrders(user?.id),
    enabled: Boolean(user?.id),
    staleTime: 10 * 1000,
  })
}

export const useOrder = (orderId: string | undefined) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['order', user?.id, orderId],
    queryFn: () => fetchOrderById(user?.id, orderId),
    enabled: Boolean(user?.id && orderId),
    staleTime: 5 * 1000,
  })
}

export const useAdvanceOrderStatus = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      nextStatus,
    }: {
      orderId: string
      nextStatus: 'packed' | 'shipped' | 'delivered'
    }) => {
      if (!user) throw new Error('Auth required')

      if (!isMockAuth) {
        try {
          await supabase.from('orders').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
          await supabase.from('order_events').insert({ order_id: orderId, status: nextStatus })
          return
        } catch {
          // fallback
        }
      }

      return mockDb.advanceOrderStatus(user.id, orderId, nextStatus)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['order', user?.id, variables.orderId] })
    },
  })
}
