import { formatCurrency } from '../../lib/utils'
import { TrophyIcon } from '@heroicons/react/24/outline'

const rankColors = [
  'bg-gradient-to-r from-yellow-400 to-orange-400',
  'bg-gradient-to-r from-gray-300 to-gray-400',
  'bg-gradient-to-r from-amber-600 to-amber-700',
  'bg-gradient-to-r from-blue-400 to-blue-500',
  'bg-gradient-to-r from-purple-400 to-purple-500',
]

export default function TopProducts({ productSales, limit = 5 }) {
  const topProducts = productSales.slice(0, limit)

  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <TrophyIcon className="h-12 w-12 mb-3" />
          <p className="text-sm">No sales data yet</p>
          <p className="text-xs text-gray-400 mt-1">Your best sellers will appear here</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...topProducts.map(p => p.revenue))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.product_id} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full ${rankColors[index] || 'bg-gray-200'} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {product.product_name}
                </span>
              </div>
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {formatCurrency(product.revenue)}
              </span>
            </div>
            <div className="ml-10">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${rankColors[index] || 'bg-blue-500'} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {product.quantity_sold} units sold
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
