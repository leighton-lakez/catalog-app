import { formatCurrency } from '../../lib/utils'

export default function PlatformStats({ platformStats }) {
  if (!platformStats || platformStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Sources</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No platform data yet</p>
          <p className="text-sm mt-1">Data will appear as orders come in</p>
        </div>
      </div>
    )
  }

  const totalOrders = platformStats.reduce((sum, p) => sum + p.orders, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Sources</h2>
      <p className="text-sm text-gray-500 mb-4">Which platforms bring you the most customers</p>

      <div className="space-y-3">
        {platformStats.map((platform, index) => {
          const percentage = totalOrders > 0 ? (platform.orders / totalOrders) * 100 : 0

          return (
            <div key={platform.platform} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{platform.icon}</span>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                  {index === 0 && platformStats.length > 1 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Top Source
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{platform.orders}</span>
                  <span className="text-gray-500 text-sm ml-1">orders</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: platform.color === '#FFFC00' ? '#EAB308' : platform.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                <span>{platform.customers} customers</span>
                <span>{formatCurrency(platform.revenue)} revenue</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{platformStats.length}</p>
            <p className="text-sm text-gray-500">Platforms</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(platformStats.reduce((sum, p) => sum + p.revenue, 0))}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  )
}
