import { apiClient } from "./api-client"
import type { Transaction } from "@/types/transaction"

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await apiClient.getTransactions()
    return response.data || []
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw error
  }
}

export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<string> => {
  try {
    const response = await apiClient.addTransaction(transaction)
    return response.data?.id || ""
  } catch (error) {
    console.error("Error adding transaction:", error)
    throw error
  }
}

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<void> => {
  try {
    await apiClient.updateTransaction(id, data)
  } catch (error) {
    console.error("Error updating transaction:", error)
    throw error
  }
}

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await apiClient.deleteTransaction(id)
  } catch (error) {
    console.error("Error deleting transaction:", error)
    throw error
  }
}
