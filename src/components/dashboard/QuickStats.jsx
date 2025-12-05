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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Today's Orders */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500">Today's Orders</span>
          <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500">Today's Revenue</span>
          <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(stats.todayRevenue)}</div>
        {stats.revenueChange !== 0 && (
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs mt-1 ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.revenueChange > 0 ? (
              <ArrowTrendingUpIcon className="h-3 w-3" />
            ) : (
              <ArrowTrendingDownIcon className="h-3 w-3" />
            )}
            <span className="truncate">{Math.abs(stats.revenueChange).toFixed(0)}% vs yesterday</span>
          </div>
        )}
      </div>

      {/* Pending Orders */}
      <div className={`rounded-xl p-3 sm:p-4 border shadow-sm ${stats.pendingOrders > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500">Pending</span>
          <ClockIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${stats.pendingOrders > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
        </div>
        <div className={`text-xl sm:text-2xl font-bold ${stats.pendingOrders > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>
          {stats.pendingOrders}
        </div>
        {stats.pendingOrders > 0 && (
          <span className="text-[10px] sm:text-xs text-yellow-600">Needs attention</span>
        )}
      </div>

      {/* Low Stock */}
      <div className={`rounded-xl p-3 sm:p-4 border shadow-sm ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500">Low Stock</span>
          <ExclamationTriangleIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
        </div>
        <div className={`text-xl sm:text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>
          {stats.lowStockCount}
        </div>
        {stats.lowStockCount > 0 && (
          <span className="text-[10px] sm:text-xs text-red-600">{stats.lowStockCount} item{stats.lowStockCount > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}
