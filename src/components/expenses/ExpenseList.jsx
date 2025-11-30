import { useState } from 'react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { EXPENSE_CATEGORIES } from '../../hooks/useExpenses'
import ExpenseForm from './ExpenseForm'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import {
  PlusIcon,
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  GiftIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  MapPinIcon,
  EllipsisHorizontalCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const categoryIcons = {
  shipping: TruckIcon,
  warehouse: BuildingStorefrontIcon,
  packaging: GiftIcon,
  marketing: MegaphoneIcon,
  software: ComputerDesktopIcon,
  fees: CreditCardIcon,
  returns: ArrowUturnLeftIcon,
  travel: MapPinIcon,
  other: EllipsisHorizontalCircleIcon,
}

const categoryColors = {
  shipping: 'bg-blue-100 text-blue-600',
  warehouse: 'bg-purple-100 text-purple-600',
  packaging: 'bg-pink-100 text-pink-600',
  marketing: 'bg-orange-100 text-orange-600',
  software: 'bg-cyan-100 text-cyan-600',
  fees: 'bg-red-100 text-red-600',
  returns: 'bg-yellow-100 text-yellow-600',
  travel: 'bg-green-100 text-green-600',
  other: 'bg-gray-100 text-gray-600',
}

// Calculate months since a date
function getMonthsActive(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(1, months + 1)
}

export default function ExpenseList({
  expenses,
  totalExpenses,
  expensesByCategory,
  recurringMonthly,
  totalRevenue,
  totalProductCost,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  loading,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const netProfit = totalRevenue - totalProductCost - totalExpenses

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense.id, data)
      } else {
        await onCreateExpense(data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Failed to save expense: ' + error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (expense) => {
    if (window.confirm(`Delete this expense of ${formatCurrency(expense.amount)}?`)) {
      try {
        await onDeleteExpense(expense.id)
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Failed to delete expense')
      }
    }
  }

  const getCategoryLabel = (category) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Expenses</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p className="text-blue-100 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <p className="text-orange-100 text-sm">Product Costs</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalProductCost)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
          <p className="text-red-100 text-sm">Business Expenses</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
          {recurringMonthly > 0 && (
            <p className="text-red-200 text-xs mt-1 flex items-center gap-1">
              <ArrowPathIcon className="h-3 w-3" />
              {formatCurrency(recurringMonthly)}/mo recurring
            </p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-green-500 to-green-600' : 'from-gray-600 to-gray-700'} rounded-xl p-5 text-white`}>
          <p className={netProfit >= 0 ? 'text-green-100' : 'text-gray-300'} >Net Profit</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(netProfit)}</p>
        </div>
      </div>

      {/* Expense by Category */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const Icon = categoryIcons[category] || EllipsisHorizontalCircleIcon
              return (
                <div key={category} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${categoryColors[category] || 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Expense History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Expense History</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={BanknotesIcon}
            title="No expenses yet"
            description="Track your business expenses like shipping, warehouse fees, and more."
            action={
              <Button onClick={() => handleOpenModal()}>
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Expense
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => {
              const Icon = categoryIcons[expense.category] || EllipsisHorizontalCircleIcon
              const monthsActive = expense.is_recurring ? getMonthsActive(expense.date) : 1
              const totalAmount = expense.is_recurring
                ? parseFloat(expense.amount) * monthsActive
                : parseFloat(expense.amount)

              return (
                <div key={expense.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${categoryColors[expense.category] || 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {getCategoryLabel(expense.category)}
                      </p>
                      {expense.is_recurring && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <ArrowPathIcon className="h-3 w-3" />
                          Monthly
                        </span>
                      )}
                    </div>
                    {expense.description && (
                      <p className="text-sm text-gray-500 truncate">{expense.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {expense.is_recurring
                        ? `Started ${formatDate(expense.date)} (${monthsActive} month${monthsActive > 1 ? 's' : ''})`
                        : formatDate(expense.date)
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-{formatCurrency(totalAmount)}</p>
                    {expense.is_recurring && (
                      <p className="text-xs text-gray-500">{formatCurrency(expense.amount)}/mo</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(expense)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}
