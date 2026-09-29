import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export interface ProductCardProps {
  id: string
  name: string
  image: string
  price: number
  mrp: number
  badge?: string
  buttonVariant?: 'lime' | 'surface'
  onClick?: () => void
  onAction?: (e: React.MouseEvent) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  mrp,
  badge,
  buttonVariant = 'surface',
  onClick,
  onAction,
}) => {
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
  const displayBadge = badge || (discountPercent > 0 ? `-${discountPercent}%` : undefined)
  const isLimeButton = buttonVariant === 'lime'

  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 320, h: 240 })

  useEffect(() => {
    if (!boxRef.current) return
    const el = boxRef.current
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { w, h } = size
  const R = 28 // Outer corner radius
  const fillet = 16 // Smooth concave fillet radius
  const notchR = 28 // Concentric arc radius around the button

  // Concentric mathematical path forming the cream box with bottom-right scalloped notch
  const pathData = `
    M ${R} 0
    H ${Math.max(R, w - R)}
    A ${R} ${R} 0 0 1 ${w} ${R}
    V ${Math.max(R, h - notchR - 28 - fillet)}
    A ${fillet} ${fillet} 0 0 0 ${w - fillet} ${h - notchR - 28}
    H ${w - 28}
    A ${notchR} ${notchR} 0 0 1 ${w - notchR - 28} ${h - 28}
    V ${h - fillet}
    A ${fillet} ${fillet} 0 0 0 ${w - notchR - 28 - fillet} ${h}
    H ${R}
    A ${R} ${R} 0 0 1 0 ${h - R}
    V ${R}
    A ${R} ${R} 0 0 1 ${R} 0
    Z
  `

  return (
    <div className="flex flex-col gap-3 group w-full">
      {/* 1. Cream Image Box with Concentric Scalloped Notch */}
      <div
        ref={boxRef}
        className="relative w-full h-56 sm:h-64 flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-md"
      >
        {/* Seamless Notched SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
          viewBox={`0 0 ${w} ${h}`}
        >
          <path
            d={pathData}
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1"
          />
        </svg>

        {/* Top-Right Discount Badge */}
        {displayBadge && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--warning)] text-white shadow-xs">
              {displayBadge}
            </span>
          </div>
        )}

        {/* Product Image */}
        <Link
          to={`/product/${id}`}
          onClick={onClick}
          className="relative z-10 w-full h-full flex items-center justify-center focus:outline-none pr-8 pb-8"
        >
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Circular Action Button Nestled Exactly Concentric in the Notch */}
        <Link
          to={`/product/${id}`}
          onClick={onAction || onClick}
          className={`absolute bottom-1.5 right-1.5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm z-20 ${
            isLimeButton
              ? 'bg-[var(--lime)] text-[var(--forest)] hover:bg-[var(--lime-strong)]'
              : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)] hover:bg-[var(--lime)] hover:text-[var(--forest)]'
          }`}
          title="View Product"
        >
          <ArrowUpRight className="w-5 h-5 font-bold" />
        </Link>
      </div>

      {/* 2. Product Information (Below the Box) */}
      <div className="flex flex-col gap-1 px-1">
        <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight hover:text-[var(--forest)] transition-colors line-clamp-1">
          <Link to={`/product/${id}`} onClick={onClick}>
            {name}
          </Link>
        </h4>

        {/* Pricing: Strikethrough MRP + Sale Price */}
        <div className="flex items-baseline gap-2">
          {mrp > price && (
            <span className="text-xs sm:text-sm text-[var(--muted)] line-through font-medium">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-base sm:text-lg font-extrabold text-[var(--ink)]">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  )
}
