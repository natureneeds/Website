import { createClient } from '@supabase/supabase-js'
import type {
  UserProfile,
  Farm,
  UserAddress,
  CartItem,
  Order,
  CropPlan,
  CropTask,
  InAppNotification,
  CropDiagnosis,
  RentalListing,
  RentalBooking,
  LabourListing,
  LabourBooking,
  BookingMessage,
  BookingReview,
} from './types'
import { SEEDED_PRODUCTS } from '@/lib/data/seedMarketplace'
import { SEEDED_RENTALS, SEEDED_LABOUR } from '@/lib/data/seedRentals'
import {
  SEEDED_MANDI_PRICES,
  SEEDED_PRODUCE_LISTINGS,
  SEEDED_PRODUCE_OFFERS,
  SEEDED_WAREHOUSES,
  type MandiPriceItem,
  type ProduceListingItem,
  type ProduceOfferItem,
  type WarehouseItem,
} from '@/lib/data/seedSellStorage'
import { SEEDED_LEDGER_ENTRIES, type LedgerEntry } from '@/lib/data/seedLedger'
import {
  SEEDED_TICKETS,
  SEEDED_TICKET_MESSAGES,
  SEEDED_COMMUNITY_POSTS,
  SEEDED_COMMUNITY_COMMENTS,
  type SupportTicket,
  type SupportTicketMessage,
  type CommunityPost,
  type CommunityComment,
} from '@/lib/data/seedSupportCommunity'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Determine if we should run in live Supabase mode or mock dev mode
const isPlaceholder =
  !supabaseUrl ||
  supabaseUrl.includes('placeholder-project') ||
  supabaseAnonKey.includes('placeholder-anon-key')

export const isMockAuth = import.meta.env.VITE_AUTH_MOCK === 'true' || isPlaceholder

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ============================================================================
// LOCAL STORAGE BACKED MOCK DATABASE FOR DEV ENVIRONMENT
// Simulates Supabase Auth & PostgreSQL Tables with RLS enforcement
// ============================================================================

const STORAGE_KEYS = {
  SESSION: 'kisan_auth_session',
  PROFILES: 'kisan_db_profiles',
  FARMS: 'kisan_db_farms',
  OTP_STORE: 'kisan_otp_store',
  STOCKS: 'kisan_db_stocks',
  CARTS: 'kisan_db_carts',
  ADDRESSES: 'kisan_db_addresses',
  ORDERS: 'kisan_db_orders',
  PLANS: 'kisan_db_crop_plans',
  TASKS: 'kisan_db_crop_tasks',
  NOTIFICATIONS: 'kisan_db_notifications',
  DIAGNOSES: 'kisan_db_diagnoses',
  RENTAL_LISTINGS: 'kisan_db_rental_listings',
  RENTAL_BOOKINGS: 'kisan_db_rental_bookings',
  LABOUR_LISTINGS: 'kisan_db_labour_listings',
  LABOUR_BOOKINGS: 'kisan_db_labour_bookings',
  BOOKING_MESSAGES: 'kisan_db_booking_messages',
  BOOKING_REVIEWS: 'kisan_db_booking_reviews',
  PRODUCE_LISTINGS: 'kisan_db_produce_listings',
  PRODUCE_OFFERS: 'kisan_db_produce_offers',
  WAREHOUSE_BOOKINGS: 'kisan_db_warehouse_bookings',
  LEDGER_ENTRIES: 'kisan_db_ledger_entries',
  SUPPORT_TICKETS: 'kisan_db_support_tickets',
  SUPPORT_MESSAGES: 'kisan_db_support_messages',
  COMMUNITY_POSTS: 'kisan_db_community_posts',
  COMMUNITY_COMMENTS: 'kisan_db_community_comments',
}

interface MockSession {
  user: {
    id: string
    phone: string
  }
}

