import { useAdmin } from '../../hooks/useAdmin'
import { formatCurrency } from '../../lib/utils'
import {
  UsersIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 sm:p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-xs mt-2">{subtitle}</p>
          )}
        </div>
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { stats, resellers, orders, loading } = useAdmin()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const recentOrders = orders.slice(0, 5)
  const recentResellers = resellers.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and management</p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Today</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="New Resellers"
            value={stats.newResellersToday}
            icon={UserPlusIcon}
            color="purple"
          />
          <StatCard
            title="Orders"
            value={stats.ordersToday}
            icon={ShoppingCartIcon}
            color="blue"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.revenueToday)}
            icon={CurrencyDollarIcon}
            color="green"
          />
          <StatCard
            title="Active Now"
            value={stats.activeStores}
            icon={BuildingStorefrontIcon}
            color="orange"
            subtitle="Stores with products"
          />
        </div>
      </div>

      {/* All Time Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">All Time</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Resellers"
            value={stats.totalResellers}
            icon={UsersIcon}
            color="indigo"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={CubeIcon}
            color="pink"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCartIcon}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={ArrowTrendingUpIcon}
            color="green"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resellers */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Resellers</h3>
            <a href="/admin/users" className="text-sm text-purple-400 hover:text-purple-300">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentResellers.length === 0 ? (
              <p className="text-gray-500 text-sm">No resellers yet</p>
            ) : (
              recentResellers.map((reseller) => (
                <div key={reseller.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {reseller.store_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{reseller.store_name || 'Unnamed Store'}</p>
                      <p className="text-sm text-gray-400">/{reseller.store_slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reseller.is_admin && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                        Admin
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      reseller.is_active !== false
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {reseller.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{order.customer_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-400">
                      {order.reseller?.store_name || 'Unknown Store'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
