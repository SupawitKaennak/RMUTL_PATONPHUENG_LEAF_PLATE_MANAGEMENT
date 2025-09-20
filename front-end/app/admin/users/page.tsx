import AdminUserManagement from "@/components/admin-user-management"
import ProtectedRoute from "@/components/protected-route"
import AdminRoute from "@/components/admin-route"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <AdminUserManagement />
      </AdminRoute>
    </ProtectedRoute>
  )
}
