// HTTP Client for API communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api${endpoint}`
      
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer hardcodedtoken123",
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data)
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Materials API
  async getMaterials() {
    return this.request("/materials")
  }

  async addMaterial(material: any) {
    return this.request("/materials", {
      method: "POST",
      body: JSON.stringify(material),
    })
  }

  async updateMaterial(id: string, data: any) {
    return this.request(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteMaterial(id: string) {
    return this.request(`/materials/${id}`, {
      method: "DELETE",
    })
  }

  async updateMaterialQuantity(materialName: string, quantity: number, action: "increase" | "decrease") {
    return this.request("/materials/quantity", {
      method: "POST",
      body: JSON.stringify({ materialName, quantity, action }),
    })
  }

  async updateMaterialUnit(materialName: string, newUnit: string) {
    return this.request("/materials/update-unit", {
      method: "PATCH",
      body: JSON.stringify({ materialName, newUnit }),
    })
  }

  // Material History API
  async getMaterialHistory() {
    return this.request("/material-history")
  }

  async addMaterialHistory(history: any) {
    return this.request("/material-history", {
      method: "POST",
      body: JSON.stringify({
        action: history.action,
        date: history.date,
        name: history.name,
        quantity: history.quantity,
        unit: history.unit,
      }),
    })
  }

  // Orders API
  async getOrders() {
    return this.request("/orders")
  }

  async addOrder(order: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    })
  }

  async updateOrder(id: string, data: any) {
    return this.request(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}`, {
      method: "DELETE",
    })
  }

  async addProductionQuantity(orderId: string, productionQuantity: string, productType: string) {
    return this.request("/orders/production", {
      method: "POST",
      body: JSON.stringify({ orderId, productionQuantity, productType }),
    })
  }

  // Transactions API
  async getTransactions() {
    return this.request("/transactions")
  }

  async addTransaction(transaction: any) {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  }

  async updateTransaction(id: string, data: any) {
    return this.request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
