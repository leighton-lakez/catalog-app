import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAnalytics } from '../../hooks/useAnalytics'
import StatsCard from '../../components/dashboard/StatsCard'
import QuickStats from '../../components/dashboard/QuickStats'
import SalesGoal from '../../components/dashboard/SalesGoal'
import WelcomeAnimation from '../../components/dashboard/WelcomeAnimation'
import { RevenueChart } from '../../components/analytics/SalesChart'
import TopProducts from '../../components/analytics/TopProducts'
import PlatformStats from '../../components/analytics/PlatformStats'
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

// Session storage key to track if animation was shown this session
const ANIMATION_SHOWN_KEY = 'dashboard_welcome_shown'

export default function Dashboard() {
  const { reseller } = useAuth()
  const { stats, productSales, salesByDay, customers, platformStats, loading } = useAnalytics()
  const [copied, setCopied] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [animateStats, setAnimateStats] = useState(false)

  // Check if we should show the welcome animation (once per session)
  useEffect(() => {
    const wasShown = sessionStorage.getItem(ANIMATION_SHOWN_KEY)
    if (!wasShown && !loading) {
      setShowWelcome(true)
      sessionStorage.setItem(ANIMATION_SHOWN_KEY, 'true')
    } else if (!loading) {
      // If already shown, still animate the stats
      setAnimateStats(true)
    }
  }, [loading])

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    // Start stats animation after welcome animation
    setTimeout(() => setAnimateStats(true), 100)
  }

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
    <>
      {/* Welcome Animation */}
      {showWelcome && (
        <WelcomeAnimation
          storeName={reseller?.store_name}
          stats={stats}
          onComplete={handleWelcomeComplete}
        />
      )}

      <div className={showWelcome ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold text-gray-900 ${animateStats ? 'animate-slide-down' : ''}`}>
            Welcome back, {reseller?.store_name || 'Reseller'}!
          </h1>
          {storeUrl && (
            <div className={`mt-2 flex items-center gap-2 ${animateStats ? 'animate-fade-in' : ''}`} style={{ animationDelay: '100ms' }}>
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

        {/* Quick Stats - Today's overview */}
        <div className="mb-6">
          <QuickStats />
        </div>

        {/* Sales Goal + Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Products"
                value={loading ? '-' : stats.totalProducts}
                numericValue={stats.totalProducts}
                icon={CubeIcon}
                color="blue"
                animate={animateStats}
                delay={0}
              />
              <StatsCard
                title="Total Orders"
                value={loading ? '-' : stats.totalOrders}
                numericValue={stats.totalOrders}
                icon={ShoppingCartIcon}
                color="purple"
                animate={animateStats}
                delay={100}
              />
              <StatsCard
                title="Total Revenue"
                value={loading ? '-' : formatCurrency(stats.totalRevenue)}
                numericValue={stats.totalRevenue}
                isCurrency={true}
                icon={CurrencyDollarIcon}
                color="blue"
                animate={animateStats}
                delay={200}
              />
              <StatsCard
                title="Total Profit"
                value={loading ? '-' : formatCurrency(stats.totalProfit)}
                numericValue={stats.totalProfit}
                isCurrency={true}
                icon={BanknotesIcon}
                color="green"
                animate={animateStats}
                delay={300}
              />
              <StatsCard
                title="Customers"
                value={loading ? '-' : customers.length}
                numericValue={customers.length}
                icon={UserGroupIcon}
                color="orange"
                animate={animateStats}
                delay={400}
              />
            </div>
          </div>
          <SalesGoal />
        </div>

        {/* Charts */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${animateStats ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '500ms' }}>
          <RevenueChart data={salesByDay} />
          <TopProducts productSales={productSales} />
        </div>

        {/* Platform Stats */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${animateStats ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '600ms' }}>
          <PlatformStats platformStats={platformStats} />
        </div>
      </div>
    </>
  )
}
