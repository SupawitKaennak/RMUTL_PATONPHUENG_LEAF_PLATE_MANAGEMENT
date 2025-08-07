import ReportsManagement from "@/components/reports-management"
import ProtectedRoute from "@/components/protected-route"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsManagement />
    </ProtectedRoute>
  )
}
