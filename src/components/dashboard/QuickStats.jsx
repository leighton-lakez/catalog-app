import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

export default function QuickStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    revenueChange: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Fetch today's orders
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('reseller_id', user.id)
          .gte('created_at', today.toISOString())
          .is('deleted_at', null)

        // Fetch yesterday's orders for comparison
        const { data: yesterdayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('reseller_id', user.id)
          .gte('created_at', yesterday.toISOString())
          .lt('created_at', today.toISOString())
          .is('deleted_at', null)

        // Fetch pending orders count
        const { count: pendingCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('reseller_id', user.id)
          .eq('status', 'pending')
          .is('deleted_at', null)

        // Fetch low stock products
        const { count: lowStockCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('reseller_id', user.id)
          .eq('is_active', true)
          .gte('stock_quantity', 0)
          .lte('stock_quantity', 5) // Default low stock threshold

        const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const yesterdayRevenue = yesterdayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

        // Calculate percentage change
        let revenueChange = 0
        if (yesterdayRevenue > 0) {
          revenueChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        } else if (todayRevenue > 0) {
          revenueChange = 100
        }

        setStats({
          todayOrders: todayOrders?.length || 0,
          todayRevenue,
          pendingOrders: pendingCount || 0,
          lowStockCount: lowStockCount || 0,
          revenueChange,
        })
      } catch (error) {
        console.error('Error fetching quick stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border animate-pulse">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 mb-2 sm:mb-3" />
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Orders */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500">Orders</span>
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg sm:rounded-xl">
              <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.todayOrders}</div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500">Revenue</span>
            <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg sm:rounded-xl">
              <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</div>
          {stats.revenueChange !== 0 && (
            <div className={`flex items-center gap-1 text-xs mt-1 sm:mt-2 ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenueChange > 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="truncate">{Math.abs(stats.revenueChange).toFixed(0)}% vs yesterday</span>
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className={`rounded-xl p-3 sm:p-4 border shadow-sm ${stats.pendingOrders > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500">Pending</span>
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${stats.pendingOrders > 0 ? 'bg-yellow-100' : 'bg-gray-50'}`}>
              <ClockIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${stats.pendingOrders > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${stats.pendingOrders > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>
            {stats.pendingOrders}
          </div>
          {stats.pendingOrders > 0 && (
            <span className="text-xs text-yellow-600 mt-1 block">Needs attention</span>
          )}
        </div>

        {/* Low Stock */}
        <div className={`rounded-xl p-3 sm:p-4 border shadow-sm ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500">Low Stock</span>
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${stats.lowStockCount > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
              <ExclamationTriangleIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>
            {stats.lowStockCount}
          </div>
          {stats.lowStockCount > 0 && (
            <span className="text-xs text-red-600 mt-1 block">{stats.lowStockCount} item{stats.lowStockCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}
