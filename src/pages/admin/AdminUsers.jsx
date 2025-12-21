import { useState, useEffect } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { formatCurrency } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  EyeIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

export default function AdminUsers() {
  const { resellers, fetchResellers, toggleResellerStatus, toggleResellerAdmin, loading } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [resellerStats, setResellerStats] = useState({})
  const [selectedReseller, setSelectedReseller] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchResellers()
  }, [fetchResellers])

  // Fetch stats for each reseller
  useEffect(() => {
    const fetchResellerStats = async () => {
      const stats = {}
      for (const reseller of resellers) {
        const [productsRes, ordersRes] = await Promise.all([
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('reseller_id', reseller.id)
            .eq('is_active', true),
          supabase
            .from('orders')
            .select('total_amount')
            .eq('reseller_id', reseller.id)
            .is('deleted_at', null),
        ])

        stats[reseller.id] = {
          products: productsRes.count || 0,
          orders: ordersRes.data?.length || 0,
          revenue: ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        }
      }
      setResellerStats(stats)
    }

    if (resellers.length > 0) {
      fetchResellerStats()
    }
  }, [resellers])

  const filteredResellers = resellers.filter((reseller) => {
    const matchesSearch =
      reseller.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reseller.store_slug?.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'admin') return matchesSearch && reseller.is_admin
    if (filter === 'active') return matchesSearch && reseller.is_active !== false
    if (filter === 'suspended') return matchesSearch && reseller.is_active === false
    return matchesSearch
  })

  const handleToggleStatus = async (resellerId, currentStatus) => {
    setActionLoading(resellerId)
    try {
      await toggleResellerStatus(resellerId, !currentStatus)
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAdmin = async (resellerId, currentIsAdmin) => {
    setActionLoading(resellerId)
    try {
      await toggleResellerAdmin(resellerId, !currentIsAdmin)
    } catch (error) {
      console.error('Error toggling admin:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">Manage all resellers on the platform</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by store name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'active', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{resellers.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-400">
            {resellers.filter((r) => r.is_admin).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {resellers.filter((r) => r.is_active !== false).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-red-400">
            {resellers.filter((r) => r.is_active === false).length}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  Products
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredResellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredResellers.map((reseller) => {
                  const stats = resellerStats[reseller.id] || {}
                  return (
                    <tr key={reseller.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {reseller.store_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">
                              {reseller.store_name || 'Unnamed Store'}
                            </p>
                            <p className="text-sm text-gray-400 truncate">/{reseller.store_slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-white">{stats.products || 0}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-white">{stats.orders || 0}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-white">{formatCurrency(stats.revenue || 0)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {reseller.is_admin && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                              Admin
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              reseller.is_active !== false
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {reseller.is_active !== false ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/store/${reseller.store_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Store"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => handleToggleAdmin(reseller.id, reseller.is_admin)}
                            disabled={actionLoading === reseller.id}
                            className={`p-2 rounded-lg transition-colors ${
                              reseller.is_admin
                                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                                : 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                            }`}
                            title={reseller.is_admin ? 'Remove Admin' : 'Make Admin'}
                          >
                            <ShieldCheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(reseller.id, reseller.is_active !== false)
                            }
                            disabled={actionLoading === reseller.id}
                            className={`p-2 rounded-lg transition-colors ${
                              reseller.is_active !== false
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                                : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                            }`}
                            title={reseller.is_active !== false ? 'Suspend User' : 'Activate User'}
                          >
                            {reseller.is_active !== false ? (
                              <NoSymbolIcon className="h-5 w-5" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
