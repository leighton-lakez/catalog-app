import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomers = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const createCustomer = async (customerData) => {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        reseller_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    setCustomers([data, ...customers])
    return data
  }

  const updateCustomer = async (customerId, updates) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error
    setCustomers(customers.map(c => c.id === customerId ? data : c))
    return data
  }

  const deleteCustomer = async (customerId) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (error) throw error
    setCustomers(customers.filter(c => c.id !== customerId))
  }

  const getCustomerOrders = async (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return []

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('customer_email', customer.email)
      .eq('reseller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders,
  }
}

// Customer auth for storefront
export async function customerLogin(email, password, resellerId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .eq('reseller_id', resellerId)
    .single()

  if (error || !data) {
    throw new Error('Invalid email or password')
  }

  // Simple password check (in production, use proper hashing)
  if (data.password_hash !== password) {
    throw new Error('Invalid email or password')
  }

  return data
}

export async function customerSignup(customerData, resellerId) {
  // Check if customer already exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customerData.email)
    .eq('reseller_id', resellerId)
    .single()

  if (existing) {
    throw new Error('An account with this email already exists')
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      reseller_id: resellerId,
      password_hash: customerData.password, // In production, hash this
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCustomerByEmail(email, resellerId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .eq('reseller_id', resellerId)
    .single()

  if (error) return null
  return data
}
