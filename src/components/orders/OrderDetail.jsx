import { useState } from 'react'
import { formatCurrency, formatDateTime, ORDER_STATUSES, PAYMENT_METHODS } from '../../lib/utils'
import OrderStatusBadge from './OrderStatusBadge'
import Button from '../ui/Button'

export default function OrderDetail({ order, onUpdateStatus, onClose }) {
  const [updating, setUpdating] = useState(false)

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

      {/* Notes */}
      {order.notes && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Notes</h3>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

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
