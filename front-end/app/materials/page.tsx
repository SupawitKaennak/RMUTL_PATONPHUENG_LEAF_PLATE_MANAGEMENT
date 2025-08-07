import MaterialsManagement from "@/components/materials-management"
import ProtectedRoute from "@/components/protected-route"

export default function MaterialsPage() {
  return (
    <ProtectedRoute>
      <MaterialsManagement />
    </ProtectedRoute>
  )
}