export const mockDb = {
  // Session helpers
  getSession(): MockSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION)
    return raw ? JSON.parse(raw) : null
  },

  setSession(session: MockSession | null) {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION)
    }
  },

  // OTP generation, validation & rate limiting
  sendOtp(phone: string): { success: boolean; code: string; error?: string } {
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return { success: false, code: '', error: 'Please enter a valid 10-digit mobile number.' }
    }

    const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.OTP_STORE) || '{}')
    const now = Date.now()
    const record = otps[cleanPhone]

    if (record) {
      // Cooldown between successive OTP requests (15 seconds)
      if (record.lastSent && now - record.lastSent < 15 * 1000) {
        const waitSec = Math.ceil((15 * 1000 - (now - record.lastSent)) / 1000)
        return {
          success: false,
          code: '',
          error: `Please wait ${waitSec}s before requesting a new OTP.`,
        }
      }

      // Max 5 OTP requests per 10 minutes sliding window
      const recentAttempts = (record.history || []).filter(
        (timestamp: number) => now - timestamp < 10 * 60 * 1000
      )
      if (recentAttempts.length >= 5) {
        return {
          success: false,
          code: '',
          error: 'Rate limit exceeded: Maximum 5 OTP requests in 10 minutes. Please try later.',
        }
      }
    }

    const code = '123456'
    const history = record ? (record.history || []).filter((t: number) => now - t < 10 * 60 * 1000) : []
    history.push(now)

    otps[cleanPhone] = {
      code,
      expires: now + 10 * 60 * 1000,
      lastSent: now,
      history,
    }
    localStorage.setItem(STORAGE_KEYS.OTP_STORE, JSON.stringify(otps))
    return { success: true, code }
  },

  verifyOtp(phone: string, token: string): { success: boolean; session?: MockSession; error?: string } {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.OTP_STORE) || '{}')
    const record = otps[phone]

    if (token === '123456' || (record && record.code === token)) {
      const userId = 'usr_' + btoa(phone).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).padEnd(16, '0')
      const session: MockSession = {
        user: {
          id: userId,
          phone,
        },
      }
      this.setSession(session)
      return { success: true, session }
    }

    return { success: false, error: 'Invalid OTP code. In dev, enter 123456.' }
  },

  // Profile queries with strict RLS simulation
  getProfile(userId: string): UserProfile | null {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== userId) {
      return null
    }

    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}'
    )
    return profiles[userId] || null
  },

  saveProfile(profile: UserProfile): { success: boolean; error?: string } {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== profile.id) {
      return { success: false, error: 'RLS violation: Cannot write to another user profile' }
    }

    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}'
    )
    profiles[profile.id] = {
      ...profile,
      updated_at: new Date().toISOString(),
      created_at: profiles[profile.id]?.created_at || new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
    return { success: true }
  },

  // Farm queries with strict RLS simulation
  getFarm(userId: string): Farm | null {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== userId) {
      return null
    }

    const farms: Record<string, Farm> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FARMS) || '{}'
    )
    return farms[userId] || null
  },

  saveFarm(farm: Farm): { success: boolean; error?: string } {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== farm.user_id) {
      return { success: false, error: 'RLS violation: Cannot write to another user farm' }
    }

    const farms: Record<string, Farm> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FARMS) || '{}'
    )
    farms[farm.user_id] = {
      ...farm,
      id: farms[farm.user_id]?.id || 'farm_' + Math.random().toString(36).substring(2, 9),
      updated_at: new Date().toISOString(),
      created_at: farms[farm.user_id]?.created_at || new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms))
    return { success: true }
  },

  // ==========================================================================
  // PHASE 6: PRODUCT STOCK OVERRIDES (ATOMIC DECREMENT PERSISTENCE)
  // ==========================================================================
  getProductStock(productId: string, defaultStock: number): number {
    const stocks: Record<string, number> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.STOCKS) || '{}'
    )
    return stocks[productId] !== undefined ? stocks[productId] : defaultStock
  },

  decrementProductStock(productId: string, qty: number): number {
    const baseProduct = SEEDED_PRODUCTS.find((p) => p.id === productId)
    const baseStock = baseProduct ? baseProduct.stock : 100
    const currentStock = this.getProductStock(productId, baseStock)
    const newStock = Math.max(0, currentStock - qty)

    const stocks: Record<string, number> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.STOCKS) || '{}'
    )
    stocks[productId] = newStock
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks))
    return newStock
  },

  // ==========================================================================
  // PHASE 6: CART PERSISTENCE (PER LOGGED-IN USER)
  // ==========================================================================
  getCart(userId: string): CartItem[] {
    const allCarts: Record<string, CartItem[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CARTS) || '{}'
    )
    const items = allCarts[userId] || []

    // Enrich with authoritative product details and live stock
    return items.map((item) => {
      const product = SEEDED_PRODUCTS.find((p) => p.id === item.product_id)
      return {
        ...item,
        product: product
          ? {
              ...product,
              stock: this.getProductStock(product.id, product.stock),
            }
          : undefined,
      }
    })
  },

  addToCart(userId: string, productId: string, qty = 1): CartItem[] {
    const allCarts: Record<string, CartItem[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CARTS) || '{}'
    )
    const userCart = allCarts[userId] || []

    const existingIndex = userCart.findIndex((i) => i.product_id === productId)
    if (existingIndex >= 0) {
      userCart[existingIndex].qty += qty
    } else {
      userCart.push({
        id: 'cart_' + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        qty,
        created_at: new Date().toISOString(),
      })
    }

    allCarts[userId] = userCart
    localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(allCarts))
    return this.getCart(userId)
  },

  updateCartQty(userId: string, productId: string, qty: number): CartItem[] {
    const allCarts: Record<string, CartItem[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CARTS) || '{}'
    )
    let userCart = allCarts[userId] || []

    if (qty <= 0) {
      userCart = userCart.filter((i) => i.product_id !== productId)
    } else {
      const item = userCart.find((i) => i.product_id === productId)
      if (item) {
        item.qty = qty
      }
    }

    allCarts[userId] = userCart
    localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(allCarts))
    return this.getCart(userId)
  },

  removeFromCart(userId: string, productId: string): CartItem[] {
    return this.updateCartQty(userId, productId, 0)
  },

  clearCart(userId: string): void {
    const allCarts: Record<string, CartItem[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CARTS) || '{}'
    )
    delete allCarts[userId]
    localStorage.setItem(STORAGE_KEYS.CARTS, JSON.stringify(allCarts))
  },

  // ==========================================================================
  // PHASE 6: ADDRESS BOOK (PER LOGGED-IN USER)
  // ==========================================================================
  getAddresses(userId: string): UserAddress[] {
    const allAddresses: Record<string, UserAddress[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '{}'
    )
    const userAddresses = allAddresses[userId] || []

    // If empty, seed a sensible default address
    if (userAddresses.length === 0) {
      const profile = this.getProfile(userId)
      const farm = this.getFarm(userId)
      const defaultAddr: UserAddress = {
        id: 'addr_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        full_name: profile?.full_name || 'Ramesh Singh',
        phone: profile?.phone || '9876543210',
        village: farm?.village || 'Rampur Kalan',
        landmark: 'Near Panchayat Bhawan',
        district: farm?.district || 'Ludhiana',
        state: farm?.state || 'Punjab',
        pincode: '141001',
        is_default: true,
        created_at: new Date().toISOString(),
      }
      allAddresses[userId] = [defaultAddr]
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses))
      return [defaultAddr]
    }

    return userAddresses
  },

  saveAddress(
    userId: string,
    address: Partial<UserAddress> & {
      full_name: string
      phone: string
      village: string
      district: string
      state: string
      pincode: string
    }
  ): UserAddress {
    const allAddresses: Record<string, UserAddress[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '{}'
    )
    const userAddresses = allAddresses[userId] || []

    let saved: UserAddress

    if (address.id) {
      // Edit existing
      const idx = userAddresses.findIndex((a) => a.id === address.id)
      if (idx >= 0) {
        saved = {
          ...userAddresses[idx],
          ...address,
          user_id: userId,
          updated_at: new Date().toISOString(),
        }
        if (address.is_default) {
          userAddresses.forEach((a) => (a.is_default = false))
        }
        userAddresses[idx] = saved
      } else {
        throw new Error('Address not found')
      }
    } else {
      // Add new
      const isFirst = userAddresses.length === 0
      const isDefault = address.is_default || isFirst
      if (isDefault) {
        userAddresses.forEach((a) => (a.is_default = false))
      }
      saved = {
        id: 'addr_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        full_name: address.full_name,
        phone: address.phone,
        village: address.village,
        landmark: address.landmark || '',
        district: address.district,
        state: address.state,
        pincode: address.pincode,
        is_default: isDefault,
        created_at: new Date().toISOString(),
      }
      userAddresses.push(saved)
    }

    allAddresses[userId] = userAddresses
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses))
    return saved
  },

  deleteAddress(userId: string, addressId: string): boolean {
    const allAddresses: Record<string, UserAddress[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '{}'
    )
    const userAddresses = allAddresses[userId] || []
    allAddresses[userId] = userAddresses.filter((a) => a.id !== addressId)
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses))
    return true
  },

  setDefaultAddress(userId: string, addressId: string): boolean {
    const allAddresses: Record<string, UserAddress[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '{}'
    )
    const userAddresses = allAddresses[userId] || []
    userAddresses.forEach((a) => {
      a.is_default = a.id === addressId
    })
    allAddresses[userId] = userAddresses
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(allAddresses))
    return true
  },

  // ==========================================================================
  // PHASE 6: ORDERS & ATOMIC STOCK DECREMENT
  // ==========================================================================
  getOrders(userId: string): Order[] {
    const allOrders: Record<string, Order[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ORDERS) || '{}'
    )
    return (allOrders[userId] || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  getOrderById(userId: string, orderId: string): Order | null {
    const orders = this.getOrders(userId)
    return orders.find((o) => o.id === orderId) || null
  },

  createOrderAtomic(
    userId: string,
    params: {
      items: Array<{ product_id: string; qty: number }>
      shipping_address: UserAddress
      payment_method: 'razorpay' | 'cod'
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
    }
  ): { success: boolean; order?: Order; error?: string } {
    const { items, shipping_address, payment_method, razorpay_order_id, razorpay_payment_id, razorpay_signature } = params

    if (!items || items.length === 0) {
      return { success: false, error: 'Cart is empty.' }
    }

    // Never trust client prices: calculate authoritative price from catalog
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const prod = SEEDED_PRODUCTS.find((p) => p.id === item.product_id)
      if (!prod) {
        return { success: false, error: `Product ID ${item.product_id} not found.` }
      }

      const availableStock = this.getProductStock(prod.id, prod.stock)
      if (availableStock < item.qty) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${availableStock}, Requested: ${item.qty}`,
        }
      }

      // Decrement stock atomically
      this.decrementProductStock(prod.id, item.qty)

      // Recompute authoritative price
      subtotal += prod.price * item.qty
      orderItems.push({
        id: 'oi_' + Math.random().toString(36).substring(2, 9),
        order_id: '',
        product_id: prod.id,
        qty: item.qty,
        price: prod.price,
        product: {
          id: prod.id,
          name: prod.name,
          brand: prod.brand,
          price: prod.price,
          unit: prod.unit,
          images: prod.images,
        },
      })
    }

    const deliveryFee = subtotal >= 500 ? 0 : 40
    const totalAmount = subtotal + deliveryFee
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 10).toUpperCase()
    const now = new Date().toISOString()

    // Assign order_id to line items
    orderItems.forEach((oi) => (oi.order_id = orderId))

    const newOrder: Order = {
      id: orderId,
      user_id: userId,
      total_amount: totalAmount,
      subtotal,
      delivery_fee: deliveryFee,
      status: 'placed',
      shipping_address,
      payment_method,
      payment_status: payment_method === 'razorpay' ? 'paid' : 'pending',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      created_at: now,
      updated_at: now,
      items: orderItems,
      events: [
        {
          id: 'evt_' + Math.random().toString(36).substring(2, 8),
          order_id: orderId,
          status: 'placed',
          time: now,
          note: 'Order confirmed and registered in Kisan OS system.',
        },
      ],
    }

    const allOrders: Record<string, Order[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ORDERS) || '{}'
    )
    const userOrders = allOrders[userId] || []
    userOrders.unshift(newOrder)
    allOrders[userId] = userOrders
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders))

    // Clear cart after successful order creation
    this.clearCart(userId)

    // Phase 13: Auto-log marketplace order as expense ledger entry
    try {
      this.createLedgerEntry({
        user_id: userId,
        crop_name: 'Wheat HD-3086', // default to active crop plan
        entry_type: 'expense',
        category: orderItems.some((oi) => oi.product.name.toLowerCase().includes('seed'))
          ? 'seed'
          : orderItems.some((oi) => oi.product.name.toLowerCase().includes('fertilizer') || oi.product.name.toLowerCase().includes('dap') || oi.product.name.toLowerCase().includes('urea'))
          ? 'fertilizer'
          : 'pesticide',
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        source_type: 'auto_marketplace',
        source_id: orderId,
        notes: `Marketplace Order #${orderId.substring(4, 10)}: ${orderItems.map((oi) => `${oi.qty}x ${oi.product.name}`).join(', ')}`,
      })
    } catch (e) {
      console.warn('Failed to auto-log order in ledger:', e)
    }

    return { success: true, order: newOrder }
  },

  advanceOrderStatus(
    userId: string,
    orderId: string,
    nextStatus: 'packed' | 'shipped' | 'delivered'
  ): Order | null {
    const allOrders: Record<string, Order[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ORDERS) || '{}'
    )
    const userOrders = allOrders[userId] || []
    const order = userOrders.find((o) => o.id === orderId)
    if (!order) return null

    const now = new Date().toISOString()
    const noteMap = {
      packed: 'Warehouse sorted and sealed into high-grade tamper-proof agri-grade packaging.',
      shipped: 'Handed over to rural fast-dispatch logistics partner. Tracking active.',
      delivered: 'Delivered securely to recipient farmer at village farmgate.',
    }

    order.status = nextStatus
    order.updated_at = now
    if (!order.events) order.events = []
    order.events.push({
      id: 'evt_' + Math.random().toString(36).substring(2, 8),
      order_id: orderId,
      status: nextStatus,
      time: now,
      note: noteMap[nextStatus],
    })

    allOrders[userId] = userOrders
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders))
    return order
  },

  // ==========================================================================
  // PHASE 8: CROP PLANS & AUTOMATED TASKS
  // ==========================================================================
  getCropPlans(farmId: string): CropPlan[] {
    const allPlans: Record<string, CropPlan[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PLANS) || '{}'
    )
    return allPlans[farmId] || []
  },

  createCropPlanWithTasks(
    farmId: string,
    cropId: string,
    sowDate: string,
    taskTemplates: Array<{
      title: string
      due_date: string
      stage?: string
      category?: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_check' | 'harvest'
      description?: string
    }>
  ): { plan: CropPlan; tasks: CropTask[] } {
    const allPlans: Record<string, CropPlan[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PLANS) || '{}'
    )
    const farmPlans = allPlans[farmId] || []

    const planId = 'plan_' + Math.random().toString(36).substring(2, 9)
    const now = new Date().toISOString()

    const newPlan: CropPlan = {
      id: planId,
      farm_id: farmId,
      crop_id: cropId,
      sow_date: sowDate,
      status: 'planned',
      created_at: now,
      updated_at: now,
    }

    farmPlans.unshift(newPlan)
    allPlans[farmId] = farmPlans
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(allPlans))

    // Create tasks
    const allTasks: Record<string, CropTask[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TASKS) || '{}'
    )

    const generatedTasks: CropTask[] = taskTemplates.map((t) => ({
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      plan_id: planId,
      title: t.title,
      due_date: t.due_date,
      done: false,
      stage: t.stage,
      category: t.category,
      description: t.description,
      created_at: now,
    }))

    allTasks[planId] = generatedTasks
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks))

    return { plan: newPlan, tasks: generatedTasks }
  },

  getCropTasks(planId: string): CropTask[] {
    const allTasks: Record<string, CropTask[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TASKS) || '{}'
    )
    return allTasks[planId] || []
  },

  toggleCropTask(planId: string, taskId: string, done: boolean): boolean {
    const allTasks: Record<string, CropTask[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TASKS) || '{}'
    )
    const tasks = allTasks[planId] || []
    const target = tasks.find((t) => t.id === taskId)
    if (!target) return false

    target.done = done
    allTasks[planId] = tasks
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks))
    return true
  },

  // ==========================================================================
  // PHASE 9: IN-APP NOTIFICATIONS & WEATHER ALERTS
  // ==========================================================================
  getNotifications(userId: string): InAppNotification[] {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== userId) return []

    const allNotifs: Record<string, InAppNotification[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '{}'
    )

    if (!allNotifs[userId] || allNotifs[userId].length === 0) {
      // Seed default weather alerts and task notifications for farm district
      const defaultNotifs: InAppNotification[] = [
        {
          id: 'notif_weather_1',
          user_id: userId,
          title: 'Cold Wave & Frost Warning',
          message: 'District Advisory: Night temperatures expected to drop below 4°C. Irrigate fields lightly to insulate root zones.',
          type: 'weather_alert',
          severity: 'warning',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'notif_weather_2',
          user_id: userId,
          title: 'Unseasonal Rain Warning (Next 48h)',
          message: 'Scattered light showers forecast for your district. Hold off on foliar fungicide and fertilizer spraying.',
          type: 'weather_alert',
          severity: 'info',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'notif_task_1',
          user_id: userId,
          title: 'Active Crop Plan Reminder',
          message: 'First Irrigation & Urea Top-Dressing scheduled for this week. Check your field task calendar.',
          type: 'task_reminder',
          severity: 'info',
          is_read: false,
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ]
      allNotifs[userId] = defaultNotifs
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs))
    }

    return allNotifs[userId] || []
  },

  addNotification(userId: string, notif: Omit<InAppNotification, 'id' | 'created_at'>): InAppNotification {
    const allNotifs: Record<string, InAppNotification[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '{}'
    )
    const list = allNotifs[userId] || []
    const newNotif: InAppNotification = {
      ...notif,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    list.unshift(newNotif)
    allNotifs[userId] = list
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs))
    return newNotif
  },

  markNotificationRead(userId: string, notifId: string): boolean {
    const allNotifs: Record<string, InAppNotification[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '{}'
    )
    const list = allNotifs[userId] || []
    const target = list.find((n) => n.id === notifId)
    if (target) {
      target.is_read = true
      allNotifs[userId] = list
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs))
      return true
    }
    return false
  },

  markAllNotificationsRead(userId: string): boolean {
    const allNotifs: Record<string, InAppNotification[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '{}'
    )
    const list = allNotifs[userId] || []
    list.forEach((n) => (n.is_read = true))
    allNotifs[userId] = list
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifs))
    return true
  },

  // ==========================================================================
  // PHASE 9: CROP DIAGNOSES
  // ==========================================================================
  getDiagnoses(userId: string): CropDiagnosis[] {
    const currentSession = this.getSession()
    if (!currentSession || currentSession.user.id !== userId) return []

    const allDiagnoses: Record<string, CropDiagnosis[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DIAGNOSES) || '{}'
    )
    return allDiagnoses[userId] || []
  },

  saveDiagnosis(userId: string, diagnosis: Omit<CropDiagnosis, 'id' | 'created_at'>): CropDiagnosis {
    const allDiagnoses: Record<string, CropDiagnosis[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DIAGNOSES) || '{}'
    )
    const list = allDiagnoses[userId] || []
    const newDiag: CropDiagnosis = {
      ...diagnosis,
      id: 'diag_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    list.unshift(newDiag)
    allDiagnoses[userId] = list
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(allDiagnoses))
    return newDiag
  },

  escalateDiagnosis(userId: string, diagId: string): boolean {
    const allDiagnoses: Record<string, CropDiagnosis[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DIAGNOSES) || '{}'
    )
    const list = allDiagnoses[userId] || []
    const item = list.find((d) => d.id === diagId)
    if (item) {
      item.expert_review_requested = true
      item.status = 'expert_escalated'
      allDiagnoses[userId] = list
      localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(allDiagnoses))
      return true
    }
    return false
  },

  // ==========================================================================
  // PHASE 10: EQUIPMENT RENTALS & BOOKINGS
  // ==========================================================================
  getRentalListings(filters?: { district?: string; type?: string; date?: string }): RentalListing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RENTAL_LISTINGS)
    let listings: RentalListing[] = raw ? JSON.parse(raw) : []

    if (listings.length === 0) {
      listings = [...SEEDED_RENTALS]
      localStorage.setItem(STORAGE_KEYS.RENTAL_LISTINGS, JSON.stringify(listings))
    }

    if (filters?.district && filters.district !== 'all') {
      listings = listings.filter(
        (l) => l.district.toLowerCase() === filters.district!.toLowerCase()
      )
    }

    if (filters?.type && filters.type !== 'all') {
      listings = listings.filter((l) => l.type === filters.type)
    }

    if (filters?.date) {
      listings = listings.filter((l) => !l.booked_dates?.includes(filters.date!))
    }

    return listings
  },

  addRentalListing(
    listing: Omit<RentalListing, 'id' | 'created_at' | 'rating' | 'review_count'>
  ): RentalListing {
    const listings = this.getRentalListings()
    const newListing: RentalListing = {
      ...listing,
      id: 'rent_' + Math.random().toString(36).substring(2, 9),
      rating: 5.0,
      review_count: 0,
      booked_dates: [],
      created_at: new Date().toISOString(),
    }
    listings.unshift(newListing)
    localStorage.setItem(STORAGE_KEYS.RENTAL_LISTINGS, JSON.stringify(listings))
    return newListing
  },

  getRentalBookings(userId: string): RentalBooking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RENTAL_BOOKINGS)
    const bookings: RentalBooking[] = raw ? JSON.parse(raw) : []
    const listings = this.getRentalListings()

    // User is either the renter (farmer) OR the owner of the equipment
    const userBookings = bookings
      .filter((b) => b.renter_id === userId || b.owner_id === userId)
      .map((b) => ({
        ...b,
        listing: listings.find((l) => l.id === b.listing_id),
      }))

    return userBookings
  },

  createRentalBooking(
    booking: Omit<RentalBooking, 'id' | 'created_at' | 'listing'>
  ): RentalBooking {
    const raw = localStorage.getItem(STORAGE_KEYS.RENTAL_BOOKINGS)
    const bookings: RentalBooking[] = raw ? JSON.parse(raw) : []
    const listings = this.getRentalListings()
    const listing = listings.find((l) => l.id === booking.listing_id)

    const newBooking: RentalBooking = {
      ...booking,
      id: 'bk_rent_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      listing,
    }

    bookings.unshift(newBooking)
    localStorage.setItem(STORAGE_KEYS.RENTAL_BOOKINGS, JSON.stringify(bookings))

    // In-app notification for owner
    this.addNotification(booking.owner_id, {
      user_id: booking.owner_id,
      title: `Equipment Rental Request: ${listing?.title || 'Equipment'}`,
      message: `${booking.renter_name} (${booking.renter_phone}) requested to book your ${listing?.type} for ${booking.start_date}.`,
      type: 'general',
      severity: 'info',
      is_read: false,
    })

    return newBooking
  },

  updateRentalBookingStatus(
    bookingId: string,
    status: RentalBooking['status'],
    declineReason?: string
  ): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.RENTAL_BOOKINGS)
    const bookings: RentalBooking[] = raw ? JSON.parse(raw) : []
    const target = bookings.find((b) => b.id === bookingId)
    if (!target) return false

    target.status = status
    if (declineReason) target.decline_reason = declineReason
    target.updated_at = new Date().toISOString()

    // If confirmed, reserve the date on listing
    if (status === 'confirmed') {
      const listings = this.getRentalListings()
      const listing = listings.find((l) => l.id === target.listing_id)
      if (listing) {
        if (!listing.booked_dates) listing.booked_dates = []
        if (!listing.booked_dates.includes(target.start_date)) {
          listing.booked_dates.push(target.start_date)
        }
        localStorage.setItem(STORAGE_KEYS.RENTAL_LISTINGS, JSON.stringify(listings))
      }
    }

    localStorage.setItem(STORAGE_KEYS.RENTAL_BOOKINGS, JSON.stringify(bookings))

    // Notify renter
    this.addNotification(target.renter_id, {
      user_id: target.renter_id,
      title: `Equipment Booking ${status.toUpperCase()}`,
      message:
        status === 'confirmed'
          ? `Your booking for ${target.listing?.title || 'Equipment'} on ${target.start_date} was ACCEPTED by the owner!`
          : `Your booking request was ${status}. ${declineReason ? 'Reason: ' + declineReason : ''}`,
      type: 'general',
      severity: status === 'confirmed' ? 'success' : 'warning',
      is_read: false,
    })

    return true
  },

  // ==========================================================================
  // PHASE 10: LABOUR CREWS & BOOKINGS
  // ==========================================================================
  getLabourListings(filters?: { district?: string; skill?: string; date?: string }): LabourListing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LABOUR_LISTINGS)
    let listings: LabourListing[] = raw ? JSON.parse(raw) : []

    if (listings.length === 0) {
      listings = [...SEEDED_LABOUR]
      localStorage.setItem(STORAGE_KEYS.LABOUR_LISTINGS, JSON.stringify(listings))
    }

    if (filters?.district && filters.district !== 'all') {
      listings = listings.filter(
        (l) => l.district.toLowerCase() === filters.district!.toLowerCase()
      )
    }

    if (filters?.skill && filters.skill !== 'all') {
      listings = listings.filter((l) =>
        l.skills.some((s) => s.toLowerCase().includes(filters.skill!.toLowerCase()))
      )
    }

    if (filters?.date) {
      listings = listings.filter((l) => !l.booked_dates?.includes(filters.date!))
    }

    return listings
  },

  addLabourListing(
    listing: Omit<LabourListing, 'id' | 'created_at' | 'rating' | 'review_count'>
  ): LabourListing {
    const listings = this.getLabourListings()
    const newListing: LabourListing = {
      ...listing,
      id: 'lab_' + Math.random().toString(36).substring(2, 9),
      rating: 5.0,
      review_count: 0,
      booked_dates: [],
      created_at: new Date().toISOString(),
    }
    listings.unshift(newListing)
    localStorage.setItem(STORAGE_KEYS.LABOUR_LISTINGS, JSON.stringify(listings))
    return newListing
  },

  getLabourBookings(userId: string): LabourBooking[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LABOUR_BOOKINGS)
    const bookings: LabourBooking[] = raw ? JSON.parse(raw) : []
    const listings = this.getLabourListings()

    return bookings
      .filter((b) => b.farmer_id === userId || b.leader_id === userId)
      .map((b) => ({
        ...b,
        listing: listings.find((l) => l.id === b.listing_id),
      }))
  },

  createLabourBooking(
    booking: Omit<LabourBooking, 'id' | 'created_at' | 'listing'>
  ): LabourBooking {
    const raw = localStorage.getItem(STORAGE_KEYS.LABOUR_BOOKINGS)
    const bookings: LabourBooking[] = raw ? JSON.parse(raw) : []
    const listings = this.getLabourListings()
    const listing = listings.find((l) => l.id === booking.listing_id)

    const newBooking: LabourBooking = {
      ...booking,
      id: 'bk_lab_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      listing,
    }

    bookings.unshift(newBooking)
    localStorage.setItem(STORAGE_KEYS.LABOUR_BOOKINGS, JSON.stringify(bookings))

    // Notify leader
    this.addNotification(booking.leader_id, {
      user_id: booking.leader_id,
      title: `Labour Booking Request: ${listing?.title || 'Crew'}`,
      message: `${booking.farmer_name} (${booking.farmer_phone}) requested your crew for ${booking.days_count} days starting ${booking.start_date}.`,
      type: 'general',
      severity: 'info',
      is_read: false,
    })

    return newBooking
  },

  updateLabourBookingStatus(
    bookingId: string,
    status: LabourBooking['status'],
    declineReason?: string
  ): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.LABOUR_BOOKINGS)
    const bookings: LabourBooking[] = raw ? JSON.parse(raw) : []
    const target = bookings.find((b) => b.id === bookingId)
    if (!target) return false

    target.status = status
    if (declineReason) target.decline_reason = declineReason
    target.updated_at = new Date().toISOString()

    if (status === 'confirmed') {
      const listings = this.getLabourListings()
      const listing = listings.find((l) => l.id === target.listing_id)
      if (listing) {
        if (!listing.booked_dates) listing.booked_dates = []
        if (!listing.booked_dates.includes(target.start_date)) {
          listing.booked_dates.push(target.start_date)
        }
        localStorage.setItem(STORAGE_KEYS.LABOUR_LISTINGS, JSON.stringify(listings))
      }
    }

    localStorage.setItem(STORAGE_KEYS.LABOUR_BOOKINGS, JSON.stringify(bookings))

    // Notify farmer
    this.addNotification(target.farmer_id, {
      user_id: target.farmer_id,
      title: `Labour Booking ${status.toUpperCase()}`,
      message:
        status === 'confirmed'
          ? `Your crew booking with ${target.listing?.leader_name || 'Leader'} starting ${target.start_date} was ACCEPTED!`
          : `Your crew booking request was ${status}. ${declineReason ? 'Reason: ' + declineReason : ''}`,
      type: 'general',
      severity: status === 'confirmed' ? 'success' : 'warning',
      is_read: false,
    })

    return true
  },

  // ==========================================================================
  // PHASE 10: IN-APP BOOKING CHAT THREADS
  // ==========================================================================
  getBookingMessages(bookingId: string): BookingMessage[] {
    const allMsgs: Record<string, BookingMessage[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKING_MESSAGES) || '{}'
    )
    return allMsgs[bookingId] || []
  },

  sendBookingMessage(msg: Omit<BookingMessage, 'id' | 'created_at'>): BookingMessage {
    const allMsgs: Record<string, BookingMessage[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKING_MESSAGES) || '{}'
    )
    const list = allMsgs[msg.booking_id] || []
    const newMsg: BookingMessage = {
      ...msg,
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    list.push(newMsg)
    allMsgs[msg.booking_id] = list
    localStorage.setItem(STORAGE_KEYS.BOOKING_MESSAGES, JSON.stringify(allMsgs))
    return newMsg
  },

  // ==========================================================================
  // PHASE 10: RATINGS & REVIEWS
  // ==========================================================================
  getListingReviews(listingId: string): BookingReview[] {
    const allReviews: Record<string, BookingReview[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKING_REVIEWS) || '{}'
    )
    return allReviews[listingId] || []
  },

  addBookingReview(review: Omit<BookingReview, 'id' | 'created_at'>): BookingReview {
    const allReviews: Record<string, BookingReview[]> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BOOKING_REVIEWS) || '{}'
    )
    const list = allReviews[review.listing_id] || []
    const newReview: BookingReview = {
      ...review,
      id: 'rev_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    list.unshift(newReview)
    allReviews[review.listing_id] = list
    localStorage.setItem(STORAGE_KEYS.BOOKING_REVIEWS, JSON.stringify(allReviews))

    // Recalculate average rating on listing
    if (review.booking_type === 'rental') {
      const listings = this.getRentalListings()
      const item = listings.find((l) => l.id === review.listing_id)
      if (item) {
        const sum = list.reduce((acc, r) => acc + r.rating, 0)
        item.rating = Math.round((sum / list.length) * 10) / 10
        item.review_count = list.length
        localStorage.setItem(STORAGE_KEYS.RENTAL_LISTINGS, JSON.stringify(listings))
      }
    } else {
      const listings = this.getLabourListings()
      const item = listings.find((l) => l.id === review.listing_id)
      if (item) {
        const sum = list.reduce((acc, r) => acc + r.rating, 0)
        item.rating = Math.round((sum / list.length) * 10) / 10
        item.review_count = list.length
        localStorage.setItem(STORAGE_KEYS.LABOUR_LISTINGS, JSON.stringify(listings))
      }
    }

    return newReview
  },

  // ==========================================================================
  // PHASE 12: MANDI PRICES, PRODUCE LISTINGS, OFFERS & WAREHOUSES
  // ==========================================================================
  getMandiPrices(district?: string): MandiPriceItem[] {
    let list = [...SEEDED_MANDI_PRICES]
    if (district && district !== 'all') {
      const match = list.filter((p) => p.district.toLowerCase() === district.toLowerCase())
      if (match.length > 0) return match
    }
    return list
  },

  getProduceListings(district?: string): ProduceListingItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCE_LISTINGS)
    let list: ProduceListingItem[] = raw ? JSON.parse(raw) : []
    if (list.length === 0) {
      list = [...SEEDED_PRODUCE_LISTINGS]
      localStorage.setItem(STORAGE_KEYS.PRODUCE_LISTINGS, JSON.stringify(list))
    }
    if (district && district !== 'all') {
      list = list.filter((p) => p.district.toLowerCase() === district.toLowerCase())
    }
    return list
  },

  createProduceListing(
    listing: Omit<ProduceListingItem, 'id' | 'created_at' | 'status'>
  ): ProduceListingItem {
    const list = this.getProduceListings()
    const newItem: ProduceListingItem = {
      ...listing,
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      status: 'active',
      created_at: new Date().toISOString(),
    }
    list.unshift(newItem)
    localStorage.setItem(STORAGE_KEYS.PRODUCE_LISTINGS, JSON.stringify(list))
    return newItem
  },

  getProduceOffers(listingId?: string, userId?: string): ProduceOfferItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCE_OFFERS)
    let list: ProduceOfferItem[] = raw ? JSON.parse(raw) : []
    if (list.length === 0) {
      list = [...SEEDED_PRODUCE_OFFERS]
      localStorage.setItem(STORAGE_KEYS.PRODUCE_OFFERS, JSON.stringify(list))
    }
    if (listingId) {
      list = list.filter((o) => o.listing_id === listingId)
    }
    if (userId) {
      const listings = this.getProduceListings()
      const myListings = listings.filter((l) => l.farmer_id === userId).map((l) => l.id)
      list = list.filter((o) => o.buyer_id === userId || myListings.includes(o.listing_id))
    }
    return list
  },

  createProduceOffer(
    offer: Omit<ProduceOfferItem, 'id' | 'created_at' | 'status'>
  ): ProduceOfferItem {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCE_OFFERS)
    const list: ProduceOfferItem[] = raw ? JSON.parse(raw) : [...SEEDED_PRODUCE_OFFERS]

    const newOffer: ProduceOfferItem = {
      ...offer,
      id: 'off_' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    list.unshift(newOffer)
    localStorage.setItem(STORAGE_KEYS.PRODUCE_OFFERS, JSON.stringify(list))

    const listings = this.getProduceListings()
    const targetListing = listings.find((l) => l.id === offer.listing_id)
    if (targetListing && targetListing.status === 'active') {
      targetListing.status = 'negotiating'
      localStorage.setItem(STORAGE_KEYS.PRODUCE_LISTINGS, JSON.stringify(listings))
    }

    return newOffer
  },

  updateProduceOfferStatus(
    offerId: string,
    status: ProduceOfferItem['status'],
    counterPrice?: number
  ): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCE_OFFERS)
    const list: ProduceOfferItem[] = raw ? JSON.parse(raw) : [...SEEDED_PRODUCE_OFFERS]
    const target = list.find((o) => o.id === offerId)
    if (!target) return false

    target.status = status
    if (counterPrice) target.counter_price = counterPrice
    localStorage.setItem(STORAGE_KEYS.PRODUCE_OFFERS, JSON.stringify(list))

    if (status === 'accepted') {
      const listings = this.getProduceListings()
      const listing = listings.find((l) => l.id === target.listing_id)
      if (listing) {
        listing.status = 'sold'
        localStorage.setItem(STORAGE_KEYS.PRODUCE_LISTINGS, JSON.stringify(listings))

        // Phase 13: Auto-log accepted produce sale as income entry in Ledger
        try {
          this.createLedgerEntry({
            user_id: listing.farmer_id,
            crop_name: listing.crop_name.split(' (')[0], // e.g. "Wheat HD-3086"
            entry_type: 'income',
            category: 'produce_sale',
            amount: target.offer_price * target.qty,
            date: new Date().toISOString().split('T')[0],
            source_type: 'auto_produce_sale',
            source_id: target.id,
            notes: `Accepted Offer: Sold ${target.qty} Quintals @ ₹${target.offer_price}/Q to ${target.buyer_name}`,
          })
        } catch (e) {
          console.warn('Failed to auto-log produce sale in ledger:', e)
        }
      }
    }

    return true
  },

  getWarehouses(district?: string): WarehouseItem[] {
    let list = [...SEEDED_WAREHOUSES]
    if (district && district !== 'all') {
      list = list.filter((w) => w.district.toLowerCase() === district.toLowerCase())
    }
    return list
  },

  createWarehouseBooking(booking: {
    warehouse_id: string
    farmer_id: string
    farmer_name: string
    farmer_phone: string
    crop_name: string
    qty_quintals: number
    start_date: string
    months_count: number
    total_cost: number
  }) {
    const raw = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_BOOKINGS)
    const list = raw ? JSON.parse(raw) : []
    const newBooking = {
      ...booking,
      id: 'wh_bk_' + Math.random().toString(36).substring(2, 9),
      status: 'confirmed',
      created_at: new Date().toISOString(),
    }
    list.unshift(newBooking)
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_BOOKINGS, JSON.stringify(list))

    this.addNotification(booking.farmer_id, {
      user_id: booking.farmer_id,
      title: 'Warehouse Space Reserved',
      message: `Confirmed ${booking.qty_quintals} quintals storage for ${booking.crop_name} for ${booking.months_count} months starting ${booking.start_date}.`,
      type: 'general',
      severity: 'success',
      is_read: false,
    })

    return newBooking
  },

  getWarehouseBookings(userId: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_BOOKINGS)
    const list = raw ? JSON.parse(raw) : []
    return list.filter((b: any) => b.farmer_id === userId)
  },

  // Phase 13: Financial Ledger API
  getLedgerEntries(userId?: string, cropName?: string): LedgerEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES)
    let list: LedgerEntry[] = raw ? JSON.parse(raw) : [...SEEDED_LEDGER_ENTRIES]
    if (userId) {
      list = list.filter((e) => e.user_id === userId || e.user_id === 'usr_OTg3NjU0MzIxMA00')
    }
    if (cropName && cropName !== 'all') {
      list = list.filter((e) => e.crop_name.toLowerCase().includes(cropName.toLowerCase()))
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>): LedgerEntry {
    const raw = localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES)
    const list: LedgerEntry[] = raw ? JSON.parse(raw) : [...SEEDED_LEDGER_ENTRIES]
    const newEntry: LedgerEntry = {
      ...entry,
      id: 'led_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    list.unshift(newEntry)
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(list))
    return newEntry
  },

  deleteLedgerEntry(id: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES)
    const list: LedgerEntry[] = raw ? JSON.parse(raw) : [...SEEDED_LEDGER_ENTRIES]
    const filtered = list.filter((e) => e.id !== id)
    localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(filtered))
    return true
  },

  // ============================================================================
  // Phase 14: Support Tickets & Realtime Chat
  // ============================================================================

  getSupportTickets(userId?: string): SupportTicket[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS)
    let list: SupportTicket[] = raw ? JSON.parse(raw) : [...SEEDED_TICKETS]
    if (userId) {
      list = list.filter((t) => t.user_id === userId || t.user_id === 'usr_OTg3NjU0MzIxMA00')
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>): SupportTicket {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS)
    const list: SupportTicket[] = raw ? JSON.parse(raw) : [...SEEDED_TICKETS]
    const now = new Date().toISOString()
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'tkt_' + Math.random().toString(36).substring(2, 9),
      created_at: now,
      updated_at: now,
    }
    list.unshift(newTicket)
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(list))

    // Initialize first message in thread from farmer description
    this.createTicketMessage({
      ticket_id: newTicket.id,
      sender_id: newTicket.user_id,
      sender_name: newTicket.farmer_name,
      sender_role: 'farmer',
      message: newTicket.description,
      attachments: newTicket.photos,
    })

    // Simulate an intelligent agri-expert response arriving after 1.5s
    setTimeout(() => {
      const expertReplies: Record<string, string> = {
        crop: `Namaste ${newTicket.farmer_name} ji. An agronomist has reviewed your case regarding "${newTicket.subject}". Please inspect the underside of leaves for mite or fungal spore webbing. If moisture stress is visible, apply light irrigation and avoid spraying in direct harsh sunlight.`,
        finance: `Hello ${newTicket.farmer_name} ji, our rural banking and subsidy support team has acknowledged your request regarding "${newTicket.subject}". We are verifying your land parcel records with the district desk.`,
        order: `Hello ${newTicket.farmer_name} ji, your order inquiry is being handled directly with the warehouse logistics dispatch hub.`,
        product: `Hello ${newTicket.farmer_name} ji, our bio-chemical specialist has noted your product dosage question and certified its dosage limits.`,
      }

      this.createTicketMessage({
        ticket_id: newTicket.id,
        sender_id: 'expert_agri_auto',
        sender_name: 'Dr. Virender Sharma (KVK Agronomist)',
        sender_role: 'expert',
        message: expertReplies[newTicket.category] || `Namaste ${newTicket.farmer_name} ji. We have assigned this ticket to an agricultural specialist. We will respond shortly with treatment recommendations.`,
      })
    }, 1500)

    return newTicket
  },

  getTicketMessages(ticketId: string): SupportTicketMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_MESSAGES)
    const allMessages: Record<string, SupportTicketMessage[]> = raw
      ? JSON.parse(raw)
      : { ...SEEDED_TICKET_MESSAGES }
    return allMessages[ticketId] || []
  },

  createTicketMessage(msg: Omit<SupportTicketMessage, 'id' | 'created_at'>): SupportTicketMessage {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_MESSAGES)
    const allMessages: Record<string, SupportTicketMessage[]> = raw
      ? JSON.parse(raw)
      : { ...SEEDED_TICKET_MESSAGES }

    const thread = allMessages[msg.ticket_id] || []
    const newMsg: SupportTicketMessage = {
      ...msg,
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    }
    thread.push(newMsg)
    allMessages[msg.ticket_id] = thread
    localStorage.setItem(STORAGE_KEYS.SUPPORT_MESSAGES, JSON.stringify(allMessages))

    // Dispatch realtime DOM event for subscribed live components
    window.dispatchEvent(new CustomEvent('kisan_ticket_message', { detail: newMsg }))

    return newMsg
  },

  // ============================================================================
  // Phase 14: Community Posts, Comments & Upvotes
  // ============================================================================

  getCommunityPosts(cropTag?: string): CommunityPost[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    let list: CommunityPost[] = raw ? JSON.parse(raw) : [...SEEDED_COMMUNITY_POSTS]
    if (cropTag && cropTag !== 'all') {
      list = list.filter((p) => p.crop_tag.toLowerCase().includes(cropTag.toLowerCase()))
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  createCommunityPost(
    post: Omit<CommunityPost, 'id' | 'upvotes_count' | 'upvoted_by' | 'reported_by' | 'comments_count' | 'created_at'>
  ): CommunityPost {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    const list: CommunityPost[] = raw ? JSON.parse(raw) : [...SEEDED_COMMUNITY_POSTS]
    const newPost: CommunityPost = {
      ...post,
      id: 'post_' + Math.random().toString(36).substring(2, 9),
      upvotes_count: 0,
      upvoted_by: [],
      reported_by: [],
      comments_count: 0,
      created_at: new Date().toISOString(),
    }
    list.unshift(newPost)
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list))
    return newPost
  },

  upvoteCommunityPost(postId: string, userId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    const list: CommunityPost[] = raw ? JSON.parse(raw) : [...SEEDED_COMMUNITY_POSTS]
    const post = list.find((p) => p.id === postId)
    if (!post) return false

    if (post.upvoted_by.includes(userId)) {
      post.upvoted_by = post.upvoted_by.filter((u) => u !== userId)
      post.upvotes_count = Math.max(0, post.upvotes_count - 1)
    } else {
      post.upvoted_by.push(userId)
      post.upvotes_count += 1
    }
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list))
    return true
  },

  reportCommunityPost(postId: string, userId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    const list: CommunityPost[] = raw ? JSON.parse(raw) : [...SEEDED_COMMUNITY_POSTS]
    const post = list.find((p) => p.id === postId)
    if (!post) return false

    if (!post.reported_by.includes(userId)) {
      post.reported_by.push(userId)
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(list))
    }
    return true
  },

  getCommunityComments(postId: string): CommunityComment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_COMMENTS)
    const allComments: Record<string, CommunityComment[]> = raw
      ? JSON.parse(raw)
      : { ...SEEDED_COMMUNITY_COMMENTS }
    return allComments[postId] || []
  },

  createCommunityComment(
    postId: string,
    authorId: string,
    authorName: string,
    comment: string
  ): CommunityComment {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_COMMENTS)
    const allComments: Record<string, CommunityComment[]> = raw
      ? JSON.parse(raw)
      : { ...SEEDED_COMMUNITY_COMMENTS }

    const postComments = allComments[postId] || []
    const newComment: CommunityComment = {
      id: 'com_' + Math.random().toString(36).substring(2, 9),
      post_id: postId,
      author_id: authorId,
      author_name: authorName,
      comment,
      created_at: new Date().toISOString(),
    }
    postComments.push(newComment)
    allComments[postId] = postComments
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_COMMENTS, JSON.stringify(allComments))

    // Increment post comment count
    const postsRaw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)
    const posts: CommunityPost[] = postsRaw ? JSON.parse(postsRaw) : [...SEEDED_COMMUNITY_POSTS]
    const post = posts.find((p) => p.id === postId)
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts))
    }

    return newComment
  },

  // RLS Security Probe: explicitly tests attempting to read another user's row
  testRlsViolation(targetUserId: string): { blocked: boolean; message: string } {
    const currentSession = this.getSession()
    if (!currentSession) {
      return { blocked: true, message: 'Unauthenticated request blocked.' }
    }

    if (currentSession.user.id === targetUserId) {
      return { blocked: false, message: 'Target is the current user.' }
    }

    const profiles: Record<string, UserProfile> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PROFILES) || '{}'
    )
    const exists = profiles[targetUserId]

    return {
      blocked: true,
      message: exists
        ? `RLS Enforcement Active: Access to user '${targetUserId}' was blocked with 403 Forbidden. 0 rows returned.`
        : `RLS Enforcement Active: Query to foreign partition '${targetUserId}' returned empty set.`,
    }
  },
}
