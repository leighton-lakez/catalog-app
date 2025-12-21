import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

export default function AdminAnalytics() {
  const { reseller } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')
  const [analytics, setAnalytics] = useState({
    revenueByDay: [],
    ordersByDay: [],
    topStores: [],
    topProducts: [],
    growthStats: {
      revenue: { current: 0, previous: 0, change: 0 },
      orders: { current: 0, previous: 0, change: 0 },
      users: { current: 0, previous: 0, change: 0 },
    },
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!reseller?.is_admin) return

      setLoading(true)
      try {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const previousStartDate = new Date()
        previousStartDate.setDate(previousStartDate.getDate() - days * 2)

        // Fetch orders for current period
        const { data: currentOrders } = await supabase
          .from('orders')
          .select('total_amount, created_at, reseller_id')
          .is('deleted_at', null)
          .gte('created_at', startDate.toISOString())

        // Fetch orders for previous period
        const { data: previousOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .is('deleted_at', null)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString())

        // Fetch resellers for current period
        const { count: currentUsers } = await supabase
          .from('resellers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())

        // Fetch resellers for previous period
        const { count: previousUsers } = await supabase
          .from('resellers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString())

        // Fetch top stores by revenue
        const { data: storesData } = await supabase
          .from('orders')
          .select(`
            total_amount,
            reseller:resellers(id, store_name, store_slug)
          `)
          .is('deleted_at', null)
          .gte('created_at', startDate.toISOString())

        // Calculate metrics
        const currentRevenue = currentOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const previousRevenue = previousOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const currentOrderCount = currentOrders?.length || 0
        const previousOrderCount = previousOrders?.length || 0

        // Group by day for charts
        const revenueByDay = {}
        const ordersByDay = {}
        currentOrders?.forEach((order) => {
          const date = new Date(order.created_at).toLocaleDateString()
          revenueByDay[date] = (revenueByDay[date] || 0) + (order.total_amount || 0)
          ordersByDay[date] = (ordersByDay[date] || 0) + 1
        })

        // Calculate top stores
        const storeRevenue = {}
        storesData?.forEach((order) => {
          if (order.reseller) {
            const storeId = order.reseller.id
            if (!storeRevenue[storeId]) {
              storeRevenue[storeId] = {
                store_name: order.reseller.store_name,
                store_slug: order.reseller.store_slug,
                revenue: 0,
                orders: 0,
              }
            }
            storeRevenue[storeId].revenue += order.total_amount || 0
            storeRevenue[storeId].orders += 1
          }
        })

        const topStores = Object.values(storeRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)

        const calcChange = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return ((current - previous) / previous) * 100
        }

        setAnalytics({
          revenueByDay: Object.entries(revenueByDay)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
          ordersByDay: Object.entries(ordersByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
          topStores,
          growthStats: {
            revenue: {
              current: currentRevenue,
              previous: previousRevenue,
              change: calcChange(currentRevenue, previousRevenue),
            },
            orders: {
              current: currentOrderCount,
              previous: previousOrderCount,
              change: calcChange(currentOrderCount, previousOrderCount),
            },
            users: {
              current: currentUsers || 0,
              previous: previousUsers || 0,
              change: calcChange(currentUsers || 0, previousUsers || 0),
            },
          },
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [reseller?.is_admin, timeframe])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const { growthStats, topStores, revenueByDay } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="text-gray-400 mt-1">Performance metrics across all stores</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Revenue</p>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(growthStats.revenue.current)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`flex items-center text-sm ${
                growthStats.revenue.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {growthStats.revenue.change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(growthStats.revenue.change).toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm">vs previous period</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Orders</p>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{growthStats.orders.current}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`flex items-center text-sm ${
                growthStats.orders.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {growthStats.orders.change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(growthStats.orders.change).toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm">vs previous period</span>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">New Users</p>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CalendarDaysIcon className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{growthStats.users.current}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`flex items-center text-sm ${
                growthStats.users.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {growthStats.users.change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(growthStats.users.change).toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Simple Bar Representation) */}
      {revenueByDay.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue</h3>
          <div className="flex items-end gap-1 h-48 overflow-x-auto">
            {revenueByDay.map((day, index) => {
              const maxRevenue = Math.max(...revenueByDay.map((d) => d.amount))
              const height = maxRevenue > 0 ? (day.amount / maxRevenue) * 100 : 0
              return (
                <div key={index} className="flex flex-col items-center flex-1 min-w-[40px]">
                  <div
                    className="w-full bg-purple-500 rounded-t-sm transition-all hover:bg-purple-400"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${formatCurrency(day.amount)}`}
                  />
                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Stores */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Stores</h3>
        {topStores.length === 0 ? (
          <p className="text-gray-500 text-sm">No store data for this period</p>
        ) : (
          <div className="space-y-3">
            {topStores.map((store, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{store.store_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{store.orders} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-green-400">{formatCurrency(store.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
