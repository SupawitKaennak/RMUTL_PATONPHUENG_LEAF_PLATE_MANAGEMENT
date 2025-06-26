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
