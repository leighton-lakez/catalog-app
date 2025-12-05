import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useInventoryLog(productId = null) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('inventory_log')
        .select(`
          *,
          products(name),
          orders(id)
        `)
        .order('created_at', { ascending: false })
        .limit(500)

      if (productId) {
        query = query.eq('product_id', productId)
      } else {
        // Get logs for all user's products
        query = query.in('product_id',
          supabase.from('products').select('id').eq('reseller_id', user.id)
        )
      }

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, productId])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  }
}

// Log inventory change
export async function logInventoryChange({
  productId,
  variantId = null,
  changeAmount,
  newQuantity,
  reason,
  orderId = null,
  notes = null,
}) {
  const { error } = await supabase
    .from('inventory_log')
    .insert({
      product_id: productId,
      variant_id: variantId,
      change_amount: changeAmount,
      new_quantity: newQuantity,
      reason,
      order_id: orderId,
      notes,
    })

  if (error) {
    console.error('Error logging inventory change:', error)
  }
}

// Reasons for inventory changes
export const INVENTORY_REASONS = {
  SALE: 'sale',
  RESTOCK: 'restock',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  CANCELLED_ORDER: 'cancelled_order',
  DAMAGED: 'damaged',
  INITIAL: 'initial',
}
