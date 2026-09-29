import React, { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import type { UserAddress } from '@/lib/supabase/types'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: Partial<UserAddress> & {
    full_name: string
    phone: string
    village: string
    district: string
    state: string
    pincode: string
  }) => Promise<void>
  initialData?: UserAddress | null
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const [landmark, setLandmark] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '')
      setPhone(initialData.phone || '')
      setVillage(initialData.village || '')
      setLandmark(initialData.landmark || '')
      setDistrict(initialData.district || '')
      setState(initialData.state || '')
      setPincode(initialData.pincode || '')
      setIsDefault(Boolean(initialData.is_default))
    } else {
      setFullName('')
      setPhone('')
      setVillage('')
      setLandmark('')
      setDistrict('')
      setState('')
      setPincode('')
      setIsDefault(false)
    }
    setError('')
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !phone.trim() || !village.trim() || !district.trim() || !state.trim() || !pincode.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit postal pincode.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        id: initialData?.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        village: village.trim(),
        landmark: landmark.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        is_default: isDefault,
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Farm Delivery Address' : 'Add New Farm Delivery Address'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {error && (
          <div className="p-3 rounded-card bg-surface-alt border border-danger/40 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Farmer / Contact Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Gurpreet Singh"
            required
          />

          <Input
            label="Mobile Number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone"
            maxLength={10}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Village / Farm Location *"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="e.g. Rampur Kalan"
            required
          />

          <Input
            label="Landmark (Optional)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Gurudwara / Canal bridge"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="District *"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Ludhiana"
            required
          />

          <Input
            label="State *"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Punjab"
            required
          />

          <Input
            label="Pincode *"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 141001"
            maxLength={6}
            required
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer pt-1 select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-line text-forest focus:ring-forest"
          />
          <span className="text-xs font-medium text-ink">
            Set as default shipping address for farmgate deliveries
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
