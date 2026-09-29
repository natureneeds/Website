import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  Calendar,
  ArrowRight,
  Box,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import { useOrders } from '@/lib/api/cart'
import type { Order } from '@/lib/supabase/types'

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: orders = [], isLoading } = useOrders()

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="lime" dot>Delivered</Badge>
      case 'shipped':
        return <Badge variant="lime" dot>Shipped</Badge>
      case 'packed':
        return <Badge variant="forest" dot>Packed</Badge>
      case 'placed':
      default:
        return <Badge variant="forest" dot>Placed</Badge>
    }
  }

  if (isLoading) {
    return (
      <LayoutShell>
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="card" className="h-40 w-full" />
          <Skeleton variant="card" className="h-40 w-full" />
        </main>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-3">
              <Package className="w-7 h-7 text-forest" />
              <span>My Orders & Deliveries</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Track farmgate consignments, view invoices, and inspect order timeline events.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/market')}
            className="self-start sm:self-auto"
          >
            Explore Marketplace
          </Button>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <Card variant="surface" className="flex flex-col items-center justify-center p-12 text-center gap-5 my-8">
            <div className="w-16 h-16 rounded-pill bg-surface-alt border border-line flex items-center justify-center text-muted">
              <Box className="w-8 h-8 text-muted" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="text-xl font-bold text-ink">No orders found</h2>
              <p className="text-sm text-muted">
                You have not placed any agri-input orders yet. Order certified seeds, fertilizers, or tools to see them here.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/market')}
              className="mt-2"
            >
              Order Inputs Now
            </Button>
          </Card>
        ) : (
          /* Orders List */
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const items = order.items || []
              const firstItem = items[0]
              const extraCount = Math.max(0, items.length - 1)
              const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <Card
                  key={order.id}
                  variant="surface"
                  className="flex flex-col gap-4 p-5 hover:border-forest/40 transition-colors"
                >
                  {/* Top Bar: Order ID, Date & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-ink text-sm sm:text-base">
                        Order #{order.id}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>{dateFormatted}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {getStatusBadge(order.status)}
                      <span className="text-xs px-2.5 py-0.5 rounded-pill bg-white border border-line text-ink font-medium">
                        {order.payment_method === 'razorpay' ? 'Razorpay (Paid)' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Middle Content: Items Preview & Destination */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-card bg-white border border-line overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={firstItem?.product?.images?.[0] || '/images/marketplace.bmp'}
                          alt={firstItem?.product?.name || 'Product'}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0 gap-0.5 text-xs sm:text-sm">
                        <span className="font-bold text-ink truncate">
                          {firstItem?.product?.name || 'Agri-Input Item'}
                        </span>
                        <span className="text-muted text-xs">
                          Qty: {firstItem?.qty || 1}
                          {extraCount > 0 && ` (+ ${extraCount} other ${extraCount === 1 ? 'item' : 'items'})`}
                        </span>
                        <span className="text-muted text-[11px]">
                          Delivery to: Village {order.shipping_address?.village}, {order.shipping_address?.district}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Amount & CTA */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-line pt-3 sm:pt-0">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[11px] text-muted uppercase font-semibold">Total Amount</span>
                        <span className="text-lg font-bold text-ink">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="text-xs shrink-0"
                      >
                        <span>View Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </LayoutShell>
  )
}
