import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { Material } from "@/types/material"

// GET - ดึงข้อมูลวัตถุดิบทั้งหมด
export async function GET() {
  try {
    const materialsCollection = collection(db, "materials")
    const snapshot = await getDocs(materialsCollection)

    const materials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Material[]

    return NextResponse.json({ success: true, data: materials })
  } catch (error) {
    console.error("Error getting materials:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch materials" }, { status: 500 })
  }
}

// POST - เพิ่มวัตถุดิบใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, quantity, unit, pricePerUnit, date } = body

    // Validate required fields
    if (!name || !quantity || !unit || !pricePerUnit || !date) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const materialsCollection = collection(db, "materials")

    // ตรวจสอบว่ามีวัตถุดิบชื่อนี้อยู่แล้วหรือไม่
    const q = query(materialsCollection, where("name", "==", name))
    const existingSnapshot = await getDocs(q)

    let materialId: string

    if (!existingSnapshot.empty) {
      // ถ้ามีวัตถุดิบชื่อนี้อยู่แล้ว ให้อัปเดตจำนวน
      const existingDoc = existingSnapshot.docs[0]
      const existingData = existingDoc.data() as Material

      const updatedQuantity = existingData.quantity + quantity

      // อัปเดตข้อมูล
      const { setDoc, doc } = await import("firebase/firestore")
      const docRef = doc(db, "materials", existingDoc.id)

      await setDoc(
        docRef,
        {
          quantity: updatedQuantity,
          date,
          pricePerUnit: pricePerUnit || existingData.pricePerUnit,
          name: existingData.name,
          unit: existingData.unit,
        },
        { merge: true },
      )

      materialId = existingDoc.id
    } else {
      // ถ้าไม่มีวัตถุดิบชื่อนี้ ให้เพิ่มใหม่
      const docRef = await addDoc(materialsCollection, {
        name,
        quantity,
        unit,
        pricePerUnit,
        date,
      })
      materialId = docRef.id
    }

    return NextResponse.json({
      success: true,
      data: { id: materialId },
      message: "Material added/updated successfully",
    })
  } catch (error) {
    console.error("Error adding material:", error)
    return NextResponse.json({ success: false, error: "Failed to add material" }, { status: 500 })
  }
}
