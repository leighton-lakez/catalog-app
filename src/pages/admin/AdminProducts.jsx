import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatCurrency } from '../../lib/utils'
import {
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export default function AdminProducts() {
  const { products, fetchAllProducts, loading } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAllProducts(200)
  }, [fetchAllProducts])

  const filteredProducts = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reseller?.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Calculate summary stats
  const totalValue = filteredProducts.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0),
    0
  )
  const lowStockCount = filteredProducts.filter(
    (p) => p.stock_quantity !== null && p.stock_quantity <= 5
  ).length
  const outOfStockCount = filteredProducts.filter(
    (p) => p.stock_quantity !== null && p.stock_quantity === 0
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">All Products</h1>
        <p className="text-gray-400 mt-1">View all products across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Inventory Value</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-400">{lowStockCount}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by product name, SKU, or store..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Products List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  Added
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-500 text-xs">No img</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-white">
                        {product.reseller?.store_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white">
                        {formatCurrency(product.price)}
                      </span>
                      {product.cost_price && (
                        <p className="text-xs text-gray-400">
                          Cost: {formatCurrency(product.cost_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {product.stock_quantity !== null ? (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock_quantity === 0
                              ? 'bg-red-500/20 text-red-400'
                              : product.stock_quantity <= 5
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {product.stock_quantity} units
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-gray-400 text-sm">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <a
                          href={`/store/${product.reseller?.store_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="View in Store"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
