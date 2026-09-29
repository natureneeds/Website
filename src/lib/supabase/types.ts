export interface UserProfile {
  id: string
  phone: string
  full_name: string
  language: 'en' | 'hi'
  created_at?: string
  updated_at?: string
}

export interface Farm {
  id?: string
  user_id: string
  state: string
  district: string
  village: string
  land_size: number
  land_unit: 'acre' | 'bigha'
  soil_type: string
  water_source: string
  crops: string[]
  created_at?: string
  updated_at?: string
}

export interface AuthSession {
  user: {
    id: string
    phone?: string
  }
}

export interface UserAddress {
  id: string
  user_id: string
  full_name: string
  phone: string
  village: string
  landmark?: string
  district: string
  state: string
  pincode: string
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface CartItem {
  id: string
  cart_id?: string
  product_id: string
  qty: number
  created_at: string
  product?: {
    id: string
    name: string
    brand: string
    price: number
    mrp: number
    unit: string
    stock: number
    images: string[]
    category_id?: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  qty: number
  price: number
  product?: {
    id: string
    name: string
    brand: string
    price: number
    unit: string
    images: string[]
  }
}

export interface OrderEvent {
  id: string
  order_id: string
  status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  time: string
  note?: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  subtotal: number
  delivery_fee: number
  status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: UserAddress
  payment_method: 'razorpay' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed'
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
  events?: OrderEvent[]
}

export interface CropPlan {
  id: string
  farm_id: string
  crop_id: string
  sow_date: string
  status: 'planned' | 'sown' | 'growing' | 'harvesting' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CropTask {
  id: string
  plan_id: string
  title: string
  due_date: string
  done: boolean
  stage?: string
  category?: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_check' | 'harvest'
  description?: string
  created_at: string
}

export interface InAppNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'weather_alert' | 'task_reminder' | 'diagnosis' | 'general'
  severity: 'info' | 'warning' | 'danger' | 'success'
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface CropDiagnosis {
  id: string
  user_id: string
  image_url: string
  crop_type?: string
  issue_name: string
  hindi_name?: string
  confidence: number
  severity?: 'low' | 'moderate' | 'high' | 'critical'
  symptoms: string
  cause?: string
  treatment_options: {
    chemical?: string
    organic?: string
    preventive?: string
  }
  recommended_product_ids: string[]
  expert_review_requested: boolean
  status: 'completed' | 'expert_escalated'
  is_ai_guess: boolean
  created_at: string
}

export interface RentalListing {
  id: string
  owner_id: string
  owner_name: string
  owner_phone?: string
  type: 'tractor' | 'drone' | 'harvester' | 'power_tiller' | 'rotavator' | 'laser_leveler' | 'planter' | 'other'
  title: string
  description?: string
  price: number
  price_unit: 'per_hour' | 'per_day' | 'per_acre'
  district: string
  area_served: string
  images: string[]
  specs?: Record<string, string>
  availability: boolean
  booked_dates?: string[]
  rating: number
  review_count: number
  created_at: string
}

export interface RentalBooking {
  id: string
  listing_id: string
  renter_id: string
  owner_id: string
  renter_name: string
  renter_phone: string
  start_date: string
  end_date: string
  hours_or_days: number
  total_price: number
  status: 'requested' | 'confirmed' | 'declined' | 'in_progress' | 'completed' | 'cancelled'
  decline_reason?: string
  notes?: string
  listing?: RentalListing
  created_at: string
  updated_at?: string
}

export interface LabourListing {
  id: string
  leader_id: string
  leader_name: string
  leader_phone?: string
  title: string
  description?: string
  skills: string[]
  group_size: number
  daily_rate: number
  district: string
  area_served: string
  photos: string[]
  availability: boolean
  booked_dates?: string[]
  rating: number
  review_count: number
  created_at: string
}

export interface LabourBooking {
  id: string
  listing_id: string
  farmer_id: string
  leader_id: string
  farmer_name: string
  farmer_phone: string
  start_date: string
  days_count: number
  total_amount: number
  status: 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  decline_reason?: string
  notes?: string
  listing?: LabourListing
  created_at: string
  updated_at?: string
}

export interface BookingMessage {
  id: string
  booking_id: string
  booking_type: 'rental' | 'labour'
  sender_id: string
  sender_name: string
  message: string
  created_at: string
}

export interface BookingReview {
  id: string
  booking_id: string
  booking_type: 'rental' | 'labour'
  listing_id: string
  reviewer_id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

