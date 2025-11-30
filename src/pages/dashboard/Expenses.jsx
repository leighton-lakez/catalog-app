import ExpenseList from '../../components/expenses/ExpenseList'
import { useExpenses } from '../../hooks/useExpenses'
import { useAnalytics } from '../../hooks/useAnalytics'

export default function Expenses() {
  const {
    expenses,
    loading,
    totalExpenses,
    expensesByCategory,
    recurringMonthly,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses()

  const { stats } = useAnalytics()

  return (
    <ExpenseList
      expenses={expenses}
      totalExpenses={totalExpenses}
      expensesByCategory={expensesByCategory}
      recurringMonthly={recurringMonthly}
      totalRevenue={stats.totalRevenue || 0}
      totalProductCost={stats.totalCost || 0}
      onCreateExpense={createExpense}
      onUpdateExpense={updateExpense}
      onDeleteExpense={deleteExpense}
      loading={loading}
    />
  )
}
