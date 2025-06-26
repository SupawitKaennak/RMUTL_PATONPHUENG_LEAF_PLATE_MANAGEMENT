import { type NextRequest, NextResponse } from "next/server"
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { Order } from "@/types/order"

// กำหนดสูตรการผลิต
const DISH_RECIPES = {
  จานสี่เหลี่ยม: 4,
  จานวงกลม: 4,
  จานหัวใจ: 5,
}

// DELETE - ลบออเดอร์และคืนวัตถุดิบ
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    // ดึงข้อมูลออเดอร์ก่อนลบ
    const docRef = doc(db, "orders", id)
    const orderDoc = await getDoc(docRef)

    if (orderDoc.exists()) {
      const orderData = orderDoc.data() as Order

      // คืนใบตองตึงถ้ามีการผลิตแล้ว
      if (orderData.remainingQuantity) {
        const quantityMatch = orderData.remainingQuantity.match(/\d+/)
        if (quantityMatch) {
          const producedQuantity = Number.parseInt(quantityMatch[0])
          const materialNeeded = calculateMaterialNeeded(orderData.product, producedQuantity)

          if (materialNeeded > 0) {
            // เรียก API เพื่อคืนใบตองตึง
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/materials/quantity`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                materialName: "ใบตองตึง",
                quantity: materialNeeded,
                action: "increase",
              }),
            })
          }
        }
      }
    }

    // ลบออเดอร์
    await deleteDoc(docRef)

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully and materials returned",
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 })
  }
}

// PUT - อัปเดตออเดอร์
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const docRef = doc(db, "orders", id)
    await setDoc(docRef, body, { merge: true })

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}

// Helper function
function calculateMaterialNeeded(dishType: string, quantity: number): number {
  const materialPerDish = DISH_RECIPES[dishType as keyof typeof DISH_RECIPES] || 0
  return materialPerDish * quantity
}
