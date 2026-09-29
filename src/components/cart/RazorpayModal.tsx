import React, { useState } from 'react'
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, AlertCircle } from 'lucide-react'
import { Modal, Button, Card, Badge } from '@/components/ui'

interface RazorpayModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number // in INR
  onPaymentSuccess: (details: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSimulatePayment = () => {
    setIsProcessing(true)
    setErrorMessage('')

    setTimeout(() => {
      setIsProcessing(false)
      const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      const testSignature = `sig_test_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`

      onPaymentSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: testSignature,
      })
    }, 1200)
  }

  const handleSimulateFailure = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setErrorMessage('Bank server declined the transaction. Please try another payment method.')
    }, 1000)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Razorpay Secure Payment Gateway"
    >
      <div className="flex flex-col gap-5 mt-2">
        {/* Test Mode Banner */}
        <div className="p-3 rounded-card bg-surface-alt border border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="lime" dot>
              Test Mode Active
            </Badge>
            <span className="text-xs text-muted font-medium">Order ID: {orderId}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-forest font-semibold">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Amount to Pay */}
        <Card variant="surface" className="flex items-center justify-between p-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted font-medium">Total Amount Due</span>
            <span className="text-2xl font-bold text-ink">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-xs text-forest bg-white px-2.5 py-1 rounded-pill border border-line font-medium">
            Kisan OS Verified Merchant
          </span>
        </Card>

        {errorMessage && (
          <div className="p-3 rounded-card bg-surface-alt border border-danger/40 text-danger text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Payment Methods */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Select Payment Method
          </span>

          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`w-full p-3 rounded-card border text-left flex items-center justify-between transition-colors ${
              selectedMethod === 'upi'
                ? 'bg-white border-forest ring-1 ring-forest'
                : 'bg-surface-alt border-line hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">UPI (Instant)</span>
                <span className="text-xs text-muted">Google Pay, PhonePe, Paytm, BHIM</span>
              </div>
            </div>
            {selectedMethod === 'upi' && <CheckCircle2 className="w-4 h-4 text-forest" />}
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`w-full p-3 rounded-card border text-left flex items-center justify-between transition-colors ${
              selectedMethod === 'card'
                ? 'bg-white border-forest ring-1 ring-forest'
                : 'bg-surface-alt border-line hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">Credit / Debit Card</span>
                <span className="text-xs text-muted">Visa, MasterCard, RuPay, Maestro</span>
              </div>
            </div>
            {selectedMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-forest" />}
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('netbanking')}
            className={`w-full p-3 rounded-card border text-left flex items-center justify-between transition-colors ${
              selectedMethod === 'netbanking'
                ? 'bg-white border-forest ring-1 ring-forest'
                : 'bg-surface-alt border-line hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-pill bg-surface flex items-center justify-center text-forest">
                <Building className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">Net Banking</span>
                <span className="text-xs text-muted">SBI, HDFC, ICICI, PNB, Punjab Gramin Bank</span>
              </div>
            </div>
            {selectedMethod === 'netbanking' && <CheckCircle2 className="w-4 h-4 text-forest" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-line">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full justify-center shadow-md"
          >
            {isProcessing ? 'Processing Secure Payment...' : `Complete Test Payment (₹${amount.toLocaleString('en-IN')})`}
          </Button>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="text-xs text-danger hover:underline font-medium"
            >
              Test Payment Failure
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs text-muted hover:text-ink font-medium"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
