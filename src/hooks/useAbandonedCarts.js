import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useAbandonedCarts() {
  const { user } = useAuth()
  const [abandonedCarts, setAbandonedCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAbandonedCarts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAbandonedCarts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAbandonedCarts()
  }, [fetchAbandonedCarts])

  const markAsRecovered = async (cartId) => {
    const { error } = await supabase
      .from('abandoned_carts')
      .update({ recovered: true, recovered_at: new Date().toISOString() })
      .eq('id', cartId)

    if (error) throw error
    setAbandonedCarts(abandonedCarts.map(c =>
      c.id === cartId ? { ...c, recovered: true, recovered_at: new Date().toISOString() } : c
    ))
  }

  const deleteAbandonedCart = async (cartId) => {
    const { error } = await supabase
      .from('abandoned_carts')
      .delete()
      .eq('id', cartId)

    if (error) throw error
    setAbandonedCarts(abandonedCarts.filter(c => c.id !== cartId))
  }

  // Calculate stats
  const stats = {
    total: abandonedCarts.length,
    notRecovered: abandonedCarts.filter(c => !c.recovered).length,
    recovered: abandonedCarts.filter(c => c.recovered).length,
    totalValue: abandonedCarts.reduce((sum, c) => sum + (c.cart_total || 0), 0),
    recoveredValue: abandonedCarts
      .filter(c => c.recovered)
      .reduce((sum, c) => sum + (c.cart_total || 0), 0),
  }

  return {
    abandonedCarts,
    loading,
    error,
    refetch: fetchAbandonedCarts,
    markAsRecovered,
    deleteAbandonedCart,
    stats,
  }
}

// Track abandoned cart from storefront
export async function trackAbandonedCart(resellerId, cartData) {
  const { customer_email, customer_phone, cart_items, cart_total } = cartData

  // Check if we already have an abandoned cart for this customer
  let existing = null
  if (customer_email) {
    const { data } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('reseller_id', resellerId)
      .eq('customer_email', customer_email)
      .eq('recovered', false)
      .single()
    existing = data
  }

  if (existing) {
    // Update existing abandoned cart
    await supabase
      .from('abandoned_carts')
      .update({
        cart_items,
        cart_total,
        customer_phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    // Create new abandoned cart record
    await supabase
      .from('abandoned_carts')
      .insert({
        reseller_id: resellerId,
        customer_email,
        customer_phone,
        cart_items,
        cart_total,
      })
  }
}

// Remove abandoned cart when order is completed
export async function removeAbandonedCart(resellerId, customerEmail) {
  if (!customerEmail) return

  await supabase
    .from('abandoned_carts')
    .update({ recovered: true, recovered_at: new Date().toISOString() })
    .eq('reseller_id', resellerId)
    .eq('customer_email', customerEmail)
    .eq('recovered', false)
}
