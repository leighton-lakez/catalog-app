import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { submitOrder } from '../../hooks/useOrders'
import { formatCurrency, PAYMENT_METHODS } from '../../lib/utils'
import Input, { Textarea } from '../ui/Input'
import Button from '../ui/Button'

export default function CheckoutForm({ store, paymentMethods }) {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    source_platform: '',
    payment_method: paymentMethods[0]?.type || '',
    notes: '',
  })

  const SOURCE_PLATFORMS = [
    { id: 'snapchat', name: 'Snapchat', icon: '👻' },
    { id: 'offerup', name: 'OfferUp', icon: '🏷️' },
    { id: 'marketplace', name: 'Facebook Marketplace', icon: '🛒' },
    { id: 'dhgate', name: 'DHgate', icon: '📦' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'direct', name: 'Direct/In-Person', icon: '🤝' },
    { id: 'other', name: 'Other', icon: '📱' },
  ]

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.source_platform) {
      setError('Please select how you found us')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        reseller_id: store.id,
        ...formData,
        total_amount: getTotal(),
      }

      await submitOrder(orderData, items)
      setSuccess(true)
      clearCart()
    } catch (err) {
      console.error('Order error:', err)
      setError('Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.type === formData.payment_method)
  const themeColor = store?.theme_color || '#3B82F6'

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-green-50 rounded-xl p-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: themeColor }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. The seller will contact you shortly to confirm your order and arrange payment.
          </p>

          {selectedPaymentMethod && (
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Instructions</h3>
              <p className="text-sm text-gray-600">
                Pay via {PAYMENT_METHODS[selectedPaymentMethod.type]?.name}:
              </p>
              <div className="mt-2 text-sm">
                {Object.entries(selectedPaymentMethod.details).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500">{key}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => navigate(`/store/${store.store_slug}`)}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Button onClick={() => navigate(`/store/${store.store_slug}`)}>
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <span className="font-medium" style={{ color: themeColor }}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span style={{ color: themeColor }}>{formatCurrency(getTotal())}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.customer_name}
              onChange={handleChange('customer_name')}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.customer_email}
              onChange={handleChange('customer_email')}
              placeholder="john@example.com"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.customer_phone}
              onChange={handleChange('customer_phone')}
              placeholder="(555) 123-4567"
              required
            />

            <Textarea
              label="Delivery Address"
              value={formData.customer_address}
              onChange={handleChange('customer_address')}
              placeholder="123 Main St, City, State ZIP"
              rows={2}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you find us? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOURCE_PLATFORMS.map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center gap-1 sm:gap-2 p-2 border rounded-lg cursor-pointer transition-all text-xs sm:text-sm ${
                      formData.source_platform === platform.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="source_platform"
                      value={platform.id}
                      checked={formData.source_platform === platform.id}
                      onChange={handleChange('source_platform')}
                      className="sr-only"
                    />
                    <span>{platform.icon}</span>
                    <span className="truncate">{platform.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const info = PAYMENT_METHODS[method.type]
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.payment_method === method.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.type}
                        checked={formData.payment_method === method.type}
                        onChange={handleChange('payment_method')}
                        className="sr-only"
                      />
                      <span className="text-xl mr-3">{info?.icon}</span>
                      <div>
                        <span className="font-medium">{info?.name}</span>
                        <p className="text-sm text-gray-500">
                          {Object.values(method.details).join(' • ')}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <Textarea
              label="Order Notes (Optional)"
              value={formData.notes}
              onChange={handleChange('notes')}
              placeholder="Any special instructions..."
              rows={2}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3"
              style={{ backgroundColor: themeColor }}
            >
              Submit Order
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
