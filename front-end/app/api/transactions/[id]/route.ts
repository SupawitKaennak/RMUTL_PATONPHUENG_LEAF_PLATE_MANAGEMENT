import { type NextRequest, NextResponse } from "next/server"
import { doc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-server"

// DELETE - ลบรายรับ-รายจ่าย
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const docRef = doc(db, "transactions", id)
    await deleteDoc(docRef)

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to delete transaction" }, { status: 500 })
  }
}

// PUT - อัปเดตรายรับ-รายจ่าย
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const docRef = doc(db, "transactions", id)
    await setDoc(docRef, body, { merge: true })

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
    })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to update transaction" }, { status: 500 })
  }
}
