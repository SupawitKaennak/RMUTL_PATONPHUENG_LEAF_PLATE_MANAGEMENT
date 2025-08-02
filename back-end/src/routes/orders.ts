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

// กำหนดสูตรการผลิต - ใช้ร่วมกันกับ front-end
const DISH_RECIPES = {
  จานสี่เหลี่ยม: { ใบตองตึง: 4, แป้งข้าวเหนียว: 2 },
  จานวงกลม: { ใบตองตึง: 4, แป้งข้าวเหนียว: 2 },
  จานหัวใจ: { ใบตองตึง: 5, แป้งข้าวเหนียว: 2 },
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
      const materialsNeeded = calculateMaterialNeeded(productType, diff)

      let totalMaterialCost = 0

      // จัดการวัตถุดิบแต่ละชนิด
      for (const [materialName, materialAmount] of Object.entries(materialsNeeded)) {
        const materialSnapshot = await db.collection("materials").where("name", "==", materialName).get()
        
        if (!materialSnapshot.empty) {
          const materialDoc = materialSnapshot.docs[0]
          const currentQuantity = materialDoc.data().quantity
          const materialPrice = materialDoc.data().pricePerUnit || 0

          if (newQty < oldQty) {
            // คืนวัตถุดิบ
            await materialDoc.ref.update({
              quantity: currentQuantity + materialAmount,
            })
            
            // เพิ่มประวัติการคืนวัตถุดิบ
            await db.collection("materialHistory").add({
              action: "คืนวัตถุดิบ",
              date: new Date().toLocaleDateString("th-TH", {
                day: "2-digit",
                month: "2-digit", 
                year: "2-digit",
              }),
              name: materialName,
              quantity: materialAmount,
              unit: materialDoc.data().unit || "ชิ้น",
            })
          } else if (newQty > oldQty) {
            // ใช้วัตถุดิบเพิ่ม
            if (currentQuantity < materialAmount) {
              return res.status(400).json({
                success: false,
                error: `${materialName}ไม่เพียงพอ ต้องการเพิ่มอีก ${materialAmount} ${materialDoc.data().unit || "ชิ้น"} แต่มีอยู่ ${currentQuantity} ${materialDoc.data().unit || "ชิ้น"}`,
              })
            }
            await materialDoc.ref.update({
              quantity: currentQuantity - materialAmount,
            })
            
            // เพิ่มประวัติการใช้วัตถุดิบ
            await db.collection("materialHistory").add({
              action: "นำไปใช้",
              date: new Date().toLocaleDateString("th-TH", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit", 
              }),
              name: materialName,
              quantity: materialAmount,
              unit: materialDoc.data().unit || "ชิ้น",
            })
          }

          // คำนวณต้นทุนวัตถุดิบ
          totalMaterialCost += materialAmount * materialPrice
        }
      }

      // คำนวณต้นทุนวัตถุดิบทั้งหมดสำหรับจำนวนใหม่
      const totalMaterialsNeeded = calculateMaterialNeeded(productType, newQty)
      let totalMaterialCostForNewQty = 0
      
      for (const [materialName, materialAmount] of Object.entries(totalMaterialsNeeded)) {
        const materialSnapshot = await db.collection("materials").where("name", "==", materialName).get()
        if (!materialSnapshot.empty) {
          const materialDoc = materialSnapshot.docs[0]
          const materialPrice = materialDoc.data().pricePerUnit || 0
          totalMaterialCostForNewQty += materialAmount * materialPrice
        }
      }

      updateObj.remainingQuantity = remainingQuantity
      updateObj.materialCost = totalMaterialCostForNewQty
      // Calculate totalCost as sum of materialCost and electricityCost
      const electricityCostValue = electricityCost !== undefined ? electricityCost : oldOrder?.electricityCost || 0
      updateObj.totalCost = totalMaterialCostForNewQty + electricityCostValue
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

      // คืนวัตถุดิบถ้ามีการผลิตแล้ว
      if (orderData.remainingQuantity) {
        const quantityMatch = orderData.remainingQuantity.match(/\d+/)
        if (quantityMatch) {
          const producedQuantity = Number.parseInt(quantityMatch[0])
          const materialsNeeded = calculateMaterialNeeded(orderData.product, producedQuantity)

          // คืนวัตถุดิบแต่ละชนิด
          for (const [materialName, materialAmount] of Object.entries(materialsNeeded)) {
            const materialSnapshot = await db.collection("materials").where("name", "==", materialName).get()

            if (!materialSnapshot.empty) {
              const materialDoc = materialSnapshot.docs[0]
              const currentQuantity = materialDoc.data().quantity
              await materialDoc.ref.update({
                quantity: currentQuantity + materialAmount,
              })
              
              // เพิ่มประวัติการคืนวัตถุดิบ
              await db.collection("materialHistory").add({
                action: "คืนวัตถุดิบ",
                date: new Date().toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                }),
                name: materialName,
                quantity: materialAmount,
                unit: materialDoc.data().unit || "ชิ้น",
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
      message: "ออเดอร์ถูกลบออกและวัตถุดิบถูกคืนคลัง",
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
    const materialsNeeded = calculateMaterialNeeded(productType, quantityNum)

    if (Object.keys(materialsNeeded).length === 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่พบสูตรการผลิตสำหรับ ${productType}`,
      })
    }

    let totalMaterialCost = 0
    const materialDetails: string[] = []

    // ตรวจสอบและลดจำนวนวัตถุดิบแต่ละชนิดในคลัง
    for (const [materialName, materialAmount] of Object.entries(materialsNeeded)) {
      const materialSnapshot = await db.collection("materials").where("name", "==", materialName).get()

      if (materialSnapshot.empty) {
        return res.status(400).json({
          success: false,
          message: `ไม่พบ${materialName}ในคลัง`,
        })
      }

      const materialDoc = materialSnapshot.docs[0]
      const currentQuantity = materialDoc.data().quantity
      const materialUnit = materialDoc.data().unit || "ชิ้น"

      if (currentQuantity < materialAmount) {
        return res.status(400).json({
          success: false,
          message: `${materialName}ไม่เพียงพอ ต้องการ ${materialAmount} ${materialUnit} มีอยู่ ${currentQuantity} ${materialUnit}`,
        })
      }

      // ลดจำนวนวัตถุดิบ
      await materialDoc.ref.update({
        quantity: currentQuantity - materialAmount,
      })

      // เพิ่มประวัติการใช้วัตถุดิบ
      await db.collection("materialHistory").add({
        action: "นำไปใช้",
        date: new Date().toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
        name: materialName,
        quantity: materialAmount,
        unit: materialUnit,
      })

      // คำนวณต้นทุนวัตถุดิบ
      const materialPrice = materialDoc.data().pricePerUnit || 0
      totalMaterialCost += materialAmount * materialPrice
      materialDetails.push(`${materialName} ${materialAmount} ${materialUnit}`)
    }

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
      message: `ผลิต ${productType} ${quantityNum} จาน สำเร็จ ใช้วัตถุดิบ: ${materialDetails.join(", ")}`,
    })
  } catch (error) {
    console.error("Error adding production quantity:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add production quantity",
    })
  }
})

// ฟังก์ชันคำนวณวัตถุดิบที่ต้องการ - ใช้ร่วมกันกับ front-end
function calculateMaterialNeeded(dishType: string, quantity: number): { [material: string]: number } {
  const recipe = DISH_RECIPES[dishType as keyof typeof DISH_RECIPES]
  if (!recipe) return {}
  
  const result: { [material: string]: number } = {}
  for (const [material, amount] of Object.entries(recipe)) {
    result[material] = amount * quantity
  }
  return result
}

export default router
