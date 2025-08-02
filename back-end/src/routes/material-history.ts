import express from "express"
import { db } from "../config/firebase"
import type { MaterialHistory, ApiResponse } from "../types"

const router = express.Router()

// Hard-coded Bearer token for simple auth
const BEARER_TOKEN = "hardcodedtoken123"

// Middleware to check Bearer token
router.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing Bearer token" })
  }
  const token = authHeader.substring(7)
  if (token !== BEARER_TOKEN) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid Bearer token" })
  }
  next()
})

// GET /api/material-history - ดึงประวัติวัตถุดิบ
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("materialHistory").get()
    const history: MaterialHistory[] = snapshot.docs.map(
      (doc: any) =>
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

    if (!action || !date || !name || quantity === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    const historyData = {
      action,
      date,
      name,
      quantity,
      unit,
    }

    const docRef = await db.collection("materialHistory").add(historyData)

    res.status(201).json({
      success: true,
      data: { 
        id: docRef.id,
        ...historyData
      },
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
