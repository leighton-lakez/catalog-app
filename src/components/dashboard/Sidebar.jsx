import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LinkIcon,
  RectangleGroupIcon,
  SparklesIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { classNames } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/dashboard/products', icon: CubeIcon },
  { name: 'Bundles', href: '/dashboard/bundles', icon: Square3Stack3DIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCartIcon },
  { name: 'Reviews', href: '/dashboard/reviews', icon: ChatBubbleLeftRightIcon },
  { name: 'Discounts', href: '/dashboard/discounts', icon: TicketIcon },
  { name: 'Expenses', href: '/dashboard/expenses', icon: BanknotesIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function Sidebar({ onClose }) {
  const { reseller, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(false)

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [location.pathname])

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem('darkMode', newValue.toString())
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const storeUrl = reseller?.store_slug ? `/store/${reseller.store_slug}` : null

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen max-h-screen overflow-y-auto">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white truncate">
              {reseller?.store_name || 'My Catalog'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Reseller Dashboard</p>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/20 text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Store Builder - Prominent CTA */}
        <NavLink
          to="/dashboard/store-builder"
          className={({ isActive }) =>
            classNames(
              isActive
                ? 'from-purple-600 to-pink-600 shadow-lg'
                : 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg',
              'flex items-center px-3 py-3 text-sm font-bold text-white bg-gradient-to-r rounded-xl transition-all duration-200 mb-3'
            )
          }
        >
          <div className="relative mr-3">
            <RectangleGroupIcon className="h-5 w-5" />
            <SparklesIcon className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div className="flex-1">
            <span className="block">Store Builder</span>
            <span className="text-[10px] font-normal text-purple-200">Drag & drop editor</span>
          </div>
        </NavLink>

        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              classNames(
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-200'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 pb-safe">
        {/* Admin Panel Link - Only for admins */}
        {reseller?.is_admin && (
          <NavLink
            to="/admin"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all duration-200 shadow-sm"
          >
            <ShieldCheckIcon className="mr-3 h-5 w-5" />
            Admin Panel
          </NavLink>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {darkMode ? (
            <>
              <SunIcon className="mr-3 h-5 w-5 text-yellow-500" />
              Light Mode
            </>
          ) : (
            <>
              <MoonIcon className="mr-3 h-5 w-5 text-indigo-500" />
              Dark Mode
            </>
          )}
        </button>

        {/* View Store Button */}
        {storeUrl ? (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-200 shadow-sm"
          >
            <LinkIcon className="mr-3 h-5 w-5" />
            View Your Store
          </a>
        ) : (
          <NavLink
            to="/dashboard/settings"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LinkIcon className="mr-3 h-5 w-5" />
            Set Up Store URL
          </NavLink>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Sign Out
        </button>

        {/* Extra padding for iOS safe area */}
        <div className="h-6 lg:h-0"></div>
      </div>
    </div>
  )
}
