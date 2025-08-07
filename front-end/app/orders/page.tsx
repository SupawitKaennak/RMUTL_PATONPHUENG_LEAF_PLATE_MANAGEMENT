import OrdersManagement from "@/components/orders-management"
import ProtectedRoute from "@/components/protected-route"

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersManagement />
    </ProtectedRoute>
  )
}
