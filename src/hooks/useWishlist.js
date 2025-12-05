import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Key for localStorage wishlist (for non-logged in customers)
const WISHLIST_STORAGE_KEY = 'catalog_wishlist'

export function useWishlist(resellerId, customerId = null) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Load wishlist from DB if customer is logged in, otherwise from localStorage
  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    try {
      if (customerId) {
        // Fetch from database for logged-in customers
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            *,
            products(*)
          `)
          .eq('customer_id', customerId)

        if (error) throw error
        setWishlistItems(data?.map(w => w.products) || [])
      } else {
        // Fetch from localStorage for guests
        const stored = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`)
        if (stored) {
          const productIds = JSON.parse(stored)
          if (productIds.length > 0) {
            const { data } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds)
              .eq('is_active', true)
            setWishlistItems(data || [])
          } else {
            setWishlistItems([])
          }
        } else {
          setWishlistItems([])
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }, [resellerId, customerId])

  useEffect(() => {
    if (resellerId) {
      fetchWishlist()
    }
  }, [fetchWishlist, resellerId])

  const addToWishlist = async (productId) => {
    try {
      if (customerId) {
        // Add to database
        await supabase
          .from('wishlists')
          .insert({ customer_id: customerId, product_id: productId })
      } else {
        // Add to localStorage
        const stored = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`)
        const productIds = stored ? JSON.parse(stored) : []
        if (!productIds.includes(productId)) {
          productIds.push(productId)
          localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`, JSON.stringify(productIds))
        }
      }
      await fetchWishlist()
    } catch (err) {
      console.error('Error adding to wishlist:', err)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      if (customerId) {
        // Remove from database
        await supabase
          .from('wishlists')
          .delete()
          .eq('customer_id', customerId)
          .eq('product_id', productId)
      } else {
        // Remove from localStorage
        const stored = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`)
        const productIds = stored ? JSON.parse(stored) : []
        const filtered = productIds.filter(id => id !== productId)
        localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`, JSON.stringify(filtered))
      }
      await fetchWishlist()
    } catch (err) {
      console.error('Error removing from wishlist:', err)
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const clearWishlist = async () => {
    try {
      if (customerId) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('customer_id', customerId)
      } else {
        localStorage.removeItem(`${WISHLIST_STORAGE_KEY}_${resellerId}`)
      }
      setWishlistItems([])
    } catch (err) {
      console.error('Error clearing wishlist:', err)
    }
  }

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    refetch: fetchWishlist,
    count: wishlistItems.length,
  }
}
