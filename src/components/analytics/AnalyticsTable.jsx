import { formatCurrency, formatDate } from '../../lib/utils'

export default function AnalyticsTable({ productSales, title = 'Product Sales' }) {
  if (productSales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8 text-sm">No sales data yet</p>
      </div>
    )
  }

  const totals = productSales.reduce(
    (acc, item) => ({
      quantity: acc.quantity + item.quantity_sold,
      revenue: acc.revenue + item.revenue,
    }),
    { quantity: 0, revenue: 0 }
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-xs sm:text-sm text-gray-500">
          <span className="font-semibold text-green-600">{formatCurrency(totals.revenue)}</span>
          <span className="mx-1">·</span>
          <span>{totals.quantity} sold</span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-gray-100">
        {productSales.map((item) => (
          <div key={item.product_id} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{item.product_name}</span>
              <span className="font-semibold text-green-600 text-sm">{formatCurrency(item.revenue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.quantity_sold} units sold</span>
              <span>{item.last_sale ? formatDate(item.last_sale) : '-'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Last Sale
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productSales.map((item) => (
              <tr key={item.product_id} className="hover:bg-gray-50">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{item.product_name}</span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-gray-900">
                  {item.quantity_sold}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                  {formatCurrency(item.revenue)}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-gray-500 hidden md:table-cell">
                  {item.last_sale ? formatDate(item.last_sale) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
