import express from "express"
import { db } from "../config/firebase"
import { validateOrder } from "../middleware/validation"
import type { Order, ApiResponse } from "../types"

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

// กำหนดสูตรการผลิต
const DISH_RECIPES = {
  จานสี่เหลี่ยม: 4,
  จานวงกลม: 4,
  จานหัวใจ: 5,
}

// GET /api/orders - ดึงข้อมูลออเดอร์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("orders").get()
    const orders: Order[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Order,
    )

    const response: ApiResponse<Order[]> = {
      success: true,
      data: orders,
    }

    res.json(response)
  } catch (error) {
    console.error("Error getting orders:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    })
  }
})

// POST /api/orders - เพิ่มออเดอร์ใหม่
router.post("/", validateOrder, async (req, res) => {
  try {
    const {
      lot,
      date,
      product,
      orderedQuantity,
      remainingQuantity = "",
      qcQuantity = "",
      electricityCost = 0,
      materialCost = 0,
      totalCost = 0,
      sellingPrice = 0,
      status = "กำลังผลิต",
      machineId = "",
    } = req.body

    const docRef = await db.collection("orders").add({
      lot,
      date,
      product,
      orderedQuantity,
      remainingQuantity,
      qcQuantity,
      electricityCost,
      materialCost,
      totalCost,
      sellingPrice,
      status,
      machineId,
    })

    res.status(201).json({
      success: true,
      data: { id: docRef.id },
      message: "Order added successfully",
    })
  } catch (error) {
    console.error("Error adding order:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add order",
    })
  }
})

// PUT /api/orders/:id - อัปเดตออเดอร์
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { remainingQuantity, machineId, electricityCost, ...otherFields } = req.body

    // ดึงข้อมูล order เดิม
    const orderRef = db.collection("orders").doc(id)
    const orderDoc = await orderRef.get()
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, error: "Order not found" })
    }
    const oldOrder = orderDoc.data()
    let updateObj: any = { ...otherFields }

    // ถ้ามีการอัปเดต remainingQuantity ให้จัดการวัตถุดิบและคำนวณต้นทุนวัตถุดิบใหม่
    if (remainingQuantity !== undefined) {
      const oldQty = parseInt((oldOrder?.remainingQuantity || "0").replace(/\D/g, ""))
      const newQty = parseInt((remainingQuantity || "0").replace(/\D/g, ""))
      const productType = oldOrder?.product
      const diff = Math.abs(newQty - oldQty)
      const materialNeeded = calculateMaterialNeeded(productType, diff)

      // ดึงราคาต่อหน่วยจริงจากฐานข้อมูลวัตถุดิบ
      const materialSnapshot = await db.collection("materials").where("name", "==", "ใบตองตึง").get()
      let materialCostPerLeaf = 1.0
      if (!materialSnapshot.empty) {
        const materialDoc = materialSnapshot.docs[0]
        const currentQuantity = materialDoc.data().quantity

        if (newQty < oldQty) {
          // คืนวัตถุดิบ
          await materialDoc.ref.update({
            quantity: currentQuantity + materialNeeded,
          })
        } else if (newQty > oldQty) {
          // ใช้วัตถุดิบเพิ่ม
          if (currentQuantity < materialNeeded) {
            return res.status(400).json({
              success: false,
              error: `ใบตองตึงไม่เพียงพอ ต้องการเพิ่มอีก ${materialNeeded} ใบ แต่มีอยู่ ${currentQuantity} ใบ`,
            })
          }
          await materialDoc.ref.update({
            quantity: currentQuantity - materialNeeded,
          })
        }
        materialCostPerLeaf = materialDoc.data().pricePerUnit || 1.0
      }

      // คำนวณต้นทุนวัตถุดิบใหม่
      const totalMaterialNeeded = calculateMaterialNeeded(productType, newQty)
      const totalMaterialCost = totalMaterialNeeded * (materialCostPerLeaf || 1.0)

      updateObj.remainingQuantity = remainingQuantity
      updateObj.materialCost = totalMaterialCost
      // Calculate totalCost as sum of materialCost and electricityCost
      const electricityCostValue = electricityCost !== undefined ? electricityCost : oldOrder?.electricityCost || 0
      updateObj.totalCost = totalMaterialCost + electricityCostValue
    }

    // อัปเดต machineId, electricityCost ถ้ามี
    if (machineId !== undefined) updateObj.machineId = machineId
    if (electricityCost !== undefined) updateObj.electricityCost = electricityCost

    // อัปเดต order
    await orderRef.update(updateObj)

    // Fetch updated order data after update
    const updatedOrderDoc = await orderRef.get()
    const updatedOrderData = updatedOrderDoc.data()

    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrderData,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update order",
    })
  }
})

