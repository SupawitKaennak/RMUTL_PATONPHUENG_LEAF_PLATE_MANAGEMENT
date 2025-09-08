import express from "express"
import { db } from "../config/firebase"
import { validateTransaction } from "../middleware/validation"
import { authenticateToken } from "../middleware/auth"
import type { Transaction, ApiResponse } from "../types"

const router = express.Router()

// Middleware to check JWT token
router.use(authenticateToken)

// GET /api/transactions - ดึงข้อมูลรายรับ-รายจ่ายทั้งหมด
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("transactions").get()
    const transactions: Transaction[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Transaction,
    )

    const response: ApiResponse<Transaction[]> = {
      success: true,
      data: transactions,
    }

    res.json(response)
  } catch (error) {
    console.error("Error getting transactions:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    })
  }
})

// POST /api/transactions - เพิ่มรายรับ-รายจ่ายใหม่
router.post("/", validateTransaction, async (req, res) => {
  try {
    const { date, description, category, amount, quantity, isIncome, notes } = req.body

    const docRef = await db.collection("transactions").add({
      date,
      description,
      category,
      amount,
      quantity: quantity || "",
      isIncome: isIncome || false,
      notes: notes || "",
    })

    res.status(201).json({
      success: true,
      data: { id: docRef.id },
      message: "Transaction added successfully",
    })
  } catch (error) {
    console.error("Error adding transaction:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add transaction",
    })
  }
})

// PUT /api/transactions/:id - อัปเดตรายรับ-รายจ่าย
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    await db.collection("transactions").doc(id).update(updateData)

    res.json({
      success: true,
      message: "Transaction updated successfully",
    })
  } catch (error) {
    console.error("Error updating transaction:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update transaction",
    })
  }
})

// DELETE /api/transactions/:id - ลบรายรับ-รายจ่าย
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    await db.collection("transactions").doc(id).delete()

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete transaction",
    })
  }
})

export default router
