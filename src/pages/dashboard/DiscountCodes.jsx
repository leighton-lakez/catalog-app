import { useState } from 'react'
import { useDiscountCodes } from '../../hooks/useDiscountCodes'
import { formatCurrency, formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  TicketIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function DiscountCodes() {
  const { discountCodes, loading, createDiscountCode, updateDiscountCode, deleteDiscountCode, toggleActive } = useDiscountCodes()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  })
  const [saving, setSaving] = useState(false)

  const handleOpenModal = (code = null) => {
    if (code) {
      setEditingCode(code)
      setFormData({
        code: code.code,
        type: code.type,
        value: code.value.toString(),
        min_order_amount: code.min_order_amount?.toString() || '',
        max_uses: code.max_uses?.toString() || '',
        expires_at: code.expires_at ? code.expires_at.split('T')[0] : '',
      })
    } else {
      setEditingCode(null)
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_uses: '',
        expires_at: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        code: formData.code.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      }

      if (editingCode) {
        await updateDiscountCode(editingCode.id, data)
      } else {
        await createDiscountCode(data)
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving discount code:', error)
      alert('Error saving discount code: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return
    try {
      await deleteDiscountCode(id)
    } catch (error) {
      console.error('Error deleting discount code:', error)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional codes for your store</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Code
        </Button>
      </div>

      {discountCodes.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No discount codes"
          description="Create your first discount code to offer promotions to your customers."
          action={
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Code
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discountCodes.map((code) => {
                const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                const isMaxedOut = code.max_uses && code.times_used >= code.max_uses

                return (
                  <tr key={code.id} className={!code.is_active || isExpired || isMaxedOut ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {code.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === code.code ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClipboardIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        {code.type === 'percentage' && `${code.value}% OFF`}
                        {code.type === 'fixed' && `${formatCurrency(code.value)} OFF`}
                        {code.type === 'free_shipping' && 'Free Shipping'}
                      </span>
                      {code.min_order_amount > 0 && (
                        <span className="text-xs text-gray-500 block">
                          Min. order: {formatCurrency(code.min_order_amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.times_used} / {code.max_uses || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.expires_at ? formatDate(code.expires_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          Expired
                        </span>
                      ) : isMaxedOut ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          Maxed Out
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleActive(code.id, !code.is_active)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            code.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {code.is_active ? 'Active' : 'Inactive'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(code)}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., SUMMER20"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                required
              />
              <Button type="button" variant="secondary" onClick={generateRandomCode}>
                Generate
              </Button>
            </div>
          </div>

          <Select
            label="Discount Type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'percentage', label: 'Percentage Off' },
              { value: 'fixed', label: 'Fixed Amount Off' },
              { value: 'free_shipping', label: 'Free Shipping' },
            ]}
          />

          {formData.type !== 'free_shipping' && (
            <Input
              label={formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              type="number"
              step={formData.type === 'percentage' ? '1' : '0.01'}
              min="0"
              max={formData.type === 'percentage' ? '100' : undefined}
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              required
            />
          )}

          <Input
            label="Minimum Order Amount ($)"
            type="number"
            step="0.01"
            min="0"
            value={formData.min_order_amount}
            onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
            hint="Leave empty for no minimum"
          />

          <Input
            label="Maximum Uses"
            type="number"
            min="1"
            value={formData.max_uses}
            onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
            hint="Leave empty for unlimited uses"
          />

          <Input
            label="Expiration Date"
            type="date"
            value={formData.expires_at}
            onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
            hint="Leave empty for no expiration"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingCode ? 'Update Code' : 'Create Code'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
