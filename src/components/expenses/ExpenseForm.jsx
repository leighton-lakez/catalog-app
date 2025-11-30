import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input, { Textarea, Select } from '../ui/Input'
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function ExpenseForm({
  expense,
  onSubmit,
  onCancel,
  loading,
}) {
  const [formData, setFormData] = useState({
    category: 'other',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || 'other',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        is_recurring: expense.is_recurring || false,
      })
    }
  }, [expense])

  const handleSubmit = (e) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      is_recurring: formData.is_recurring,
    }

    onSubmit(submitData)
  }

  const toggleRecurring = () => {
    setFormData(prev => ({ ...prev, is_recurring: !prev.is_recurring }))
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const categoryOptions = EXPENSE_CATEGORIES.map(c => ({
    value: c.value,
    label: c.label,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        value={formData.category}
        onChange={handleChange('category')}
        options={categoryOptions}
        required
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        placeholder="What was this expense for?"
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={formData.is_recurring ? "Monthly Amount ($)" : "Amount ($)"}
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={handleChange('amount')}
          placeholder="0.00"
          required
        />

        <Input
          label={formData.is_recurring ? "Start Date" : "Date"}
          type="date"
          value={formData.date}
          onChange={handleChange('date')}
          required
        />
      </div>

      {/* Recurring Toggle */}
      <button
        type="button"
        onClick={toggleRecurring}
        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
          formData.is_recurring
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${formData.is_recurring ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <ArrowPathIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className={`font-medium ${formData.is_recurring ? 'text-purple-700' : 'text-gray-700'}`}>
              Monthly Recurring
            </p>
            <p className="text-xs text-gray-500">
              {formData.is_recurring
                ? 'This expense repeats every month'
                : 'Enable for monthly subscriptions or rent'}
            </p>
          </div>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_recurring ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_recurring ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </button>

      {formData.is_recurring && (
        <p className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
          This expense will be automatically calculated monthly from the start date. Total will include all months since then.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}
