import express from "express"
import { db } from "../config/firebase"
import type { MaterialHistory, ApiResponse } from "../types"
import jwt from "jsonwebtoken"

const router = express.Router()

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware to check JWT token
router.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing JWT token" })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired token" })
  }
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
