"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getMaterials, decreaseMaterialQuantity } from "@/services/material-service"
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

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const materialsData = await getMaterials()
      setMaterials(materialsData)
      setError(null)
    } catch (error) {
      console.error("Error fetching materials:", error)
      setError("ไม่สามารถโหลดข้อมูลวัตถุดิบได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

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
