import { useState } from 'react'
import { PlusIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { PAYMENT_METHODS } from '../../lib/utils'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import EmptyState from '../ui/EmptyState'

export default function PaymentMethodsForm() {
  const { paymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, loading } = usePaymentMethods()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [details, setDetails] = useState({})
  const [formLoading, setFormLoading] = useState(false)

  const handleOpenModal = () => {
    setSelectedType('')
    setDetails({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedType('')
    setDetails({})
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setDetails({})
  }

  const handleDetailChange = (field) => (e) => {
    setDetails(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedType) return

    setFormLoading(true)
    try {
      await createPaymentMethod(selectedType, details)
      handleCloseModal()
    } catch (error) {
      console.error('Error adding payment method:', error)
      alert('Failed to add payment method')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (method) => {
    try {
      await updatePaymentMethod(method.id, { is_active: !method.is_active })
    } catch (error) {
      console.error('Error updating payment method:', error)
      alert('Failed to update payment method')
    }
  }

  const handleDelete = async (method) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        await deletePaymentMethod(method.id)
      } catch (error) {
        console.error('Error deleting payment method:', error)
        alert('Failed to delete payment method')
      }
    }
  }

  const availableTypes = Object.keys(PAYMENT_METHODS).filter(
    type => !paymentMethods.some(m => m.type === type)
  )

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-xs sm:text-sm text-gray-500">Add the payment methods you accept</p>
        </div>
        {availableTypes.length > 0 && (
          <Button onClick={handleOpenModal} className="w-full sm:w-auto">
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Method
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="No payment methods"
          description="Add payment methods so customers know how to pay you"
          action={
            <Button onClick={handleOpenModal}>
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Payment Method
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const methodInfo = PAYMENT_METHODS[method.type]
            return (
              <div key={method.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">{methodInfo?.icon}</span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{methodInfo?.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {Object.entries(method.details || {}).map(([key, value]) => (
                          <span key={key}>{value}</span>
                        )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ' • ', curr], [])}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.is_active}
                        onChange={() => handleToggleActive(method)}
                        className="sr-only peer"
                      />
                      <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleDelete(method)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Payment Method"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!selectedType ? (
            <div className="grid grid-cols-2 gap-3">
              {availableTypes.map((type) => {
                const info = PAYMENT_METHODS[type]
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <p className="mt-2 font-medium text-gray-900">{info.name}</p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{PAYMENT_METHODS[selectedType].icon}</span>
                <span className="font-medium">{PAYMENT_METHODS[selectedType].name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedType('')}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>

              {PAYMENT_METHODS[selectedType].fields.map((field) => (
                <Input
                  key={field}
                  label={field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  value={details[field] || ''}
                  onChange={handleDetailChange(field)}
                  placeholder={PAYMENT_METHODS[selectedType].placeholder[field]}
                  required
                />
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={formLoading}>
                  Add Method
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
