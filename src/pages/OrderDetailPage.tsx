import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  CreditCard,
  MapPin,
  Sparkles,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import { useOrder, useAdvanceOrderStatus } from '@/lib/api/cart'
import type { OrderEvent } from '@/lib/supabase/types'

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: order, isLoading } = useOrder(id)
  const advanceStatusMutation = useAdvanceOrderStatus()

  const justPlaced = Boolean((location.state as any)?.orderPlaced)

  if (isLoading) {
    return (
      <LayoutShell>
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6">
          <Skeleton variant="text" className="w-32 h-6" />
          <Skeleton variant="card" className="h-64 w-full" />
          <Skeleton variant="card" className="h-64 w-full" />
        </main>
      </LayoutShell>
    )
  }

  if (!order) {
    return (
      <LayoutShell>
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center flex flex-col items-center gap-4">
          <Card variant="surface" className="p-8 flex flex-col items-center gap-4 max-w-md">
            <h2 className="text-xl font-bold text-ink">Order Not Found</h2>
            <p className="text-xs text-muted">The requested order could not be found or you do not have permission to view it.</p>
            <Button variant="primary" size="md" onClick={() => navigate('/orders')}>
              Back to My Orders
            </Button>
          </Card>
        </main>
      </LayoutShell>
    )
  }

  // Define 4 Milestone Timeline Steps
  const TIMELINE_STEPS = [
    {
      key: 'placed',
      title: 'Order Placed',
      description: 'Order confirmed & verified on server',
      icon: CheckCircle2,
    },
    {
      key: 'packed',
      title: 'Consignment Packed',
      description: 'Agri-grade tamper-proof sealing completed',
      icon: Package,
    },
    {
      key: 'shipped',
      title: 'Dispatched & Shipped',
      description: 'En route to rural regional dispatch hub',
      icon: Truck,
    },
    {
      key: 'delivered',
      title: 'Farmgate Delivered',
      description: 'Handed over directly to farmer',
      icon: Home,
    },
  ]

  const statusOrder = ['placed', 'packed', 'shipped', 'delivered']
  const currentStatusIndex = statusOrder.indexOf(order.status)

  // Map order events by status for easy lookup of timestamp & notes
  const eventMap = new Map<string, OrderEvent>()
  ;(order.events || []).forEach((e) => {
    eventMap.set(e.status, e)
  })

  const handleAdvanceStatus = async (nextStatus: 'packed' | 'shipped' | 'delivered') => {
    await advanceStatusMutation.mutateAsync({
      orderId: order.id,
      nextStatus,
    })
  }

  const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <LayoutShell>
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-sm text-forest hover:text-ink transition-colors font-medium self-start focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        {/* Celebratory Banner on fresh checkout */}
        {justPlaced && (
          <div className="p-4 sm:p-5 rounded-card bg-surface border border-lime-strong flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-pill bg-lime flex items-center justify-center text-ink shrink-0">
                <Sparkles className="w-5 h-5 text-ink" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-ink text-sm sm:text-base">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-muted">
                  Your payment was verified, stock was decremented atomically, and logistics dispatch is initiated.
                </p>
              </div>
            </div>
            <Badge variant="lime" dot>Live Active</Badge>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Order #{order.id}
              </h1>
              <Badge variant="lime" dot>
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span>Placed on {dateFormatted}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-pill bg-surface-alt border border-line text-ink font-semibold">
              Payment: {order.payment_method === 'razorpay' ? 'Razorpay (Paid)' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* ====================================================================
            STATUS TIMELINE DRIVEN BY ORDER_EVENTS (PHASE 6 REQUIREMENT 4)
            ==================================================================== */}
        <Card variant="surface" className="flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-forest" />
              <span className="text-base font-bold text-ink">Order Delivery Timeline</span>
            </div>
            <span className="text-xs text-forest font-semibold">
              Driven by Real-Time Event Stream
            </span>
          </div>

          {/* Timeline Visual Steps */}
          <div className="relative flex flex-col gap-8 pl-4 sm:pl-6 border-l-2 border-line ml-3 sm:ml-4 my-2">
            {TIMELINE_STEPS.map((step) => {
              const stepIndex = statusOrder.indexOf(step.key)
              const isCompleted = currentStatusIndex >= stepIndex
              const isCurrent = currentStatusIndex === stepIndex
              const eventRecord = eventMap.get(step.key)
              const Icon = step.icon

              const eventTimeFormatted = eventRecord?.time
                ? new Date(eventRecord.time).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Step Node Icon on the vertical line */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[35px] w-8 h-8 rounded-pill flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-lime text-ink border-lime shadow-sm'
                        : 'bg-white text-muted border-line'
                    } ${isCurrent ? 'ring-4 ring-lime/30' : ''}`}
                  >
                    <Icon className="w-4 h-4 text-current" />
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span
                        className={`text-sm sm:text-base font-bold ${
                          isCompleted ? 'text-ink' : 'text-muted'
                        }`}
                      >
                        {step.title}
                      </span>

                      {isCurrent && (
                        <Badge variant="lime">Active Status</Badge>
                      )}

                      {eventTimeFormatted && (
                        <span className="text-[11px] text-forest font-semibold bg-white px-2 py-0.5 rounded-pill border border-line">
                          {eventTimeFormatted}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted">
                      {eventRecord?.note || step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dev/Demo Controls: Advance Timeline */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-card">
            <div className="flex items-center gap-2 text-xs text-ink font-semibold">
              <Sparkles className="w-4 h-4 text-forest shrink-0" />
              <span>Simulate Logistics Timeline:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={order.status === 'placed' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleAdvanceStatus('packed')}
                disabled={advanceStatusMutation.isPending || order.status !== 'placed'}
                className="text-xs"
              >
                Mark as Packed
              </Button>

              <Button
                variant={order.status === 'packed' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleAdvanceStatus('shipped')}
                disabled={advanceStatusMutation.isPending || order.status !== 'packed'}
                className="text-xs"
              >
                Mark as Shipped
              </Button>

              <Button
                variant={order.status === 'shipped' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleAdvanceStatus('delivered')}
                disabled={advanceStatusMutation.isPending || order.status !== 'shipped'}
                className="text-xs"
              >
                Mark as Delivered
              </Button>
            </div>
          </div>
        </Card>

        {/* ====================================================================
            DESTINATION & PAYMENT CARDS (2-COL)
            ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination Card */}
          <Card variant="surface" className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 border-b border-line pb-2.5">
              <MapPin className="w-4 h-4 text-forest" />
              <span className="text-sm font-bold text-ink">Shipping Destination</span>
            </div>

            <div className="text-xs sm:text-sm text-ink flex flex-col gap-1">
              <div className="font-semibold flex items-center gap-2">
                <span>{order.shipping_address?.full_name}</span>
                <span className="text-muted font-normal">• {order.shipping_address?.phone}</span>
              </div>
              <p className="text-muted">
                Village {order.shipping_address?.village}
                {order.shipping_address?.landmark ? `, Near ${order.shipping_address?.landmark}` : ''},
                Dist. {order.shipping_address?.district}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
              </p>
            </div>
          </Card>

          {/* Payment Details Card */}
          <Card variant="surface" className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 border-b border-line pb-2.5">
              <CreditCard className="w-4 h-4 text-forest" />
              <span className="text-sm font-bold text-ink">Payment Record</span>
            </div>

            <div className="text-xs sm:text-sm text-ink flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Payment Mode</span>
                <span className="font-bold text-ink">
                  {order.payment_method === 'razorpay' ? 'Razorpay (Online Payment)' : 'Cash on Delivery (COD)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Payment Status</span>
                <Badge variant={order.payment_status === 'paid' ? 'lime' : 'forest'}>
                  {order.payment_status.toUpperCase()}
                </Badge>
              </div>

              {order.razorpay_payment_id && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Razorpay Transaction ID</span>
                  <span className="font-mono text-[11px] text-ink">{order.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ====================================================================
            ORDER ITEMS & INVOICE SUMMARY
            ==================================================================== */}
        <Card variant="surface" className="flex flex-col gap-4 p-5 sm:p-6">
          <span className="text-base font-bold text-ink border-b border-line pb-3">
            Ordered Items ({order.items?.length || 0})
          </span>

          <div className="flex flex-col divide-y divide-line">
            {(order.items || []).map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-card bg-white border border-line overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.product?.images?.[0] || '/images/marketplace.bmp'}
                      alt={item.product?.name || 'Product'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col text-xs sm:text-sm gap-0.5">
                    <span className="font-bold text-ink">{item.product?.name || 'Product'}</span>
                    <span className="text-muted text-xs">
                      ₹{item.price.toLocaleString('en-IN')} × {item.qty} {item.product?.unit || 'units'}
                    </span>
                  </div>
                </div>

                <span className="font-bold text-ink text-sm sm:text-base">
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-line pt-4 flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Items Subtotal</span>
              <span className="font-semibold text-ink">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-muted">
              <span>Farmgate Delivery</span>
              <span className="font-semibold text-ink">
                {order.delivery_fee === 0 ? <span className="text-forest font-bold">FREE</span> : `₹${order.delivery_fee}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted">
              <span>Applicable Taxes & GST</span>
              <span className="text-forest font-medium">Included</span>
            </div>

            <div className="border-t border-line pt-3 flex items-baseline justify-between">
              <span className="text-base font-bold text-ink">Grand Total</span>
              <span className="text-2xl font-bold text-ink">
                ₹{order.total_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Card>
      </main>
    </LayoutShell>
  )
}
