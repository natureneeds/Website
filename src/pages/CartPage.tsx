import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  Package,
  PlusCircle,
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
  useUpdateCartQty,
  useRemoveFromCart,
  useAddresses,
  useSaveAddress,
} from '@/lib/api/cart'
import { AddressModal } from '@/components/cart/AddressModal'
import type { UserAddress } from '@/lib/supabase/types'

export const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: cartItems = [], isLoading: isCartLoading } = useCart()
  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses()
  const updateQtyMutation = useUpdateCartQty()
  const removeItemMutation = useRemoveFromCart()
  const saveAddressMutation = useSaveAddress()

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  // Determine active delivery address
  const activeAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.is_default) ||
    addresses[0] ||
    null

  // Calculate live authoritative prices
  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product?.price || 0
    return acc + unitPrice * item.qty
  }, 0)

  const deliveryFee = subtotal >= 500 ? 0 : subtotal > 0 ? 40 : 0
  const freeDeliveryShortfall = Math.max(0, 500 - subtotal)
  const totalAmount = subtotal + deliveryFee

  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr)
    setIsAddressModalOpen(true)
  }

  const handleSaveAddress = async (addrData: any) => {
    const saved = await saveAddressMutation.mutateAsync(addrData)
    if (saved?.id) {
      setSelectedAddressId(saved.id)
    }
  }

  if (isCartLoading || isAddressesLoading) {
    return (
      <LayoutShell>
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
          <Skeleton variant="text" className="w-48 h-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <Skeleton variant="card" className="h-40 w-full" />
              <Skeleton variant="card" className="h-40 w-full" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton variant="card" className="h-64 w-full" />
            </div>
          </div>
        </main>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-forest" />
              <span>Your Agri-Input Cart</span>
              {cartItems.length > 0 && (
                <Badge variant="lime">{cartItems.length} items</Badge>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Direct dispatch from certified regional hubs with verified laboratory purity.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/market')}
            className="self-start sm:self-auto"
          >
            Continue Shopping
          </Button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <Card variant="surface" className="flex flex-col items-center justify-center p-12 text-center gap-5 my-8">
            <div className="w-16 h-16 rounded-pill bg-surface-alt border border-line flex items-center justify-center text-muted">
              <Package className="w-8 h-8 text-muted" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
              <p className="text-sm text-muted">
                Explore our certified seed stocks, organic nutrients, and precision spray tools.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/market')}
              className="mt-2"
            >
              Explore Marketplace
            </Button>
          </Card>
        ) : (
          /* Two Column Layout: Cart Items & Delivery (Left) + Order Summary (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Delivery Address & Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Delivery Address Card */}
              <Card variant="surface" className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-forest" />
                    <span className="font-bold text-ink text-sm sm:text-base">
                      Farmgate Delivery Address
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenAddAddress}
                    className="text-xs text-forest hover:text-ink font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Add New</span>
                  </Button>
                </div>

                {activeAddress ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-line">
                    <div className="flex flex-col text-xs sm:text-sm text-ink gap-0.5">
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{activeAddress.full_name}</span>
                        <span className="text-muted font-normal">• {activeAddress.phone}</span>
                        {activeAddress.is_default && (
                          <Badge variant="lime">Default</Badge>
                        )}
                      </div>
                      <p className="text-muted">
                        Village {activeAddress.village}
                        {activeAddress.landmark ? `, Near ${activeAddress.landmark}` : ''},
                        Dist. {activeAddress.district}, {activeAddress.state} - {activeAddress.pincode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {addresses.length > 1 && (
                        <select
                          value={activeAddress.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="text-xs border border-line rounded-pill px-2.5 py-1 bg-surface-alt text-ink focus:outline-none"
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.village} ({a.district})
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(activeAddress)}
                        className="text-xs text-forest hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-card bg-surface-alt border border-dashed border-line text-center flex flex-col items-center gap-2">
                    <p className="text-xs text-muted">
                      No delivery address saved yet. Please add your farm location.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenAddAddress}
                      className="text-xs"
                    >
                      Add Farm Delivery Address
                    </Button>
                  </div>
                )}
              </Card>

              {/* Items List */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted px-1">
                  Items in Cart ({cartItems.length})
                </span>

                {cartItems.map((item) => {
                  const product = item.product
                  const itemPrice = product?.price || 0
                  const itemMrp = product?.mrp || itemPrice
                  const itemStock = product?.stock || 0
                  const itemImage = product?.images?.[0] || '/images/marketplace.bmp'

                  return (
                    <Card
                      key={item.id}
                      variant="surface"
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 transition-all"
                    >
                      {/* Product Media & Info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-card bg-white border border-line overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={itemImage}
                            alt={product?.name || 'Product'}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0 gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-forest">
                            {product?.brand}
                          </span>
                          <Link
                            to={`/product/${item.product_id}`}
                            className="font-bold text-sm sm:text-base text-ink hover:text-forest transition-colors truncate"
                          >
                            {product?.name || 'Product'}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span>{product?.unit}</span>
                            <span>•</span>
                            <span className={itemStock > 5 ? 'text-forest' : 'text-danger font-medium'}>
                              {itemStock > 0 ? `${itemStock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 border-line pt-3 sm:pt-0">
                        {/* Quantity Pill */}
                        <div className="flex items-center border border-line rounded-pill bg-white px-1.5 py-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() =>
                              updateQtyMutation.mutate({
                                productId: item.product_id,
                                qty: item.qty - 1,
                              })
                            }
                            disabled={updateQtyMutation.isPending}
                            className="w-7 h-7 rounded-pill flex items-center justify-center text-ink hover:bg-surface disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-ink">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQtyMutation.mutate({
                                productId: item.product_id,
                                qty: Math.min(itemStock, item.qty + 1),
                              })
                            }
                            disabled={item.qty >= itemStock || updateQtyMutation.isPending}
                            className="w-7 h-7 rounded-pill flex items-center justify-center text-ink hover:bg-surface disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="flex flex-col items-end min-w-[80px]">
                          <span className="text-base font-bold text-ink">
                            ₹{(itemPrice * item.qty).toLocaleString('en-IN')}
                          </span>
                          {itemMrp > itemPrice && (
                            <span className="text-xs text-muted line-through">
                              ₹{(itemMrp * item.qty).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeItemMutation.mutate(item.product_id)}
                          disabled={removeItemMutation.isPending}
                          className="w-8 h-8 rounded-pill flex items-center justify-center text-muted hover:text-danger hover:bg-white transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Order Price Summary */}
            <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20">
              {/* Delivery Promotion Pill */}
              {freeDeliveryShortfall > 0 ? (
                <div className="p-3 rounded-card bg-surface-alt border border-line flex items-center gap-2.5 text-xs text-ink">
                  <Truck className="w-4 h-4 text-forest shrink-0" />
                  <span>
                    Add <strong>₹{freeDeliveryShortfall.toLocaleString('en-IN')}</strong> more for{' '}
                    <strong className="text-forest">Free Farm Delivery</strong>!
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-card bg-surface-alt border border-forest/30 flex items-center gap-2.5 text-xs text-forest font-semibold">
                  <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                  <span>Your order qualifies for Free Farmgate Delivery!</span>
                </div>
              )}

              {/* Price Calculation Card */}
              <Card variant="surface" className="flex flex-col gap-4 p-5">
                <span className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2">
                  Price Details
                </span>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-muted">
                    <span>Items Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-ink">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted">
                    <span>Farmgate Delivery</span>
                    <span className="font-semibold text-ink">
                      {deliveryFee === 0 ? (
                        <span className="text-forest uppercase text-xs font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted">
                    <span>Applicable GST / Taxes</span>
                    <span className="text-xs text-forest font-medium">Included</span>
                  </div>
                </div>

                <div className="border-t border-line pt-3 flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-ink">Total Amount</span>
                    <span className="text-[11px] text-muted">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-bold text-ink">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  disabled={!activeAddress}
                  className="w-full justify-center mt-2 shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                {!activeAddress && (
                  <p className="text-center text-[11px] text-danger font-medium">
                    Please add a delivery address to proceed.
                  </p>
                )}

                <div className="pt-2 flex flex-col gap-1.5 border-t border-line text-[11px] text-muted">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>100% Genuine, Lab-Tested Agri-Inputs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>Direct tractor/truck farmgate delivery</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Address Modal */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleSaveAddress}
          initialData={editingAddress}
        />
      </main>
    </LayoutShell>
  )
}
