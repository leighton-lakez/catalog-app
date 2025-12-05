import { useState } from 'react'
import { useAbandonedCarts } from '../../hooks/useAbandonedCarts'
import { formatDate, formatCurrency } from '../../lib/utils'
import Button from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function AbandonedCarts() {
  const { abandonedCarts, loading, stats, markAsRecovered, deleteAbandonedCart, refetch } = useAbandonedCarts()
  const [filter, setFilter] = useState('all') // all, pending, recovered

  const filteredCarts = abandonedCarts.filter(cart => {
    if (filter === 'pending') return !cart.recovered
    if (filter === 'recovered') return cart.recovered
    return true
  })

  const handleMarkRecovered = async (cartId) => {
    try {
      await markAsRecovered(cartId)
    } catch (error) {
      console.error('Error marking cart as recovered:', error)
      alert('Failed to update cart')
    }
  }

  const handleDelete = async (cartId) => {
    if (!confirm('Are you sure you want to delete this abandoned cart?')) return
    try {
      await deleteAbandonedCart(cartId)
    } catch (error) {
      console.error('Error deleting cart:', error)
      alert('Failed to delete cart')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
          <p className="text-gray-500 mt-1">
            Track and recover incomplete checkouts
          </p>
        </div>
        <Button variant="secondary" onClick={refetch}>
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCartIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Abandoned</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Recovery</p>
              <p className="text-xl font-semibold">{stats.notRecovered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recovered</p>
              <p className="text-xl font-semibold">{stats.recovered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Potential Value</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({abandonedCarts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({stats.notRecovered})
        </button>
        <button
          onClick={() => setFilter('recovered')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'recovered'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Recovered ({stats.recovered})
        </button>
      </div>

      {/* Cart List */}
      {filteredCarts.length === 0 ? (
        <EmptyState
          icon={ShoppingCartIcon}
          title={filter === 'all' ? 'No abandoned carts' : `No ${filter} carts`}
          description={
            filter === 'all'
              ? 'When customers abandon their carts, they will appear here.'
              : `There are no ${filter} carts at the moment.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredCarts.map((cart) => (
            <div
              key={cart.id}
              className={`bg-white rounded-xl border p-5 ${
                cart.recovered ? 'border-green-200 bg-green-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {cart.customer_email || cart.customer_phone || 'Unknown Customer'}
                    </h3>
                    {cart.recovered ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Recovered
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {cart.customer_email && (
                      <span className="flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        {cart.customer_email}
                      </span>
                    )}
                    {cart.customer_phone && (
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="h-4 w-4" />
                        {cart.customer_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {formatDate(cart.created_at)}
                    </span>
                  </div>

                  {/* Cart Items */}
                  {cart.cart_items && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Cart Contents:</p>
                      <div className="space-y-1">
                        {(typeof cart.cart_items === 'string'
                          ? JSON.parse(cart.cart_items)
                          : cart.cart_items
                        ).slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.name || item.product_name} x{item.quantity}
                            </span>
                            <span className="text-gray-900">
                              {formatCurrency((item.price || item.unit_price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                        {(typeof cart.cart_items === 'string'
                          ? JSON.parse(cart.cart_items)
                          : cart.cart_items
                        ).length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{(typeof cart.cart_items === 'string'
                              ? JSON.parse(cart.cart_items)
                              : cart.cart_items
                            ).length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-lg font-semibold text-blue-600">
                    Total: {formatCurrency(cart.cart_total)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!cart.recovered && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkRecovered(cart.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Mark Recovered
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(cart.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
