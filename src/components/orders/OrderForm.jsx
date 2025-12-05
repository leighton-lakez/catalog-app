import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { formatCurrency } from '../../lib/utils'
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function OrderForm({
  products,
  onSubmit,
  onCancel,
  loading,
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    source_platform: '',
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
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const addProduct = () => {
    if (!selectedProductId) return

    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const existing = selectedItems.find(item => item.id === product.id)
    if (existing) {
      setSelectedItems(items =>
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setSelectedItems(items => [...items, {
        id: product.id,
        name: product.name,
        originalPrice: product.price,
        price: product.price,
        cost_price: product.cost_price || 0,
        quantity: 1,
        stock_quantity: product.stock_quantity,
      }])
    }
    setSelectedProductId('')
  }

  const updatePrice = (productId, newPrice) => {
    setSelectedItems(items =>
      items.map(item =>
        item.id === productId
          ? { ...item, price: parseFloat(newPrice) || 0 }
          : item
      )
    )
  }

  const updateQuantity = (productId, delta) => {
    setSelectedItems(items =>
      items.map(item => {
        if (item.id !== productId) return item
        const newQty = Math.max(1, item.quantity + delta)
        // Check stock limit
        if (item.stock_quantity >= 0 && newQty > item.stock_quantity) {
          return item
        }
        return { ...item, quantity: newQty }
      })
    )
  }

  const removeItem = (productId) => {
    setSelectedItems(items => items.filter(item => item.id !== productId))
  }

  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalCost = selectedItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0)
  const totalProfit = total - totalCost

  const handleSubmit = (e) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      alert('Please add at least one product')
      return
    }

    if (!formData.source_platform) {
      alert('Please select where the customer found you')
      return
    }

    onSubmit({
      ...formData,
      items: selectedItems,
      total_amount: total,
    })
  }

  const availableProducts = products.filter(p => p.is_active)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            value={formData.customer_name}
            onChange={handleChange('customer_name')}
            placeholder="John Doe"
            required
          />
          <Input
            label="Phone Number"
            value={formData.customer_phone}
            onChange={handleChange('customer_phone')}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        <Input
          label="Email (optional)"
          type="email"
          value={formData.customer_email}
          onChange={handleChange('customer_email')}
          placeholder="customer@email.com"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Where did this customer find you? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SOURCE_PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all ${
                  formData.source_platform === platform.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                <span className="text-lg">{platform.icon}</span>
                <span className="text-sm font-medium truncate">{platform.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Order Items</h3>

        <div className="flex gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select a product...</option>
            {availableProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatCurrency(product.price)}
                {product.stock_quantity >= 0 ? ` (${product.stock_quantity} in stock)` : ''}
              </option>
            ))}
          </select>
          <Button type="button" onClick={addProduct} disabled={!selectedProductId}>
            <PlusIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Items */}
        {selectedItems.length > 0 ? (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {selectedItems.map(item => (
              <div key={item.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.price !== item.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        Original: {formatCurrency(item.originalPrice)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded-full hover:bg-red-50 text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Price:</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, e.target.value)}
                        className="w-24 pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Qty:</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <MinusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      disabled={item.stock_quantity >= 0 && item.quantity >= item.stock_quantity}
                    >
                      <PlusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <span className="w-24 text-right font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
            <div className="p-3 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
              </div>
              {totalCost > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Cost</span>
                    <span className="text-gray-600">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Profit</span>
                    <span className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalProfit)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            No items added yet. Select a product above.
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Order Notes (optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Any special instructions or notes..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={selectedItems.length === 0}>
          Create Order
        </Button>
      </div>
    </form>
  )
}
