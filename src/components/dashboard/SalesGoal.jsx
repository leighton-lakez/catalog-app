import { useState, useEffect } from 'react'
import { useSalesGoals, calculateGoalProgress } from '../../hooks/useSalesGoals'
import { useAnalytics } from '../../hooks/useAnalytics'
import { formatCurrency } from '../../lib/utils'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input, { Select } from '../ui/Input'
import {
  TrophyIcon,
  FlagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function SalesGoal() {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useSalesGoals()
  const { stats } = useAnalytics()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    period: 'monthly',
    target_amount: '',
    start_date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  // Get current period's revenue
  const getCurrentRevenue = (period) => {
    const now = new Date()
    let startDate

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'weekly':
        const dayOfWeek = now.getDay()
        startDate = new Date(now.setDate(now.getDate() - dayOfWeek))
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Use stats.totalRevenue as a base (you'd filter by date in a real implementation)
    return stats?.totalRevenue || 0
  }

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal)
      setFormData({
        period: goal.period,
        target_amount: goal.target_amount.toString(),
        start_date: goal.start_date,
      })
    } else {
      setEditingGoal(null)
      setFormData({
        period: 'monthly',
        target_amount: '',
        start_date: new Date().toISOString().split('T')[0],
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        period: formData.period,
        target_amount: parseFloat(formData.target_amount) || 0,
        start_date: formData.start_date,
      }

      if (editingGoal) {
        await updateGoal(editingGoal.id, data)
      } else {
        await createGoal(data)
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Error saving goal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sales goal?')) return
    await deleteGoal(id)
  }

  const activeGoal = goals[0] // Show the first active goal

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    )
  }

  if (!activeGoal) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FlagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Set a Sales Goal</h3>
              <p className="text-sm text-gray-500">Track your progress towards targets</p>
            </div>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Goal
        </Button>

        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          saving={saving}
          editingGoal={editingGoal}
        />
      </div>
    )
  }

  const revenue = getCurrentRevenue(activeGoal.period)
  const { progress, remaining, achieved, percentComplete } = calculateGoalProgress(activeGoal, revenue)

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${achieved ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${achieved ? 'bg-green-100' : 'bg-blue-100'}`}>
            {achieved ? (
              <TrophyIcon className="h-6 w-6 text-green-600" />
            ) : (
              <FlagIcon className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {activeGoal.period.charAt(0).toUpperCase() + activeGoal.period.slice(1)} Goal
            </h3>
            <p className="text-sm text-gray-500">
              Target: {formatCurrency(activeGoal.target_amount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(activeGoal)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(activeGoal.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">{formatCurrency(revenue)}</span>
          <span className={`font-medium ${achieved ? 'text-green-600' : 'text-gray-500'}`}>
            {percentComplete}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${achieved ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      {achieved ? (
        <div className="flex items-center gap-2 text-green-700">
          <SparklesIcon className="h-5 w-5" />
          <span className="font-medium">Goal achieved! 🎉</span>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          {formatCurrency(remaining)} to go
        </p>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        saving={saving}
        editingGoal={editingGoal}
      />
    </div>
  )
}

function GoalModal({ isOpen, onClose, formData, setFormData, onSubmit, saving, editingGoal }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit Sales Goal' : 'Create Sales Goal'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label="Goal Period"
          value={formData.period}
          onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />

        <Input
          label="Target Amount ($)"
          type="number"
          step="0.01"
          min="0"
          value={formData.target_amount}
          onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
          placeholder="e.g., 5000"
          required
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
