// HTTP Client for API communication
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: API is at the same origin as the page.
    // This ensures cookies work correctly for both localhost and 127.0.0.1.
    return window.location.origin;
  }
  
  // Server-side rendering: Use the environment variable.
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

const API_BASE_URL = getApiBaseUrl()

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private ensureCsrfReady = false

  private async ensureCsrfCookie(): Promise<void> {
    if (this.ensureCsrfReady) return
    try {
      // If cookie already exists, skip
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('csrfToken=')
      if (hasCookie) {
        this.ensureCsrfReady = true
        return
      }
    } catch {}
    try {
      const baseUrl = getApiBaseUrl()
      await fetch(`${baseUrl}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      })
      this.ensureCsrfReady = true
    } catch {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}/api${endpoint}`
      
      // For non-GET, make sure CSRF cookie is present
      const method = (options.method || 'GET').toUpperCase()
      if (method !== 'GET' && method !== 'HEAD') {
        await this.ensureCsrfCookie()
      }

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: 'include', // ส่ง cookies อัตโนมัติ
        ...options,
      }

      // Attach CSRF header if we have the cookie (double submit cookie pattern)
      try {
        const csrfCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrfToken='))
        if (csrfCookie) {
          const token = csrfCookie.split('=')[1]
          ;(config.headers as any)["X-CSRF-Token"] = token
        }
      } catch {}

      console.log(`🌐 Making API request to: ${url}`)
      
      let response = await fetch(url, config)
      // If CSRF fails once, attempt to fetch a new CSRF cookie and retry once
      if (response.status === 403) {
        try {
          await this.ensureCsrfCookie()
          // Refresh header value in case cookie changed
          try {
            const csrfCookie = document.cookie
              .split('; ')
              .find(row => row.startsWith('csrfToken='))
            if (csrfCookie) {
              const token = csrfCookie.split('=')[1]
              ;(config.headers as any)["X-CSRF-Token"] = token
            }
          } catch {}
          response = await fetch(url, config)
        } catch {}
      }
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

  // Auth API (ไม่ต้องใช้ token)
  async login(username: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async register(username: string, email: string, password: string, fullName: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, fullName }),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async checkAuthStatus() {
    return this.request("/auth/me")
  }

  // Generic HTTP Methods for Admin API
  async get(endpoint: string) {
    return this.request(endpoint)
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
