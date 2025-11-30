import { formatCurrency, formatDate } from '../../lib/utils'

export default function AnalyticsTable({ productSales, title = 'Product Sales' }) {
  if (productSales.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No sales data yet</p>
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
    <div className="card overflow-hidden p-0">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty Sold
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sale
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productSales.map((item) => (
              <tr key={item.product_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{item.product_name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                  {item.quantity_sold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                  {formatCurrency(item.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                  {item.last_sale ? formatDate(item.last_sale) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                {totals.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                {formatCurrency(totals.revenue)}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
