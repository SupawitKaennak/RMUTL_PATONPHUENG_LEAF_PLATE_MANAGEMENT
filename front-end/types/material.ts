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
