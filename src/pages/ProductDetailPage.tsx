import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ShieldCheck,
  Package,
  Layers,
  Building,
  CheckCircle2,
  ShoppingCart,
  Check,
  Plus,
  Minus,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import { useProduct } from '@/lib/api/marketplace'
import { useAddToCart } from '@/lib/api/cart'
import { useAuth } from '@/context/AuthContext'

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const addToCartMutation = useAddToCart()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [addedRecently, setAddedRecently] = useState(false)

  // Fetch product from Supabase / seed cache
  const { data: product, isLoading, isError } = useProduct(id)

  const handleAddToCart = async () => {
    if (!product) return
    if (!user) {
      navigate('/login')
      return
    }
    await addToCartMutation.mutateAsync({ productId: product.id, qty })
    setAddedRecently(true)
    setTimeout(() => setAddedRecently(false), 4000)
  }

  if (isLoading) {
    return (
      <LayoutShell>
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-8">
          <Skeleton variant="button" className="w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Skeleton variant="card" className="h-80 w-full" />
              <div className="flex gap-2">
                <Skeleton variant="card" className="h-16 w-16" />
                <Skeleton variant="card" className="h-16 w-16" />
              </div>
            </div>
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Skeleton variant="text" className="w-3/4 h-8" />
              <Skeleton variant="text" className="w-1/2 h-6" />
              <Skeleton variant="card" className="h-44 w-full" />
            </div>
          </div>
        </main>
      </LayoutShell>
    )
  }

  if (isError || !product) {
    return (
      <LayoutShell>
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 flex flex-col items-center justify-center text-center gap-6">
          <Card variant="surface" className="flex flex-col items-center gap-4 p-12">
            <h2 className="text-2xl font-semibold text-ink">{t('product.notFound')}</h2>
            <p className="text-muted max-w-md">{t('product.notFoundDesc')}</p>
            <Button variant="accent" size="md" onClick={() => navigate('/market')}>
              {t('product.backToMarket')}
            </Button>
          </Card>
        </main>
      </LayoutShell>
    )
  }

  const images = product.images.length > 0 ? product.images : ['/images/marketplace.bmp']
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100)

  return (
    <LayoutShell>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-forest hover:text-ink transition-colors font-medium self-start focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('product.backToMarket')}</span>
        </button>

        {/* Top Section: Media Gallery (Left) & Core Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================================================================
              LEFT: IMAGE GALLERY
              ================================================================== */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Primary Large Image */}
            <div className="relative w-full h-80 sm:h-96 rounded-card bg-surface-alt border border-line overflow-hidden flex items-center justify-center shadow-sm">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />

              {discountPercent > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="lime">
                    {discountPercent}% OFF
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-4 left-4">
                <span className="text-xs px-3 py-1 rounded-pill bg-ink/80 text-white font-medium backdrop-blur-sm">
                  {product.brand}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-input overflow-hidden border-2 transition-all p-1 bg-surface-alt shrink-0 ${
                      selectedImageIndex === idx ? 'border-forest scale-105' : 'border-line opacity-70'
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================================
              RIGHT: CORE DETAILS & PURCHASE ACTIONS
              ================================================================== */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Badge variant="forest">{product.brand}</Badge>
                <div className="flex items-center gap-1 text-xs text-forest font-semibold">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>{t('product.certified')}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight">
                {product.name}
              </h1>

              <p className="text-body text-muted leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            {/* Price Card: Surface (Cream) Card */}
            <Card variant="surface" className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-ink">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-base text-muted line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <Badge variant="lime" dot>
                  {t('product.stock', { count: product.stock })}
                </Badge>
              </div>

              <div className="text-xs text-ink/75 flex items-center gap-2">
                <span>{t('product.unit')} <strong>{product.unit}</strong></span>
                <span>•</span>
                <span>Includes all applicable GST</span>
              </div>

              {/* Interactive Quantity & Add to Cart Controls */}
              <div className="pt-2 flex flex-col gap-3">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-line rounded-pill bg-white px-2 py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                        className="w-8 h-8 rounded-pill flex items-center justify-center text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold text-ink text-sm">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        disabled={qty >= product.stock}
                        className="w-8 h-8 rounded-pill flex items-center justify-center text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="flex-1 justify-center"
                    >
                      {addedRecently ? (
                        <>
                          <Check className="w-5 h-5 text-ink mr-1" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 text-ink mr-1" />
                          <span>{t('product.addToCart')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled
                    className="w-full justify-center opacity-50 cursor-not-allowed"
                  >
                    Out of Stock
                  </Button>
                )}

                {addedRecently && (
                  <div className="p-3 rounded-card bg-surface-alt border border-forest/30 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs text-forest font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                      <span>{qty} item(s) added to your cart</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/cart')}
                      className="text-xs"
                    >
                      View Cart
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Seller Info Card: Alternates to Ink Card */}
            {product.seller && (
              <Card variant="ink" className="flex items-center justify-between gap-4 border-forest/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-pill bg-forest flex items-center justify-center text-white shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                      {t('product.seller')}
                    </span>
                    <span className="text-base font-medium text-white">
                      {product.seller.shop_name}
                    </span>
                    {product.seller.gst_no && (
                      <span className="text-xs font-mono text-muted">
                        {t('product.gst')} {product.seller.gst_no}
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant="lime" dot>
                  Verified
                </Badge>
              </Card>
            )}

            {/* Crop Tags */}
            {product.crop_tags && product.crop_tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                  {t('product.cropTags')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.crop_tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            SPECS & USAGE / DOSAGE SECTIONS (Alternating Cards)
            Cards alternate between --surface (cream) and --ink (black) only.
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-6 border-t border-line">
          {/* Technical Specifications Table: Surface Card */}
          <Card variant="surface" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-line">
              <div className="w-8 h-8 rounded-pill bg-surface-alt text-forest border border-line flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-medium text-ink">
                {t('product.specs')}
              </h3>
            </div>

            <div className="flex flex-col divide-y divide-line">
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-muted">Brand</span>
                <span className="text-ink font-medium">{product.brand}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-muted">Packaging Unit</span>
                <span className="text-ink font-medium">{product.unit}</span>
              </div>
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="py-2.5 flex items-center justify-between text-sm capitalize">
                  <span className="text-muted">{key.replace(/_/g, ' ')}</span>
                  <span className="text-ink font-medium text-right max-w-xs">{val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Usage & Application Guide: Ink Card */}
          <Card variant="ink" className="flex flex-col gap-6 border-forest/60">
            <div className="flex items-center gap-3 pb-3 border-b border-forest/60">
              <div className="w-8 h-8 rounded-pill bg-forest text-white flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-medium text-white">
                {t('product.usage')}
              </h3>
            </div>

            <div className="flex flex-col gap-4 text-sm text-white/90">
              <div className="p-4 rounded-input bg-forest/30 border border-forest flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">Recommended Dosage Rate</span>
                  <p className="text-xs text-muted leading-relaxed">
                    {product.specs.dosage || 'Refer to certified product pack label or consult Kisan OS agronomist advisory.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-input bg-forest/30 border border-forest flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">Best Application Timing</span>
                  <p className="text-xs text-muted leading-relaxed">
                    Apply during cool morning hours (6:00 AM - 9:00 AM) or late afternoon. Avoid spraying under strong sunlight or impending rainfall.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </LayoutShell>
  )
}