// DELETE /api/orders/:id - ลบออเดอร์และคืนวัตถุดิบ
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // ดึงข้อมูลออเดอร์ก่อนลบ
    const orderDoc = await db.collection("orders").doc(id).get()

    if (orderDoc.exists) {
      const orderData = orderDoc.data() as Order

      // คืนใบตองตึงถ้ามีการผลิตแล้ว
      if (orderData.remainingQuantity) {
        const quantityMatch = orderData.remainingQuantity.match(/\d+/)
        if (quantityMatch) {
          const producedQuantity = Number.parseInt(quantityMatch[0])
          const materialNeeded = calculateMaterialNeeded(orderData.product, producedQuantity)

          if (materialNeeded > 0) {
            // คืนใบตองตึง
            const materialSnapshot = await db.collection("materials").where("name", "==", "ใบตองตึง").get()

            if (!materialSnapshot.empty) {
              const materialDoc = materialSnapshot.docs[0]
              const currentQuantity = materialDoc.data().quantity
              await materialDoc.ref.update({
                quantity: currentQuantity + materialNeeded,
              })
            }
          }
        }
      }
    }

    // ลบออเดอร์
    await db.collection("orders").doc(id).delete()

    res.json({
      success: true,
      message: "Order deleted successfully and materials returned",
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete order",
    })
  }
})

// POST /api/orders/production - เพิ่มจำนวนการผลิต
router.post("/production", async (req, res) => {
  try {
    const { orderId, productionQuantity, productType } = req.body

    if (!orderId || !productionQuantity || !productType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    const quantityNum = Number.parseInt(productionQuantity) || 0
    const materialNeeded = calculateMaterialNeeded(productType, quantityNum)

    if (materialNeeded === 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่พบสูตรการผลิตสำหรับ ${productType}`,
      })
    }

    // ตรวจสอบและลดจำนวนใบตองตึงในคลัง
    const materialSnapshot = await db.collection("materials").where("name", "==", "ใบตองตึง").get()

    if (materialSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบใบตองตึงในคลัง",
      })
    }

    const materialDoc = materialSnapshot.docs[0]
    const currentQuantity = materialDoc.data().quantity

    if (currentQuantity < materialNeeded) {
      return res.status(400).json({
        success: false,
        message: `ใบตองตึงไม่เพียงพอ ต้องการ ${materialNeeded} ใบ มีอยู่ ${currentQuantity} ใบ`,
      })
    }

    // ลดจำนวนใบตองตึง
    await materialDoc.ref.update({
      quantity: currentQuantity - materialNeeded,
    })

    // ดึงราคาต่อหน่วยจริงจากฐานข้อมูลวัตถุดิบ
    const materialCostPerLeaf = materialDoc.data().pricePerUnit || 1.0
    const totalMaterialCost = materialNeeded * materialCostPerLeaf

    // อัปเดตออเดอร์
    await db
      .collection("orders")
      .doc(orderId)
      .update({
        remainingQuantity: `${productionQuantity} จาน`,
        materialCost: totalMaterialCost,
        totalCost: totalMaterialCost,
      })

    res.json({
      success: true,
      message: `ผลิต ${productType} ${quantityNum} จาน สำเร็จ ใช้ใบตองตึง ${materialNeeded} ใบ`,
    })
  } catch (error) {
    console.error("Error adding production quantity:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add production quantity",
    })
  }
})

function calculateMaterialNeeded(dishType: string, quantity: number): number {
  const materialPerDish = DISH_RECIPES[dishType as keyof typeof DISH_RECIPES] || 0
  return materialPerDish * quantity
}

export default router
