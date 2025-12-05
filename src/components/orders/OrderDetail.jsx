import { useState } from 'react'
import { formatCurrency, formatDateTime, ORDER_STATUSES, PAYMENT_METHODS } from '../../lib/utils'
import OrderStatusBadge from './OrderStatusBadge'
import Button from '../ui/Button'
import { PlusIcon, XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'

// Predefined tag colors
const TAG_COLORS = [
  { name: 'gray', bg: 'bg-gray-100', text: 'text-gray-700' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-700' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-700' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-700' },
]

export default function OrderDetail({ order, onUpdateStatus, onUpdateNotes, onUpdateTags, onClose }) {
  const [updating, setUpdating] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [internalNotes, setInternalNotes] = useState(order.internal_notes || '')
  const [newTag, setNewTag] = useState('')
  const [selectedTagColor, setSelectedTagColor] = useState('blue')
  const [showTagInput, setShowTagInput] = useState(false)

  // Parse tags from order
  const tags = order.tags ? (typeof order.tags === 'string' ? JSON.parse(order.tags) : order.tags) : []

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await onUpdateStatus(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const paymentInfo = PAYMENT_METHODS[order.payment_method]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Order placed</p>
          <p className="font-medium">{formatDateTime(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{order.customer_phone}</p>
          </div>
          {order.customer_email && (
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
          )}
          {order.customer_address && (
            <div className="col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="font-medium">{order.customer_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl">{paymentInfo?.icon}</span>
          <span className="font-medium">{paymentInfo?.name || order.payment_method}</span>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.unit_price)} x {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                {formatCurrency(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-semibold text-blue-600">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Customer Notes */}
      {order.notes && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Notes</h3>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Tags */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Tags</h3>
          {!showTagInput && (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              Add Tag
            </button>
          )}
        </div>

        {/* Existing Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.length === 0 && !showTagInput && (
            <p className="text-sm text-gray-500">No tags added</p>
          )}
          {tags.map((tag, index) => {
            const colorObj = TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[5]
            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorObj.bg} ${colorObj.text}`}
              >
                {tag.name}
                {onUpdateTags && (
                  <button
                    onClick={() => {
                      const newTags = tags.filter((_, i) => i !== index)
                      onUpdateTags(order.id, newTags)
                    }}
                    className="hover:opacity-70"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </span>
            )
          })}
        </div>

        {/* Add Tag Input */}
        {showTagInput && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tag name..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim() && onUpdateTags) {
                    const newTags = [...tags, { name: newTag.trim(), color: selectedTagColor }]
                    onUpdateTags(order.id, newTags)
                    setNewTag('')
                    setShowTagInput(false)
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newTag.trim() && onUpdateTags) {
                    const newTags = [...tags, { name: newTag.trim(), color: selectedTagColor }]
                    onUpdateTags(order.id, newTags)
                    setNewTag('')
                    setShowTagInput(false)
                  }
                }}
                disabled={!newTag.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowTagInput(false)
                  setNewTag('')
                }}
                className="px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedTagColor(color.name)}
                  className={`w-5 h-5 rounded-full ${color.bg} ${
                    selectedTagColor === color.name ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Internal Notes (for reseller) */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Internal Notes</h3>
          {!isEditingNotes ? (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (onUpdateNotes) {
                    await onUpdateNotes(order.id, internalNotes)
                  }
                  setIsEditingNotes(false)
                }}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <CheckIcon className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setInternalNotes(order.internal_notes || '')
                  setIsEditingNotes(false)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {isEditingNotes ? (
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Add internal notes about this order..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="text-sm text-gray-700">
            {order.internal_notes || <span className="text-gray-400 italic">No internal notes</span>}
          </p>
        )}
      </div>

      {/* Status Actions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ORDER_STATUSES).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={updating || order.status === key}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                order.status === key
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : `${color} hover:opacity-80`
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
