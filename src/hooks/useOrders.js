import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Helper to reduce stock for order items
async function reduceStockForOrder(orderItems) {
  for (const item of orderItems) {
    if (!item.product_id) continue

    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .single()

    if (product && product.stock_quantity >= 0) {
      const newStock = Math.max(0, product.stock_quantity - item.quantity)
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id)
    }
  }
}

// Helper to restore stock for order items (for cancellations)
async function restoreStockForOrder(orderItems) {
  for (const item of orderItems) {
    if (!item.product_id) continue

    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .single()

    if (product && product.stock_quantity >= 0) {
      const newStock = product.stock_quantity + item.quantity
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id)
    }
  }
}

export function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [deletedOrders, setDeletedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Auto-cancel orders pending for over a month
  // Note: No stock restoration needed since pending orders don't have stock committed
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

      // Fetch active orders (not deleted)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('reseller_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch deleted orders
      const { data: deleted } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('reseller_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

      setDeletedOrders(deleted || [])

      // Auto-cancel old pending orders
      const hadCancellations = await autoCancelOldPendingOrders(data || [])

      if (hadCancellations) {
        // Refetch to get updated statuses
        const { data: refreshedData } = await supabase
          .from('orders')
          .select(`*, order_items(*)`)
          .eq('reseller_id', user.id)
          .is('deleted_at', null)
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

  const updateOrderStatus = async (orderId, newStatus) => {
    // First get the current order to check the old status
    const currentOrder = orders.find(o => o.id === orderId)
    const oldStatus = currentOrder?.status

    // Define which statuses mean "stock is committed"
    const stockCommittedStatuses = ['confirmed', 'shipped', 'delivered']

    const wasStockCommitted = stockCommittedStatuses.includes(oldStatus)
    const willStockBeCommitted = stockCommittedStatuses.includes(newStatus)

    // Update the order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select(`
        *,
        order_items(*)
      `)
      .single()

    if (error) throw error

    // Handle stock changes based on status transition
    if (!wasStockCommitted && willStockBeCommitted) {
      // Transitioning from pending/cancelled TO confirmed/shipped/delivered
      // Need to REDUCE stock
      await reduceStockForOrder(data.order_items)
    } else if (wasStockCommitted && !willStockBeCommitted) {
      // Transitioning from confirmed/shipped/delivered TO pending/cancelled
      // Need to RESTORE stock
      await restoreStockForOrder(data.order_items)
    }

    setOrders(orders.map(o => o.id === orderId ? data : o))
    return data
  }

  // Create order with stock updates
  const createOrder = async (orderData) => {
    const { customer_name, customer_phone, customer_email, source_platform, notes, items, total_amount } = orderData

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        reseller_id: user.id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        source_platform: source_platform || null,
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

  // Soft delete an order
  const deleteOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId)

    // If order had stock committed, restore it before deleting
    const stockCommittedStatuses = ['confirmed', 'shipped', 'delivered']
    if (order && stockCommittedStatuses.includes(order.status)) {
      await restoreStockForOrder(order.order_items)
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orderId)
      .select(`*, order_items(*)`)
      .single()

    if (error) throw error

    // Move from orders to deletedOrders
    setOrders(orders.filter(o => o.id !== orderId))
    setDeletedOrders([data, ...deletedOrders])

    return data
  }

  // Restore a deleted order
  const restoreOrder = async (orderId) => {
    const order = deletedOrders.find(o => o.id === orderId)

    const { data, error } = await supabase
      .from('orders')
      .update({ deleted_at: null })
      .eq('id', orderId)
      .select(`*, order_items(*)`)
      .single()

    if (error) throw error

    // If order has stock committed status, reduce stock again
    const stockCommittedStatuses = ['confirmed', 'shipped', 'delivered']
    if (order && stockCommittedStatuses.includes(order.status)) {
      await reduceStockForOrder(order.order_items)
    }

    // Move from deletedOrders to orders
    setDeletedOrders(deletedOrders.filter(o => o.id !== orderId))
    setOrders([data, ...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

    return data
  }

  // Permanently delete an order
  const permanentlyDeleteOrder = async (orderId) => {
    // First delete order items
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error

    setDeletedOrders(deletedOrders.filter(o => o.id !== orderId))
  }

  // Update internal notes for an order
  const updateOrderNotes = async (orderId, notes) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ internal_notes: notes })
      .eq('id', orderId)
      .select(`*, order_items(*)`)
      .single()

    if (error) throw error
    setOrders(orders.map(o => o.id === orderId ? data : o))
    return data
  }

  // Update tags for an order
  const updateOrderTags = async (orderId, tags) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ tags: JSON.stringify(tags) })
      .eq('id', orderId)
      .select(`*, order_items(*)`)
      .single()

    if (error) throw error
    setOrders(orders.map(o => o.id === orderId ? data : o))
    return data
  }

  return {
    orders,
    deletedOrders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    createOrder,
    deleteOrder,
    restoreOrder,
    permanentlyDeleteOrder,
    updateOrderNotes,
    updateOrderTags,
  }
}

export function createOrder(orderData, items) {
  return supabase.rpc('create_order_with_items', {
    order_data: orderData,
    items_data: items,
  })
}

// Helper function to create order without RPC (for public checkout)
// Note: Stock is NOT reduced here - it's only reduced when order is confirmed/shipped/delivered
export async function submitOrder(orderData, items) {
  // Create the order first (starts as 'pending')
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

  // Stock is NOT reduced for pending orders
  // Stock will be reduced when the order status is changed to confirmed/shipped/delivered

  return order
}
