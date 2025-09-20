import AdminDashboard from "@/components/admin-dashboard"
import ProtectedRoute from "@/components/protected-route"
import AdminRoute from "@/components/admin-route"

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    </ProtectedRoute>
  )
}
