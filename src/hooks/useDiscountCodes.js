import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useDiscountCodes() {
  const { user } = useAuth()
  const [discountCodes, setDiscountCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDiscountCodes = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDiscountCodes(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDiscountCodes()
  }, [fetchDiscountCodes])

  const createDiscountCode = async (codeData) => {
    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        reseller_id: user.id,
        ...codeData,
      })
      .select()
      .single()

    if (error) throw error
    setDiscountCodes([data, ...discountCodes])
    return data
  }

  const updateDiscountCode = async (id, updates) => {
    const { data, error } = await supabase
      .from('discount_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setDiscountCodes(discountCodes.map(c => c.id === id ? data : c))
    return data
  }

  const deleteDiscountCode = async (id) => {
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id)

    if (error) throw error
    setDiscountCodes(discountCodes.filter(c => c.id !== id))
  }

  const toggleActive = async (id, isActive) => {
    return updateDiscountCode(id, { is_active: isActive })
  }

  return {
    discountCodes,
    loading,
    error,
    refetch: fetchDiscountCodes,
    createDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
    toggleActive,
  }
}

// Validate and apply a discount code for checkout
export async function validateDiscountCode(code, resellerId, orderTotal) {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('reseller_id', resellerId)
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { valid: false, error: 'Invalid discount code' }
  }

  // Check if expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'This code has expired' }
  }

  // Check if not started yet
  if (data.starts_at && new Date(data.starts_at) > new Date()) {
    return { valid: false, error: 'This code is not yet active' }
  }

  // Check usage limit
  if (data.max_uses && data.times_used >= data.max_uses) {
    return { valid: false, error: 'This code has reached its usage limit' }
  }

  // Check minimum order amount
  if (data.min_order_amount && orderTotal < data.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order amount is $${data.min_order_amount.toFixed(2)}`
    }
  }

  // Calculate discount
  let discountAmount = 0
  if (data.type === 'percentage') {
    discountAmount = (orderTotal * data.value) / 100
  } else if (data.type === 'fixed') {
    discountAmount = Math.min(data.value, orderTotal)
  }
  // free_shipping is handled separately

  return {
    valid: true,
    discount: data,
    discountAmount,
    type: data.type,
  }
}

// Increment usage count after order
export async function incrementDiscountUsage(codeId) {
  const { error } = await supabase.rpc('increment_discount_usage', { code_id: codeId })
  if (error) {
    // Fallback if RPC doesn't exist
    await supabase
      .from('discount_codes')
      .update({ times_used: supabase.sql`times_used + 1` })
      .eq('id', codeId)
  }
}
