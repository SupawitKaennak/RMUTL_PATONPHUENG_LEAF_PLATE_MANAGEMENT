import { apiClient } from "./api-client"
import type { Material, MaterialHistory } from "@/types/material"

export const getMaterials = async (): Promise<Material[]> => {
  try {
    const response = await apiClient.getMaterials()
    return (response.data as Material[]) || []
  } catch (error) {
    console.error("Error getting materials:", error)
    throw error
  }
}

export const addMaterial = async (material: Omit<Material, "id">): Promise<string> => {
  try {
    const response = await apiClient.addMaterial(material)
    return (response.data as { id: string })?.id || ""
  } catch (error) {
    console.error("Error adding material:", error)
    throw error
  }
}

export const updateMaterial = async (id: string, data: Partial<Material>): Promise<void> => {
  try {
    await apiClient.updateMaterial(id, data)
  } catch (error) {
    console.error("Error updating material:", error)
    throw error
  }
}

export const deleteMaterial = async (id: string): Promise<void> => {
  try {
    await apiClient.deleteMaterial(id)
  } catch (error) {
    console.error("Error deleting material:", error)
    throw error
  }
}

export const getMaterialHistory = async (): Promise<MaterialHistory[]> => {
  try {
    const response = await apiClient.getMaterialHistory()
    return (response.data as MaterialHistory[]) || []
  } catch (error) {
    console.error("Error getting material history:", error)
    throw error
  }
}

export const addMaterialHistory = async (history: Omit<MaterialHistory, "id">): Promise<MaterialHistory> => {
  try {
    const response = await apiClient.addMaterialHistory(history)
    const savedHistory = response.data as { id: string }
    return {
      id: savedHistory.id,
      ...history,
    } as MaterialHistory
  } catch (error) {
    console.error("Error adding material history:", error)
    throw error
  }
}

export const increaseMaterialQuantity = async (materialName: string, quantityToIncrease: number): Promise<boolean> => {
  try {
    const response = await apiClient.updateMaterialQuantity(materialName, quantityToIncrease, "increase")
    return response.success
  } catch (error) {
    console.error("Error increasing material quantity:", error)
    return false
  }
}

export const decreaseMaterialQuantity = async (materialName: string, quantityToDecrease: number): Promise<boolean> => {
  try {
    const response = await apiClient.updateMaterialQuantity(materialName, quantityToDecrease, "decrease")
    return response.success
  } catch (error) {
    console.error("Error decreasing material quantity:", error)
    return false
  }
}

export const updateMaterialUnit = async (materialName: string, newUnit: string): Promise<boolean> => {
  try {
    const response = await apiClient.updateMaterialUnit(materialName, newUnit)
    return response.success
  } catch (error) {
    console.error("Error updating material unit:", error)
    return false
  }
}
