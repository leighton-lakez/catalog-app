import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useAdmin() {
  const { reseller } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeStores: 0,
    newResellersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
  })
  const [resellers, setResellers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  const fetchStats = useCallback(async () => {
    if (!reseller?.is_admin) return

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch all resellers
      const { data: resellersData, count: resellerCount } = await supabase
        .from('resellers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Count new resellers today
      const { count: newToday } = await supabase
        .from('resellers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Fetch total products count
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch all orders
      const { data: ordersData, count: orderCount } = await supabase
        .from('orders')
        .select(`
          *,
          reseller:resellers(store_name, store_slug)
        `, { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100)

      // Calculate total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .is('deleted_at', null)

      const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

      // Orders today
      const { data: todayOrders, count: ordersTodayCount } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .is('deleted_at', null)
        .gte('created_at', today.toISOString())

      const revenueToday = todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

      // Count active stores (stores with at least one product)
      const { data: activeStoresData } = await supabase
        .from('products')
        .select('reseller_id')
        .eq('is_active', true)

      const uniqueActiveStores = new Set(activeStoresData?.map(p => p.reseller_id) || [])

      setStats({
        totalResellers: resellerCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
        activeStores: uniqueActiveStores.size,
        newResellersToday: newToday || 0,
        ordersToday: ordersTodayCount || 0,
        revenueToday,
      })

      setResellers(resellersData || [])
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }, [reseller?.is_admin])

  const fetchResellers = useCallback(async () => {
    if (!reseller?.is_admin) return []

    try {
      const { data, error } = await supabase
        .from('resellers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResellers(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching resellers:', error)
      return []
    }
  }, [reseller?.is_admin])

  const fetchAllOrders = useCallback(async (limit = 100) => {
    if (!reseller?.is_admin) return []

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          reseller:resellers(store_name, store_slug)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setOrders(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching all orders:', error)
      return []
    }
  }, [reseller?.is_admin])

  const fetchAllProducts = useCallback(async (limit = 100) => {
    if (!reseller?.is_admin) return []

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          reseller:resellers(store_name, store_slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setProducts(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching all products:', error)
      return []
    }
  }, [reseller?.is_admin])

  const updateReseller = useCallback(async (resellerId, updates) => {
    if (!reseller?.is_admin) return null

    try {
      const { data, error } = await supabase
        .from('resellers')
        .update(updates)
        .eq('id', resellerId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setResellers(prev => prev.map(r => r.id === resellerId ? data : r))
      return data
    } catch (error) {
      console.error('Error updating reseller:', error)
      throw error
    }
  }, [reseller?.is_admin])

  const toggleResellerStatus = useCallback(async (resellerId, isActive) => {
    return updateReseller(resellerId, { is_active: isActive })
  }, [updateReseller])

  const toggleResellerAdmin = useCallback(async (resellerId, isAdmin) => {
    return updateReseller(resellerId, { is_admin: isAdmin })
  }, [updateReseller])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    loading,
    stats,
    resellers,
    orders,
    products,
    fetchStats,
    fetchResellers,
    fetchAllOrders,
    fetchAllProducts,
    updateReseller,
    toggleResellerStatus,
    toggleResellerAdmin,
  }
}
