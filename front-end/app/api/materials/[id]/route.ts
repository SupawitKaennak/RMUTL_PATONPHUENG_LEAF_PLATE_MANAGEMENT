import { type NextRequest, NextResponse } from "next/server"
import { doc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-server"

// DELETE - ลบวัตถุดิบ
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Material ID is required" }, { status: 400 })
    }

    const docRef = doc(db, "materials", id)
    await deleteDoc(docRef)

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting material:", error)
    return NextResponse.json({ success: false, error: "Failed to delete material" }, { status: 500 })
  }
}

// PUT - อัปเดตวัตถุดิบ
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Material ID is required" }, { status: 400 })
    }

    const docRef = doc(db, "materials", id)
    await setDoc(docRef, body, { merge: true })

    return NextResponse.json({
      success: true,
      message: "Material updated successfully",
    })
  } catch (error) {
    console.error("Error updating material:", error)
    return NextResponse.json({ success: false, error: "Failed to update material" }, { status: 500 })
  }
}
