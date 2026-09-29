import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  CheckCircle2,
  Package,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { getScaledInputChecklist } from '@/lib/api/planner'
import { useAddToCart } from '@/lib/api/cart'
import { useAuth } from '@/context/AuthContext'

interface InputChecklistTabProps {
  cropId: string
  cropName: string
  landSize: number
  landUnit?: string
}

export const InputChecklistTab: React.FC<InputChecklistTabProps> = ({
  cropId,
  cropName,
  landSize,
  landUnit = 'acres',
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const addToCartMutation = useAddToCart()

  const [isAddingAll, setIsAddingAll] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const items = getScaledInputChecklist(cropId, landSize)
  const totalEstimatedCost = items.reduce((acc, i) => acc + i.total_cost, 0)
  const matchableItems = items.filter((i) => Boolean(i.product_id))

  const handleAddAllToCart = async () => {
    setErrorMessage('')

    if (!user) {
      navigate('/login')
      return
    }

    try {
      setIsAddingAll(true)
      // Add each item to the user's persisted cart
      for (const item of matchableItems) {
        if (item.product_id) {
          const qtyToAdd = Math.max(1, Math.ceil(item.total_qty))
          await addToCartMutation.mutateAsync({
            productId: item.product_id,
            qty: qtyToAdd,
          })
        }
      }

      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 6000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add inputs to cart'
      setErrorMessage(msg)
    } finally {
      setIsAddingAll(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Summary Banner */}
      <Card variant="surface" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">
              Farm Input Requirement
            </span>
            <Badge variant="forest">Scaled for {landSize} {landUnit}</Badge>
          </div>
          <h3 className="text-xl font-bold text-ink">
            Required Inputs for {cropName}
          </h3>
          <p className="text-xs text-muted">
            Agronomy-calculated dosages per acre calibrated to your plot size.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 border-t sm:border-t-0 border-line pt-3 sm:pt-0">
          <span className="text-xs text-muted uppercase font-semibold">Total Estimated Inputs</span>
          <span className="text-2xl font-bold text-ink">
            ₹{totalEstimatedCost.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-forest font-medium">Includes seeds & basal nutrients</span>
        </div>
      </Card>

      {/* Added to Cart Feedback Toast / Banner */}
      {addedSuccess && (
        <div className="p-4 rounded-card bg-surface border border-lime-strong flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-pill bg-lime flex items-center justify-center text-ink shrink-0">
              <Check className="w-4 h-4 text-ink" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink">
                All {matchableItems.length} Required Inputs Added to Cart!
              </span>
              <span className="text-xs text-muted">
                Packaged and ready for farmgate delivery checkout.
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cart')}
            className="text-xs shrink-0"
          >
            <span>Open Cart</span>
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-card bg-surface-alt border border-danger/40 text-danger text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Items List Table / Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Consumable Inputs Checklist ({items.length})
          </span>

          <Button
            variant="primary"
            size="md"
            onClick={handleAddAllToCart}
            disabled={isAddingAll || matchableItems.length === 0}
            className="shadow-md"
          >
            {isAddingAll ? (
              <span>Adding to Cart...</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1 text-ink" />
                <span>Add All to Cart ({matchableItems.length} Products)</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const hasMarketMatch = Boolean(item.product_id)

            return (
              <Card
                key={idx}
                variant="surface"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:border-forest/40 transition-colors"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-10 h-10 rounded-pill bg-white border border-line flex items-center justify-center text-forest shrink-0 mt-0.5">
                    {item.category === 'Seeds' ? (
                      <Package className="w-5 h-5 text-forest" />
                    ) : (
                      <Layers className="w-5 h-5 text-forest" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="forest">{item.category}</Badge>
                      {item.mandatory && (
                        <Badge variant="lime">Required</Badge>
                      )}
                      {hasMarketMatch ? (
                        <span className="text-[11px] text-forest font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-pill border border-line">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                          <span>Matched in Marketplace</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted font-medium bg-white px-2 py-0.5 rounded-pill border border-line">
                          Local Hub Sourced
                        </span>
                      )}
                    </div>

                    <span className="text-sm sm:text-base font-bold text-ink mt-1">
                      {item.name}
                    </span>

                    <span className="text-xs text-muted">
                      Base Dosage: {item.qty_per_acre} {item.unit} / acre
                    </span>
                  </div>
                </div>

                {/* Right Quantity & Cost */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-line pt-2.5 sm:pt-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs font-semibold text-forest">
                      Farm Total: <strong>{item.total_qty} {item.unit}</strong>
                    </span>
                    <span className="text-base font-bold text-ink">
                      ₹{item.total_cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
