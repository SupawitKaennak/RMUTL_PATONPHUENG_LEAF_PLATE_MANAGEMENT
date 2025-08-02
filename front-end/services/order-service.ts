import { apiClient } from "./api-client"
import type { Order } from "@/types/order"
import { DISH_RECIPES, calculateMaterialNeeded } from "@/lib/constants"

export async function updateProductionQuantity(orderId: string, newQuantity: number) {
  try {
    const response = await apiClient.updateOrder(orderId, { remainingQuantity: `${newQuantity} จาน` })
    return response
  } catch (error) {
    console.error("Error updating production quantity:", error)
    throw error
  }
}

export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiClient.getOrders()
    return response.data || []
  } catch (error) {
    console.error("Error getting orders:", error)
    throw error
  }
}

export const addOrder = async (order: Omit<Order, "id">): Promise<string> => {
  try {
    const response = await apiClient.addOrder(order)
    return response.data?.id || ""
  } catch (error) {
    console.error("Error adding order:", error)
    throw error
  }
}

export const updateOrder = async (id: string, data: Partial<Order>): Promise<Order | null> => {
  try {
    const response = await apiClient.updateOrder(id, data)
    return response.data || null
  } catch (error) {
    console.error("Error updating order:", error)
    throw error
  }
}

export const deleteOrder = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.deleteOrder(orderId)
    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    console.error("Error deleting order:", error)
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการลบออเดอร์",
    }
  }
}

export const addProductionQuantity = async (
  orderId: string,
  productionQuantity: string,
  productType: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.addProductionQuantity(orderId, productionQuantity, productType)
    return {
      success: response.success,
      message: response.message,
    }
  } catch (error) {
    console.error("Error adding production quantity:", error)
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
    }
  }
}

export const updateElectricityCost = async (
  orderId: string,
  electricityCost: number,
  materialCost: number,
): Promise<boolean> => {
  try {
    const totalCost = electricityCost + materialCost
    await apiClient.updateOrder(orderId, {
      electricityCost,
      totalCost,
    })
    return true
  } catch (error) {
    console.error("Error updating electricity cost:", error)
    return false
  }
}

export const getDishRecipes = () => {
  return DISH_RECIPES
}
