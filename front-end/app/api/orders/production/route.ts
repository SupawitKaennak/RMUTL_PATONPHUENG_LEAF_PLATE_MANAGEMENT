import { type NextRequest, NextResponse } from "next/server"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-server"

// กำหนดสูตรการผลิต
const DISH_RECIPES = {
  จานสี่เหลี่ยม: 4,
  จานวงกลม: 4,
  จานหัวใจ: 5,
}

// POST - เพิ่มจำนวนการผลิต
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, productionQuantity, productType } = body

    if (!orderId || !productionQuantity || !productType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const quantityNum = Number.parseInt(productionQuantity) || 0
    const materialNeeded = calculateMaterialNeeded(productType, quantityNum)

    if (materialNeeded === 0) {
      return NextResponse.json({
        success: false,
        message: `ไม่พบสูตรการผลิตสำหรับ ${productType}`,
      })
    }

    // ลดจำนวนใบตองตึงในคลัง
    const materialResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/materials/quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materialName: "ใบตองตึง",
        quantity: materialNeeded,
        action: "decrease",
      }),
    })

    const materialResult = await materialResponse.json()

    if (!materialResult.success) {
      return NextResponse.json({
        success: false,
        message: `ใบตองตึงไม่เพียงพอ ต้องการ ${materialNeeded} ใบ สำหรับการผลิต ${productType} ${quantityNum} จาน`,
      })
    }

    // คำนวณต้นทุนวัตถุดิบ
    const materialCostPerLeaf = 1.0
    const totalMaterialCost = materialNeeded * materialCostPerLeaf

    // อัปเดตออเดอร์
    const docRef = doc(db, "orders", orderId)
    await setDoc(
      docRef,
      {
        remainingQuantity: `${productionQuantity} จาน`,
        materialCost: totalMaterialCost,
        totalCost: totalMaterialCost,
      },
      { merge: true },
    )

    return NextResponse.json({
      success: true,
      message: `ผลิต ${productType} ${quantityNum} จาน สำเร็จ ใช้ใบตองตึง ${materialNeeded} ใบ`,
    })
  } catch (error) {
    console.error("Error adding production quantity:", error)
    return NextResponse.json({ success: false, error: "Failed to add production quantity" }, { status: 500 })
  }
}

function calculateMaterialNeeded(dishType: string, quantity: number): number {
  const materialPerDish = DISH_RECIPES[dishType as keyof typeof DISH_RECIPES] || 0
  return materialPerDish * quantity
}
