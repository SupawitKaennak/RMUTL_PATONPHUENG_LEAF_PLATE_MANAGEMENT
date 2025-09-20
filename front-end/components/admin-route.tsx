"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      // Redirect to home page if not admin
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              คุณต้องเข้าสู่ระบบก่อนจึงจะเข้าถึงหน้านี้ได้
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push("/login")}>
              ไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              คุณไม่มีสิทธิ์เข้าถึงหน้า Admin หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push("/")} variant="outline">
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
