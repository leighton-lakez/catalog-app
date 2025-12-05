import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSalesGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoals = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales_goals')
        .select('*')
        .eq('reseller_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const createGoal = async (goalData) => {
    const { data, error } = await supabase
      .from('sales_goals')
      .insert({
        reseller_id: user.id,
        ...goalData,
      })
      .select()
      .single()

    if (error) throw error
    setGoals([data, ...goals])
    return data
  }

  const updateGoal = async (id, updates) => {
    const { data, error } = await supabase
      .from('sales_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setGoals(goals.map(g => g.id === id ? data : g))
    return data
  }

  const deleteGoal = async (id) => {
    const { error } = await supabase
      .from('sales_goals')
      .delete()
      .eq('id', id)

    if (error) throw error
    setGoals(goals.filter(g => g.id !== id))
  }

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  }
}

// Calculate progress towards a goal
export function calculateGoalProgress(goal, revenue) {
  const progress = (revenue / goal.target_amount) * 100
  return {
    progress: Math.min(progress, 100),
    remaining: Math.max(goal.target_amount - revenue, 0),
    achieved: revenue >= goal.target_amount,
    percentComplete: progress.toFixed(1),
  }
}
