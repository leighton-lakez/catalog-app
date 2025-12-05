import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, PlusIcon, MinusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../lib/utils'
import Button from '../ui/Button'

export default function QuickOrderEntry({
  products,
  onSubmit,
  onCancel,
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    notes: '',
  })
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10)

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addProduct = (product) => {
    const existing = orderItems.find(item => item.product_id === product.id)
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([...orderItems, {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        cost_price: product.cost_price || 0,
        quantity: 1,
        image_url: product.image_url,
      }])
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const updateQuantity = (productId, delta) => {
    setOrderItems(orderItems.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeItem = (productId) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const totalCost = orderItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0)
  const profit = subtotal - totalCost

  const handleSubmit = (e) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      alert('Please add at least one product')
      return
    }
    if (!customerInfo.customer_name || !customerInfo.customer_phone) {
      alert('Please enter customer name and phone')
      return
    }

    onSubmit({
      ...customerInfo,
      items: orderItems,
      total_amount: subtotal,
      payment_method: 'manual',
      status: 'pending',
    })
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Order Entry</h2>
        {onCancel && (
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Search */}
        <div className="mb-6" ref={searchRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Products
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No products found</div>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                      </div>
                      <PlusIcon className="h-5 w-5 text-blue-600" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Items ({orderItems.length})
            </label>
            <div className="border rounded-lg divide-y">
              {orderItems.map(item => (
                <div key={item.product_id} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.unit_price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-medium">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. Profit</span>
                <span className="font-medium text-green-600">{formatCurrency(profit)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={customerInfo.customer_name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone *</label>
              <input
                type="tel"
                value={customerInfo.customer_phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={customerInfo.customer_email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customer_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={customerInfo.customer_address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customer_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <textarea
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Order notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading || orderItems.length === 0}>
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
