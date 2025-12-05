import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  LinkIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

// Check if running as installed PWA (standalone mode)
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://')
}

const features = [
  {
    name: 'Product Catalog',
    description: 'Add photos, prices, descriptions, and organize products into categories.',
    icon: CubeIcon,
  },
  {
    name: 'Shareable Store Link',
    description: 'Get a unique URL to share with customers so they can browse and shop.',
    icon: LinkIcon,
  },
  {
    name: 'Shopping Cart & Checkout',
    description: 'Customers can add items to cart and submit orders with their info.',
    icon: ShoppingCartIcon,
  },
  {
    name: 'Multiple Payment Options',
    description: 'Accept Zelle, Venmo, PayPal, Cash App, or bank transfers.',
    icon: CreditCardIcon,
  },
  {
    name: 'Order Management',
    description: 'Track orders, update statuses, and manage customer information.',
    icon: DevicePhoneMobileIcon,
  },
  {
    name: 'Sales Analytics',
    description: 'Built-in spreadsheet-style tracker for revenue, top products, and more.',
    icon: ChartBarIcon,
  },
]

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Auto-redirect to dashboard if running as PWA app
  useEffect(() => {
    if (isStandalone() && !loading) {
      if (user) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, navigate])

  // Show nothing while checking PWA status to prevent flash
  if (isStandalone()) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">ResellerCatalog</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              Your products.
              <span className="text-blue-600"> Your catalog.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              Create a beautiful online catalog for your reselling business.
              Share with customers, accept orders, and track your sales — all in one place.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                  >
                    Start for Free
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to run your reselling business
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Simple tools to manage products, orders, and customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start selling?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Create your free catalog in minutes.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} ResellerCatalog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
