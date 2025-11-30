import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const EXPENSE_CATEGORIES = [
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'warehouse', label: 'Warehouse / Storage' },
  { value: 'packaging', label: 'Packaging & Supplies' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'software', label: 'Software & Tools' },
  { value: 'fees', label: 'Platform Fees' },
  { value: 'returns', label: 'Returns & Refunds' },
  { value: 'travel', label: 'Travel & Transport' },
  { value: 'other', label: 'Other' },
]

// Calculate how many months a recurring expense has been active
function getMonthsActive(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(1, months + 1) // At least 1 month (current month)
}

export function useExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('reseller_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const createExpense = async (expenseData) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        reseller_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    setExpenses([data, ...expenses])
    return data
  }

  const updateExpense = async (id, updates) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setExpenses(expenses.map(e => e.id === id ? data : e))
    return data
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
    setExpenses(expenses.filter(e => e.id !== id))
  }

  // Calculate totals including recurring expenses
  const { totalExpenses, expensesByCategory, recurringMonthly } = useMemo(() => {
    let total = 0
    let monthlyRecurring = 0
    const byCategory = {}

    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount)
      let expenseTotal = amount

      if (expense.is_recurring) {
        // For recurring, calculate total based on months active
        const monthsActive = getMonthsActive(expense.date)
        expenseTotal = amount * monthsActive
        monthlyRecurring += amount
      }

      total += expenseTotal

      // Category totals
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0
      }
      byCategory[expense.category] += expenseTotal
    })

    return {
      totalExpenses: total,
      expensesByCategory: byCategory,
      recurringMonthly: monthlyRecurring,
    }
  }, [expenses])

  return {
    expenses,
    loading,
    error,
    totalExpenses,
    expensesByCategory,
    recurringMonthly,
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
