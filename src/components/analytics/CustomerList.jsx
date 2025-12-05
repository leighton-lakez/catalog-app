import { formatCurrency, formatDate } from '../../lib/utils'

export default function CustomerList({ customers }) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Customers</h3>
        <p className="text-gray-500 text-center py-8 text-sm">No customers yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Customers ({customers.length})</h3>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-gray-100">
        {customers.map((customer, index) => (
          <div key={index} className="p-4">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-medium text-gray-900 text-sm truncate">{customer.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {customer.email || customer.phone}
                </p>
              </div>
              <span className="font-semibold text-green-600 text-sm">{formatCurrency(customer.total_spent)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>{customer.orders} order{customer.orders !== 1 ? 's' : ''}</span>
              <span>{customer.last_order ? formatDate(customer.last_order) : '-'}</span>
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
                Customer
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Last Order
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {customer.email || customer.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-gray-900">
                  {customer.orders}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-gray-500 hidden md:table-cell">
                  {customer.last_order ? formatDate(customer.last_order) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
