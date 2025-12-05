import { useAnalytics } from '../../hooks/useAnalytics'
import StatsCard from '../../components/dashboard/StatsCard'
import AnalyticsTable from '../../components/analytics/AnalyticsTable'
import { RevenueChart, OrdersChart } from '../../components/analytics/SalesChart'
import TopProducts from '../../components/analytics/TopProducts'
import CustomerList from '../../components/analytics/CustomerList'
import { formatCurrency } from '../../lib/utils'
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline'

export default function Analytics() {
  const {
    loading,
    stats,
    productSales,
    salesByDay,
    customers,
    dateRange,
    setDateRange,
  } = useAnalytics()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={loading ? '-' : stats.totalProducts}
          icon={CubeIcon}
        />
        <StatsCard
          title="Total Orders"
          value={loading ? '-' : stats.totalOrders}
          icon={ShoppingCartIcon}
        />
        <StatsCard
          title="Total Revenue"
          value={loading ? '-' : formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
        />
        <StatsCard
          title="Avg Order Value"
          value={loading ? '-' : formatCurrency(stats.averageOrderValue || 0)}
          icon={CalculatorIcon}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart data={salesByDay} />
        <OrdersChart data={salesByDay} />
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AnalyticsTable productSales={productSales} />
        </div>
        <TopProducts productSales={productSales} />
      </div>

      {/* Customers */}
      <CustomerList customers={customers} />
    </div>
  )
}
