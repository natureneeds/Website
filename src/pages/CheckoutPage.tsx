import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Banknote,
  ArrowLeft,
  AlertCircle,
  Truck,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  useCart,
  useAddresses,
  createRazorpayOrder,
  verifyAndPlaceOrder,
} from '@/lib/api/cart'
import { RazorpayModal } from '@/components/cart/RazorpayModal'
import { useAuth } from '@/context/AuthContext'
import { useQueryClient } from '@tanstack/react-query'

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: cartItems = [], isLoading: isCartLoading } = useCart()
  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses()

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Razorpay test modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false)
  const [razorpayOrderId, setRazorpayOrderId] = useState('')
  const [razorpayAmount, setRazorpayAmount] = useState(0)

  // Active address
  const activeAddress = addresses.find((a) => a.is_default) || addresses[0] || null

  // Server will recompute, but we calculate client estimate for display
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.qty
  }, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const totalAmount = subtotal + deliveryFee

  if (isCartLoading || isAddressesLoading) {
    return (
      <LayoutShell>
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="card" className="h-48 w-full" />
          <Skeleton variant="card" className="h-48 w-full" />
        </main>
      </LayoutShell>
    )
  }

  if (cartItems.length === 0) {
    return (
      <LayoutShell>
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center flex flex-col items-center gap-4">
          <Card variant="surface" className="p-8 flex flex-col items-center gap-4 max-w-md">
            <h2 className="text-xl font-bold text-ink">No items to checkout</h2>
            <p className="text-xs text-muted">Your cart is empty. Add products before proceeding.</p>
            <Button variant="primary" size="md" onClick={() => navigate('/market')}>
              Browse Marketplace
            </Button>
          </Card>
        </main>
      </LayoutShell>
    )
  }

  // Trigger Checkout Action
  const handleProceedToPayment = async () => {
    setErrorMessage('')

    if (!user) {
      navigate('/login')
      return
    }

    if (!activeAddress) {
      setErrorMessage('Please provide a delivery address before placing order.')
      return
    }

    const itemsPayload = cartItems.map((i) => ({
      product_id: i.product_id,
      qty: i.qty,
    }))

    if (paymentMethod === 'razorpay') {
      try {
        setIsSubmitting(true)
        // 1. Call server function create-razorpay-order (server recomputes total)
        const orderResponse = await createRazorpayOrder(itemsPayload)
        if (!orderResponse || !orderResponse.order_id) {
          throw new Error('Failed to create Razorpay payment order on server.')
        }

        setRazorpayOrderId(orderResponse.order_id)
        setRazorpayAmount(orderResponse.total_amount)
        setIsRazorpayModalOpen(true)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Razorpay order creation failed.'
        setErrorMessage(msg)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Cash on Delivery
      try {
        setIsSubmitting(true)
        const result = await verifyAndPlaceOrder(user.id, {
          items: itemsPayload,
          shipping_address: activeAddress,
          payment_method: 'cod',
        })

        if (!result.success || !result.order) {
          throw new Error(result.error || 'Failed to place COD order.')
        }

        // Invalidate queries so stock & cart are instantly updated everywhere
        queryClient.invalidateQueries({ queryKey: ['cart', user.id] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        queryClient.invalidateQueries({ queryKey: ['orders', user.id] })

        // Redirect to Order Detail Timeline
        navigate(`/orders/${result.order.id}`, {
          state: { orderPlaced: true },
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to place order.'
        setErrorMessage(msg)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handle successful test or live Razorpay payment
  const handleRazorpaySuccess = async (details: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => {
    setIsRazorpayModalOpen(false)
    setIsSubmitting(true)

    try {
      if (!user || !activeAddress) return

      const itemsPayload = cartItems.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
      }))

      // Call server verification and atomic order creation
      const result = await verifyAndPlaceOrder(user.id, {
        items: itemsPayload,
        shipping_address: activeAddress,
        payment_method: 'razorpay',
        razorpay_order_id: details.razorpay_order_id,
        razorpay_payment_id: details.razorpay_payment_id,
        razorpay_signature: details.razorpay_signature,
      })

      if (!result.success || !result.order) {
        throw new Error(result.error || 'Payment signature verification failed.')
      }

      // Invalidate queries so stock and cart update immediately
      queryClient.invalidateQueries({ queryKey: ['cart', user.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['orders', user.id] })

      // Redirect to Order Detail Timeline
      navigate(`/orders/${result.order.id}`, {
        state: { orderPlaced: true },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutShell>
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 text-sm text-forest hover:text-ink transition-colors font-medium self-start focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Checkout & Payment
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Review your delivery details and choose your preferred payment method.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-card bg-surface-alt border border-danger/40 text-danger text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Address Review & Payment Selection */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Delivery Destination */}
            <Card variant="surface" className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest" />
                  <span className="text-sm font-bold text-ink">Delivery Destination</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="text-xs text-forest hover:underline font-semibold"
                >
                  Change Address
                </button>
              </div>

              {activeAddress ? (
                <div className="text-xs sm:text-sm text-ink flex flex-col gap-0.5">
                  <div className="font-semibold flex items-center gap-2">
                    <span>{activeAddress.full_name}</span>
                    <span className="text-muted font-normal">({activeAddress.phone})</span>
                  </div>
                  <p className="text-muted">
                    Village {activeAddress.village}
                    {activeAddress.landmark ? `, Near ${activeAddress.landmark}` : ''},
                    Dist. {activeAddress.district}, {activeAddress.state} - {activeAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-danger">No address selected.</p>
              )}
            </Card>

            {/* Payment Method Selector */}
            <Card variant="surface" className="flex flex-col gap-4 p-5">
              <span className="text-sm font-bold text-ink border-b border-line pb-2.5">
                Select Payment Mode
              </span>

              {/* Option 1: Razorpay Online */}
              <label
                className={`p-4 rounded-card border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'razorpay'
                    ? 'bg-white border-forest ring-1 ring-forest'
                    : 'bg-surface-alt border-line hover:bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-forest focus:ring-forest"
                />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-forest" />
                      <span>Razorpay (Online Payment)</span>
                    </span>
                    <Badge variant="lime">Recommended</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Instant zero-fee transfer via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, or Netbanking. Verified signature security.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`p-4 rounded-card border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'cod'
                    ? 'bg-white border-forest ring-1 ring-forest'
                    : 'bg-surface-alt border-line hover:bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-forest focus:ring-forest"
                />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-forest" />
                      <span>Cash on Delivery (COD)</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Pay verified cash or scan driver QR code upon unloading inputs directly at your farmgate.
                  </p>
                </div>
              </label>
            </Card>

            {/* Server Verification Assurance */}
            <div className="p-3.5 rounded-card bg-surface-alt border border-line flex items-center gap-3 text-xs text-ink">
              <ShieldCheck className="w-5 h-5 text-forest shrink-0" />
              <div>
                <span className="font-semibold text-ink">Server Price Protection:</span>{' '}
                <span className="text-muted">
                  Line items and GST totals are calculated directly on the server to guarantee tamper-proof billing.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Action */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Card variant="surface" className="flex flex-col gap-4 p-5">
              <span className="text-sm font-bold text-ink border-b border-line pb-2">
                Order Summary
              </span>

              {/* Items List Preview */}
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-ink">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-bold text-forest">×{item.qty}</span>
                      <span className="truncate">{item.product?.name}</span>
                    </div>
                    <span className="font-semibold shrink-0">
                      ₹{((item.product?.price || 0) * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-line pt-3 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-muted">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-ink">
                    {deliveryFee === 0 ? <span className="text-forest font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted">
                  <span>GST & Agronomy Cess</span>
                  <span className="text-forest font-medium">Included</span>
                </div>

                <div className="border-t border-line pt-2.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-ink">Total Payable</span>
                  <span className="text-xl font-bold text-ink">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={isSubmitting || !activeAddress}
                className="w-full justify-center mt-2 shadow-md"
              >
                {isSubmitting
                  ? 'Processing Order...'
                  : paymentMethod === 'razorpay'
                  ? `Pay with Razorpay (₹${totalAmount.toLocaleString('en-IN')})`
                  : 'Place Cash on Delivery Order'}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted text-center pt-1">
                <Truck className="w-3.5 h-3.5 text-forest" />
                <span>Estimated dispatch: within 24 hours</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Razorpay Test Modal */}
        <RazorpayModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          orderId={razorpayOrderId}
          amount={razorpayAmount}
          onPaymentSuccess={handleRazorpaySuccess}
        />
      </main>
    </LayoutShell>
  )
}
