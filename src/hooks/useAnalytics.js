import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useAnalytics() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('all') // 'all', 'week', 'month', 'year'

  const fetchData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('reseller_id', user.id)

      if (productsError) throw productsError

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('reseller_id', user.id)

      if (expensesError) {
        // Expenses table might not exist yet, ignore error
        console.log('Expenses table not found or empty')
      }

      setOrders(ordersData || [])
      setProducts(productsData || [])
      setExpenses(expensesData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders

    const now = new Date()
    let startDate

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        return orders
    }

    return orders.filter(order => new Date(order.created_at) >= startDate)
  }, [orders, dateRange])

  // Create a map of product costs for profit calculation
  const productCostMap = useMemo(() => {
    const map = new Map()
    products.forEach(p => {
      map.set(p.id, p.cost_price || 0)
    })
    return map
  }, [products])

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length
    const completedOrders = filteredOrders.filter(o =>
      o.status === 'delivered' || o.status === 'shipped' || o.status === 'confirmed'
    )
    const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

    // Calculate total cost and profit
    let totalCost = 0
    completedOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const costPrice = productCostMap.get(item.product_id) || 0
        totalCost += costPrice * item.quantity
      })
    })
    const totalProfit = totalRevenue - totalCost

    const totalProducts = products.length
    const activeProducts = products.filter(p => p.is_active).length

    return {
      totalOrders,
      totalRevenue,
      totalCost,
      totalProfit,
      totalProducts,
      activeProducts,
      averageOrderValue: totalOrders > 0 ? totalRevenue / completedOrders.length : 0,
    }
  }, [filteredOrders, products, productCostMap])

  const productSales = useMemo(() => {
    const salesMap = new Map()

    filteredOrders.forEach(order => {
      if (order.status === 'cancelled') return

      order.order_items?.forEach(item => {
        const existing = salesMap.get(item.product_id) || {
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_sold: 0,
          revenue: 0,
          last_sale: null,
        }

        existing.quantity_sold += item.quantity
        existing.revenue += item.quantity * parseFloat(item.unit_price)

        const orderDate = new Date(order.created_at)
        if (!existing.last_sale || orderDate > new Date(existing.last_sale)) {
          existing.last_sale = order.created_at
        }

        salesMap.set(item.product_id, existing)
      })
    })

    return Array.from(salesMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredOrders])

  const salesByDay = useMemo(() => {
    const salesMap = new Map()

    filteredOrders.forEach(order => {
      if (order.status === 'cancelled') return

      const date = new Date(order.created_at).toISOString().split('T')[0]
      const existing = salesMap.get(date) || { date, orders: 0, revenue: 0 }

      existing.orders += 1
      existing.revenue += parseFloat(order.total_amount)

      salesMap.set(date, existing)
    })

    return Array.from(salesMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days with data
  }, [filteredOrders])

  const customers = useMemo(() => {
    const customerMap = new Map()

    filteredOrders.forEach(order => {
      const key = order.customer_email || order.customer_phone
      const existing = customerMap.get(key) || {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        orders: 0,
        total_spent: 0,
        last_order: null,
      }

      existing.orders += 1
      if (order.status !== 'cancelled') {
        existing.total_spent += parseFloat(order.total_amount)
      }

      const orderDate = new Date(order.created_at)
      if (!existing.last_order || orderDate > new Date(existing.last_order)) {
        existing.last_order = order.created_at
      }

      customerMap.set(key, existing)
    })

    return Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent)
  }, [filteredOrders])

  // Platform/source analytics
  const platformStats = useMemo(() => {
    const platformMap = new Map()

    const PLATFORM_INFO = {
      snapchat: { name: 'Snapchat', icon: '👻', color: '#FFFC00' },
      offerup: { name: 'OfferUp', icon: '🏷️', color: '#00B379' },
      marketplace: { name: 'Facebook Marketplace', icon: '🛒', color: '#1877F2' },
      dhgate: { name: 'DHgate', icon: '📦', color: '#FF6600' },
      tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
      instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
      whatsapp: { name: 'WhatsApp', icon: '💬', color: '#25D366' },
      direct: { name: 'Direct/In-Person', icon: '🤝', color: '#6B7280' },
      other: { name: 'Other', icon: '📱', color: '#9CA3AF' },
    }

    filteredOrders.forEach(order => {
      if (order.status === 'cancelled') return

      const platform = order.source_platform || 'unknown'
      const existing = platformMap.get(platform) || {
        platform,
        name: PLATFORM_INFO[platform]?.name || 'Unknown',
        icon: PLATFORM_INFO[platform]?.icon || '❓',
        color: PLATFORM_INFO[platform]?.color || '#6B7280',
        orders: 0,
        revenue: 0,
        customers: new Set(),
      }

      existing.orders += 1
      existing.revenue += parseFloat(order.total_amount)
      existing.customers.add(order.customer_phone || order.customer_email)

      platformMap.set(platform, existing)
    })

    // Convert Set to count and sort by orders
    return Array.from(platformMap.values())
      .map(p => ({
        ...p,
        customers: p.customers.size,
      }))
      .sort((a, b) => b.orders - a.orders)
  }, [filteredOrders])

  return {
    loading,
    error,
    stats,
    productSales,
    salesByDay,
    customers,
    platformStats,
    dateRange,
    setDateRange,
    refetch: fetchData,
  }
}
