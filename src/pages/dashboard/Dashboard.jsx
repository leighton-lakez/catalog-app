import { useAuth } from '../../hooks/useAuth'
import { useAnalytics } from '../../hooks/useAnalytics'
import StatsCard from '../../components/dashboard/StatsCard'
import { RevenueChart } from '../../components/analytics/SalesChart'
import TopProducts from '../../components/analytics/TopProducts'
import { formatCurrency } from '../../lib/utils'
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardIcon,
  CheckIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function Dashboard() {
  const { reseller } = useAuth()
  const { stats, productSales, salesByDay, customers, loading } = useAnalytics()
  const [copied, setCopied] = useState(false)

  const storeUrl = reseller?.store_slug
    ? `${window.location.origin}/store/${reseller.store_slug}`
    : null

  const copyStoreUrl = async () => {
    if (storeUrl) {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {reseller?.store_name || 'Reseller'}!
        </h1>
        {storeUrl && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-gray-500">Your store:</span>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {storeUrl}
            </a>
            <button
              onClick={copyStoreUrl}
              className="p-1 hover:bg-gray-100 rounded"
              title="Copy link"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ClipboardIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={loading ? '-' : stats.totalProducts}
          icon={CubeIcon}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value={loading ? '-' : stats.totalOrders}
          icon={ShoppingCartIcon}
          color="purple"
        />
        <StatsCard
          title="Total Revenue"
          value={loading ? '-' : formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          color="blue"
        />
        <StatsCard
          title="Total Profit"
          value={loading ? '-' : formatCurrency(stats.totalProfit)}
          icon={BanknotesIcon}
          color="green"
        />
        <StatsCard
          title="Customers"
          value={loading ? '-' : customers.length}
          icon={UserGroupIcon}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={salesByDay} />
        <TopProducts productSales={productSales} />
      </div>
    </div>
  )
}
