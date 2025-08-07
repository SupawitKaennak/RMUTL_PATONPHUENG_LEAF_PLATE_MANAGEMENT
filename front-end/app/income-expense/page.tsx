import IncomeExpenseTracker from "@/components/income-expense-tracker"
import ProtectedRoute from "@/components/protected-route"

export default function IncomeExpensePage() {
  return (
    <ProtectedRoute>
      <IncomeExpenseTracker />
    </ProtectedRoute>
  )
}
