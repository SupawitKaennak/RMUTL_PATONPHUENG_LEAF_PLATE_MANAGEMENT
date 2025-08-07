"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getMaterials, decreaseMaterialQuantity } from "@/services/material-service"
import { useAuth } from "@/context/auth-context"
import type { Material } from "@/types/material"

interface MaterialContextType {
  materials: Material[]
  loading: boolean
  error: string | null
  refreshMaterials: () => Promise<void>
  decreaseMaterialQuantity: (materialName: string, quantityToDecrease: number) => Promise<boolean>
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined)

export function useMaterials() {
  const context = useContext(MaterialContext)
  if (context === undefined) {
    throw new Error("useMaterials must be used within a MaterialProvider")
  }
  return context
}

interface MaterialProviderProps {
  children: ReactNode
}

export function MaterialProvider({ children }: MaterialProviderProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const fetchMaterials = async () => {
    // ตรวจสอบว่า user ได้ login แล้วหรือยัง
    if (!isAuthenticated) {
      console.log("🔒 User not authenticated, skipping materials fetch")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("📦 Fetching materials...")
      const materialsData = await getMaterials()
      setMaterials(materialsData)
      setError(null)
      console.log("✅ Materials fetched successfully")
    } catch (error) {
      console.error("❌ Error fetching materials:", error)
      setError("ไม่สามารถโหลดข้อมูลวัตถุดิบได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // รอให้ auth loading เสร็จก่อน แล้วค่อยตรวจสอบ authentication
    if (!authLoading) {
      fetchMaterials()
    }
  }, [isAuthenticated, authLoading])

  const refreshMaterials = async () => {
    await fetchMaterials()
  }

  const value = {
    materials,
    loading,
    error,
    refreshMaterials,
    decreaseMaterialQuantity,
  }

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>
}

export { MaterialContext }
