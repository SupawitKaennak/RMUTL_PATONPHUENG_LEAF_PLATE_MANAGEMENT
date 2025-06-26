import express from "express"
import { db } from "../config/firebase"
import type { MaterialHistory, ApiResponse } from "../types"

const router = express.Router()

// GET /api/material-history - ดึงประวัติวัตถุดิบ
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("materialHistory").get()
    const history: MaterialHistory[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as MaterialHistory,
    )

    const response: ApiResponse<MaterialHistory[]> = {
      success: true,
      data: history,
    }

    res.json(response)
  } catch (error) {
    console.error("Error getting material history:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch material history",
    })
  }
})

// POST /api/material-history - เพิ่มประวัติวัตถุดิบ
router.post("/", async (req, res) => {
  try {
    const { action, date, name, quantity, unit } = req.body

    if (!action || !date || !name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    const docRef = await db.collection("materialHistory").add({
      action,
      date,
      name,
      quantity,
      unit,
    })

    res.status(201).json({
      success: true,
      data: { id: docRef.id },
      message: "Material history added successfully",
    })
  } catch (error) {
    console.error("Error adding material history:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add material history",
    })
  }
})

export default router
