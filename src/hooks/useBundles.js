import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBundles() {
  const { user } = useAuth()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBundles = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_bundles')
        .select(`
          *,
          bundle_items(
            *,
            products(id, name, price, image_url)
          )
        `)
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBundles(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBundles()
  }, [fetchBundles])

  const createBundle = async (bundleData, items) => {
    // Create the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .insert({
        ...bundleData,
        reseller_id: user.id,
      })
      .select()
      .single()

    if (bundleError) throw bundleError

    // Add bundle items
    if (items.length > 0) {
      const bundleItems = items.map(item => ({
        bundle_id: bundle.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(bundleItems)

      if (itemsError) throw itemsError
    }

    await fetchBundles()
    return bundle
  }

  const updateBundle = async (bundleId, bundleData, items) => {
    // Update the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .update(bundleData)
      .eq('id', bundleId)
      .select()
      .single()

    if (bundleError) throw bundleError

    // Delete existing items and re-add
    await supabase
      .from('bundle_items')
      .delete()
      .eq('bundle_id', bundleId)

    if (items.length > 0) {
      const bundleItems = items.map(item => ({
        bundle_id: bundleId,
        product_id: item.product_id,
        quantity: item.quantity,
      }))

      await supabase
        .from('bundle_items')
        .insert(bundleItems)
    }

    await fetchBundles()
    return bundle
  }

  const deleteBundle = async (bundleId) => {
    // Items will be cascade deleted
    const { error } = await supabase
      .from('product_bundles')
      .delete()
      .eq('id', bundleId)

    if (error) throw error
    setBundles(bundles.filter(b => b.id !== bundleId))
  }

  const toggleBundleActive = async (bundleId, isActive) => {
    const { error } = await supabase
      .from('product_bundles')
      .update({ is_active: isActive })
      .eq('id', bundleId)

    if (error) throw error
    setBundles(bundles.map(b =>
      b.id === bundleId ? { ...b, is_active: isActive } : b
    ))
  }

  return {
    bundles,
    loading,
    error,
    refetch: fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    toggleBundleActive,
  }
}

// Calculate bundle pricing
export function calculateBundlePrice(bundle) {
  if (!bundle.bundle_items) return { originalPrice: 0, bundlePrice: 0, savings: 0 }

  const originalPrice = bundle.bundle_items.reduce((sum, item) => {
    const price = item.products?.price || 0
    return sum + (price * item.quantity)
  }, 0)

  const bundlePrice = bundle.bundle_price || originalPrice
  const savings = originalPrice - bundlePrice

  return {
    originalPrice,
    bundlePrice,
    savings,
    savingsPercent: originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0,
  }
}
