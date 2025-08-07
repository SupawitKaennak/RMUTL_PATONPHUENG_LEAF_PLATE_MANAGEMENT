export interface Material {
  id: string
  date: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
}

export interface MaterialHistory {
  id: string
  action: "เพิ่ม" | "ลบ" | "นำไปใช้" | "คืนวัตถุดิบ"
  date: string
  name: string
  quantity: number
  unit: string
}

export interface Order {
  id: string
  lot: string
  date: string
  product: string
  orderedQuantity: string
  remainingQuantity: string
  qcQuantity: string
  electricityCost: number
  materialCost: number
  totalCost: number
  sellingPrice: number
  status: string
  machineId?: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  quantity: string
  isIncome: boolean
  notes: string
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        username: string
        email: string
        fullName: string
      }
    }
  }
}
