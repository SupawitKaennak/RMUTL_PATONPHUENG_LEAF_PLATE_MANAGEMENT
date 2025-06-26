import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, setDoc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { Material } from "@/types/material"

// POST - เพิ่ม/ลดจำนวนวัตถุดิบ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { materialName, quantity, action } = body // action: 'increase' | 'decrease'

    if (!materialName || !quantity || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const materialsCollection = collection(db, "materials")
    const q = query(materialsCollection, where("name", "==", materialName))
    const snapshot = await getDocs(q)

    let success = false
    let message = ""

    if (snapshot.empty) {
      // ถ้าไม่มีวัตถุดิบ ให้สร้างใหม่
      if (action === "increase") {
        const newMaterial = {
          date: new Date().toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }),
          name: materialName,
          quantity: quantity,
          unit: "ใบ",
          pricePerUnit: 1.0,
        }

        await addDoc(materialsCollection, newMaterial)
        success = true
        message = `Created new material ${materialName} with quantity: ${quantity}`
      } else {
        success = false
        message = `Material ${materialName} not found`
      }
    } else {
      const materialDoc = snapshot.docs[0]
      const materialData = materialDoc.data() as Material

      let newQuantity = materialData.quantity

      if (action === "increase") {
        newQuantity += quantity
      } else if (action === "decrease") {
        if (materialData.quantity < quantity) {
          success = false
          message = `Not enough ${materialName}: required ${quantity}, available ${materialData.quantity}`
        } else {
          newQuantity -= quantity
        }
      }

      if (action === "increase" || (action === "decrease" && materialData.quantity >= quantity)) {
        const docRef = doc(db, "materials", materialDoc.id)
        await setDoc(docRef, { quantity: newQuantity }, { merge: true })
        success = true
        message = `Successfully ${action}d ${materialName} by ${quantity}, new quantity: ${newQuantity}`
      }
    }

    return NextResponse.json({ success, message })
  } catch (error) {
    console.error("Error updating material quantity:", error)
    return NextResponse.json({ success: false, error: "Failed to update material quantity" }, { status: 500 })
  }
}
