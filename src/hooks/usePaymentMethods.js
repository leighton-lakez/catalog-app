import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePaymentMethods() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('reseller_id', user.id)
        .order('display_order', { ascending: true })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const createPaymentMethod = async (type, details) => {
    const maxOrder = Math.max(0, ...paymentMethods.map(p => p.display_order))

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        reseller_id: user.id,
        type,
        details,
        display_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) throw error
    setPaymentMethods([...paymentMethods, data])
    return data
  }

  const updatePaymentMethod = async (id, updates) => {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setPaymentMethods(paymentMethods.map(p => p.id === id ? data : p))
    return data
  }

  const deletePaymentMethod = async (id) => {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)

    if (error) throw error
    setPaymentMethods(paymentMethods.filter(p => p.id !== id))
  }

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  }
}

export function usePublicPaymentMethods(resellerId) {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resellerId) return

    const fetchPaymentMethods = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('reseller_id', resellerId)
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error) throw error
        setPaymentMethods(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [resellerId])

  return { paymentMethods, loading }
}
