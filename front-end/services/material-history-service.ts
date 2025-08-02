import { apiClient } from "./api-client"
import type { MaterialHistory } from "@/types/material"

// Get all material history
export const getMaterialHistory = async (): Promise<MaterialHistory[]> => {
  try {
    const response = await apiClient.getMaterialHistory()
    return (response.data as MaterialHistory[]) || []
  } catch (error) {
    console.error("Error getting material history:", error)
    throw error
  }
}

// Add new material history entry
export const addMaterialHistory = async (history: Omit<MaterialHistory, "id">): Promise<string> => {
  try {
    const response = await apiClient.addMaterialHistory(history)
    return (response.data as { id: string })?.id || ""
  } catch (error) {
    console.error("Error adding material history:", error)
    throw error
  }
}
