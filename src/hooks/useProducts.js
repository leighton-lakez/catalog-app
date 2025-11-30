import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const createProduct = async (productData) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        reseller_id: user.id,
      })
      .select(`
        *,
        category:categories(id, name)
      `)
      .single()

    if (error) throw error
    setProducts([data, ...products])
    return data
  }

  const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name)
      `)
      .single()

    if (error) throw error
    setProducts(products.map(p => p.id === id ? data : p))
    return data
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    setProducts(products.filter(p => p.id !== id))
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Add timeout to prevent hanging forever
    const uploadPromise = supabase.storage
      .from('product-images')
      .upload(fileName, file)

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out. Check if the "product-images" bucket exists in Supabase Storage.')), 15000)
    )

    const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise])

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
  }
}

export function usePublicProducts(resellerId) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!resellerId) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name)
          `)
          .eq('reseller_id', resellerId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [resellerId])

  return { products, loading, error }
}
