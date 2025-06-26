import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { MaterialHistory } from "@/types/material"

// GET - ดึงประวัติวัตถุดิบ
export async function GET() {
  try {
    const materialHistoryCollection = collection(db, "materialHistory")
    const snapshot = await getDocs(materialHistoryCollection)

    const history = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MaterialHistory[]

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error("Error getting material history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch material history" }, { status: 500 })
  }
}

// POST - เพิ่มประวัติวัตถุดิบ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, date, name, quantity, unit } = body

    if (!action || !date || !name || !quantity || !unit) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const materialHistoryCollection = collection(db, "materialHistory")
    const docRef = await addDoc(materialHistoryCollection, {
      action,
      date,
      name,
      quantity,
      unit,
    })

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: "Material history added successfully",
    })
  } catch (error) {
    console.error("Error adding material history:", error)
    return NextResponse.json({ success: false, error: "Failed to add material history" }, { status: 500 })
  }
}
