"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // ถ้าไม่ได้ loading และไม่ได้ authenticate ให้ redirect
    if (!isLoading && !isAuthenticated) {
      console.log("🔒 ProtectedRoute: User not authenticated, redirecting to login")
      setShouldRedirect(true)
      // ใช้ setTimeout เพื่อให้ state อัปเดตก่อน redirect
      setTimeout(() => {
        router.push("/login")
      }, 100)
    }
  }, [isAuthenticated, isLoading, router])

  // ถ้ากำลังโหลด ให้แสดง loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // ถ้าไม่ได้ authenticate หรือกำลัง redirect ให้แสดง loading
  if (!isAuthenticated || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  // ถ้า authenticate แล้ว ให้แสดง children
  return <>{children}</>
}
