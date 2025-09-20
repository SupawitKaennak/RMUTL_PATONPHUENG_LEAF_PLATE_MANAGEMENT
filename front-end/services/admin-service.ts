import { apiClient } from "./api-client"

export interface AdminUser {
  id: string
  username: string
  email: string
  fullName: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  fullName: string
  role?: 'admin' | 'user'
}

export interface UpdateUserData {
  username?: string
  email?: string
  fullName?: string
  role?: 'admin' | 'user'
  isActive?: boolean
}

export interface SystemStats {
  users: {
    total: number
    active: number
    admins: number
    regular: number
  }
  data: {
    materials: number
    orders: number
    transactions: number
  }
  system: {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    nodeVersion: string
  }
}

export const adminService = {
  // ดึงรายชื่อผู้ใช้ทั้งหมด
  async getUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get('/admin/users')
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to fetch users')
  },

  // ดึงข้อมูลผู้ใช้เฉพาะ
  async getUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.get(`/admin/users/${userId}`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to fetch user')
  },

  // สร้างผู้ใช้ใหม่
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    const response = await apiClient.post('/admin/users', userData)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to create user')
  },

  // อัปเดตข้อมูลผู้ใช้
  async updateUser(userId: string, userData: UpdateUserData): Promise<AdminUser> {
    const response = await apiClient.put(`/admin/users/${userId}`, userData)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to update user')
  },

  // ลบผู้ใช้
  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user')
    }
  },

  // รีเซ็ตรหัสผ่าน
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const response = await apiClient.put(`/admin/users/${userId}/reset-password`, {
      newPassword
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password')
    }
  },

  // ดึงสถิติระบบ
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get('/admin/stats')
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to fetch system stats')
  }
}
