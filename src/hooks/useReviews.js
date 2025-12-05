import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useReviews(productId = null) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          products(name, image_url)
        `)
        .order('created_at', { ascending: false })

      if (productId) {
        query = query.eq('product_id', productId)
      } else {
        // Get reviews for all user's products
        query = query.in('product_id',
          supabase.from('products').select('id').eq('reseller_id', user.id)
        )
      }

      const { data, error } = await query

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const approveReview = async (reviewId) => {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ is_approved: true })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error
    setReviews(reviews.map(r => r.id === reviewId ? data : r))

    // Update product average rating
    await updateProductRating(data.product_id)

    return data
  }

  const deleteReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId)

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error
    setReviews(reviews.filter(r => r.id !== reviewId))

    // Update product average rating
    if (review) {
      await updateProductRating(review.product_id)
    }
  }

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    approveReview,
    deleteReview,
  }
}

// Update product's average rating cache
async function updateProductRating(productId) {
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await supabase
      .from('products')
      .update({
        avg_rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', productId)
  } else {
    await supabase
      .from('products')
      .update({ avg_rating: 0, review_count: 0 })
      .eq('id', productId)
  }
}

// Submit a review (for customers on storefront)
export async function submitReview(reviewData) {
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      ...reviewData,
      is_approved: false, // Requires approval
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get approved reviews for a product (public)
export async function getProductReviews(productId) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
