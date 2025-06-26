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
  action: "เพิ่ม" | "ลด" | "ลบ"
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

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
