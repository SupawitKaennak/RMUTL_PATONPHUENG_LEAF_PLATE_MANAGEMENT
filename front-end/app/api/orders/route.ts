import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { Order } from "@/types/order"

// GET - ดึงข้อมูลออเดอร์ทั้งหมด
export async function GET() {
  try {
    const ordersCollection = collection(db, "orders")
    const snapshot = await getDocs(ordersCollection)

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Error getting orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST - เพิ่มออเดอร์ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lot, date, product, orderedQuantity, status } = body

    if (!lot || !date || !product || !orderedQuantity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const ordersCollection = collection(db, "orders")
    const docRef = await addDoc(ordersCollection, {
      lot,
      date,
      product,
      orderedQuantity,
      remainingQuantity: "",
      qcQuantity: "",
      electricityCost: 0,
      materialCost: 0,
      totalCost: 0,
      sellingPrice: 0,
      status: status || "กำลังผลิต",
      machineId: "",
    })

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: "Order added successfully",
    })
  } catch (error) {
    console.error("Error adding order:", error)
    return NextResponse.json({ success: false, error: "Failed to add order" }, { status: 500 })
  }
}
