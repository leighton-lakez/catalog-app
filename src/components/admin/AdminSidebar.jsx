import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { classNames } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'All Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'All Products', href: '/admin/products', icon: CubeIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminSidebar({ onClose }) {
  const { reseller, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 h-screen max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-purple-100 text-sm mt-1">Platform Management</p>
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

      {/* Admin Info */}
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {reseller?.store_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium truncate">
              {reseller?.store_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/admin'}
            className={({ isActive }) =>
              classNames(
                isActive
                  ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent',
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-200'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2 flex-shrink-0 pb-safe">
        {/* Back to Dashboard */}
        <a
          href="/dashboard"
          className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="mr-3 h-5 w-5" />
          Back to Dashboard
        </a>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
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
