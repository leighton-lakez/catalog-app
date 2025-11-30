import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Auto-cancel orders pending for over a month
  const autoCancelOldPendingOrders = useCallback(async (ordersData) => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const oldPendingOrders = ordersData.filter(order =>
      order.status === 'pending' &&
      new Date(order.created_at) < oneMonthAgo
    )

    if (oldPendingOrders.length > 0) {
      // Cancel each old pending order
      for (const order of oldPendingOrders) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id)
      }
      return true // Indicates orders were cancelled
    }
    return false
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Auto-cancel old pending orders
      const hadCancellations = await autoCancelOldPendingOrders(data || [])

      if (hadCancellations) {
        // Refetch to get updated statuses
        const { data: refreshedData } = await supabase
          .from('orders')
          .select(`*, order_items(*)`)
          .eq('reseller_id', user.id)
          .order('created_at', { ascending: false })
        setOrders(refreshedData || [])
      } else {
        setOrders(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, autoCancelOldPendingOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `reseller_id=eq.${user.id}`,
        },
        (payload) => {
          fetchOrders() // Refetch to get order items
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchOrders])

  const updateOrderStatus = async (orderId, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select(`
        *,
        order_items(*)
      `)
      .single()

    if (error) throw error
    setOrders(orders.map(o => o.id === orderId ? data : o))
    return data
  }

  // Create order with stock updates
  const createOrder = async (orderData) => {
    const { customer_name, customer_phone, customer_email, notes, items, total_amount } = orderData

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        reseller_id: user.id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        notes: notes || null,
        total_amount,
        status: 'confirmed', // Admin-created orders start as confirmed
        payment_method: 'manual',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Update stock for each product
    for (const item of items) {
      // Only update stock if it's being tracked (not unlimited/-1)
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single()

      if (product && product.stock_quantity >= 0) {
        const newStock = Math.max(0, product.stock_quantity - item.quantity)
        await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.id)
      }
    }

    // Refetch orders to get the complete data
    await fetchOrders()

    return order
  }

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    createOrder,
  }
}

export function createOrder(orderData, items) {
  return supabase.rpc('create_order_with_items', {
    order_data: orderData,
    items_data: items,
  })
}

// Helper function to create order without RPC (for public checkout)
export async function submitOrder(orderData, items) {
  // Create the order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError) throw orderError

  // Then create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  // Update stock for each product
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single()

    if (product && product.stock_quantity >= 0) {
      const newStock = Math.max(0, product.stock_quantity - item.quantity)
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.id)
    }
  }

  return order
}
