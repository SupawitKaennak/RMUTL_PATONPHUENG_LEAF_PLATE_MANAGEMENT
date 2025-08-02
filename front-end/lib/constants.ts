// กำหนดสูตรการผลิต - ใช้ร่วมกันระหว่าง front-end และ back-end
export const DISH_RECIPES = {
  จานสี่เหลี่ยม: { ใบตองตึง: 4, แป้งข้าวเหนียว: 2 },
  จานวงกลม: { ใบตองตึง: 4, แป้งข้าวเหนียว: 2 },
  จานหัวใจ: { ใบตองตึง: 5, แป้งข้าวเหนียว: 2 },
} as const

export type DishType = keyof typeof DISH_RECIPES

// ฟังก์ชันคำนวณวัตถุดิบที่ต้องการ
export const calculateMaterialNeeded = (dishType: string, quantity: number): { [material: string]: number } => {
  const recipe = DISH_RECIPES[dishType as DishType]
  if (!recipe) return {}
  
  const result: { [material: string]: number } = {}
  for (const [material, amount] of Object.entries(recipe)) {
    result[material] = amount * quantity
  }
  return result
}

// ฟังก์ชันคำนวณต้นทุนวัตถุดิบ
export const calculateMaterialCost = (
  productType: string, 
  quantity: number, 
  materials: Array<{ name: string; pricePerUnit: number }>
): number => {
  const recipe = DISH_RECIPES[productType as DishType]
  if (!recipe) return 0
  
  let totalCost = 0
  for (const [materialName, materialAmount] of Object.entries(recipe)) {
    const materialPrice = materials.find(m => m.name === materialName)?.pricePerUnit || 0
    totalCost += materialAmount * quantity * materialPrice
  }
  return totalCost
}

// ฟังก์ชันคำนวณต้นทุนรวม
export const calculateTotalCost = (materialCost: number, electricityCost: number): number => {
  return materialCost + electricityCost
} 