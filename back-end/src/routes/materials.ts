import express from "express"
import { db } from "../config/firebase"
import { validateMaterial } from "../middleware/validation"
import type { Material, ApiResponse } from "../types"

const router = express.Router()

// GET /api/materials - ดึงข้อมูลวัตถุดิบทั้งหมด
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("materials").get()
    const materials: Material[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Material,
    )

    const response: ApiResponse<Material[]> = {
      success: true,
      data: materials,
    }

    res.json(response)
  } catch (error) {
    console.error("Error getting materials:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch materials",
    })
  }
})

// POST /api/materials - เพิ่มวัตถุดิบใหม่
router.post("/", validateMaterial, async (req, res) => {
  try {
    const { name, quantity, unit, pricePerUnit, date } = req.body

    // ตรวจสอบว่ามีวัตถุดิบชื่อนี้อยู่แล้วหรือไม่
    const existingSnapshot = await db.collection("materials").where("name", "==", name).get()

    let materialId: string

    if (!existingSnapshot.empty) {
      // ถ้ามีวัตถุดิบชื่อนี้อยู่แล้ว ให้อัปเดตจำนวน
      const existingDoc = existingSnapshot.docs[0]
      const existingData = existingDoc.data() as Material

      const updatedQuantity = existingData.quantity + quantity

      await existingDoc.ref.update({
        quantity: updatedQuantity,
        date,
        pricePerUnit: pricePerUnit || existingData.pricePerUnit,
      })

      materialId = existingDoc.id
    } else {
      // ถ้าไม่มีวัตถุดิบชื่อนี้ ให้เพิ่มใหม่
      const docRef = await db.collection("materials").add({
        name,
        quantity,
        unit,
        pricePerUnit,
        date,
      })
      materialId = docRef.id
    }

    res.status(201).json({
      success: true,
      data: { id: materialId },
      message: "Material added/updated successfully",
    })
  } catch (error) {
    console.error("Error adding material:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add material",
    })
  }
})

// PUT /api/materials/:id - อัปเดตวัตถุดิบ
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    await db.collection("materials").doc(id).update(updateData)

    res.json({
      success: true,
      message: "Material updated successfully",
    })
  } catch (error) {
    console.error("Error updating material:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update material",
    })
  }
})

// DELETE /api/materials/:id - ลบวัตถุดิบ
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    await db.collection("materials").doc(id).delete()

    res.json({
      success: true,
      message: "Material deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting material:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete material",
    })
  }
})

// POST /api/materials/quantity - เพิ่ม/ลดจำนวนวัตถุดิบ
router.post("/quantity", async (req, res) => {
  try {
    const { materialName, quantity, action } = req.body

    if (!materialName || !quantity || !action) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    const snapshot = await db.collection("materials").where("name", "==", materialName).get()

    let success = false
    let message = ""

    if (snapshot.empty) {
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

        await db.collection("materials").add(newMaterial)
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
        await materialDoc.ref.update({ quantity: newQuantity })
        success = true
        message = `Successfully ${action}d ${materialName} by ${quantity}, new quantity: ${newQuantity}`
      }
    }

    res.json({ success, message })
  } catch (error) {
    console.error("Error updating material quantity:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update material quantity",
    })
  }
})

export default router
