import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-server"
import type { Transaction } from "@/types/transaction"

// GET - ดึงข้อมูลรายรับ-รายจ่ายทั้งหมด
export async function GET() {
  try {
    const transactionsCollection = collection(db, "transactions")
    const snapshot = await getDocs(transactionsCollection)

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[]

    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error("Error getting transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// POST - เพิ่มรายรับ-รายจ่ายใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, description, category, amount, quantity, isIncome, notes } = body

    if (!description || !category || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const transactionsCollection = collection(db, "transactions")
    const docRef = await addDoc(transactionsCollection, {
      date,
      description,
      category,
      amount,
      quantity: quantity || "",
      isIncome: isIncome || false,
      notes: notes || "",
    })

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: "Transaction added successfully",
    })
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to add transaction" }, { status: 500 })
  }
}
