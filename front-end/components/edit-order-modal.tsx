"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Order } from "@/types/order"
import { updateProductionQuantity, calculateMaterialNeeded } from "@/services/order-service"

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (order: Order) => void
  order: Order | null
}

export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
  const [date, setDate] = useState("")
  const [product, setProduct] = useState("")
  const [orderedQuantity, setOrderedQuantity] = useState("")
  const [productionQuantity, setProductionQuantity] = useState("")
  const [originalProductionQuantity, setOriginalProductionQuantity] = useState("")
  const [electricityCost, setElectricityCost] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [materialCost, setMaterialCost] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Populate form when order changes
  useEffect(() => {
    if (order) {
      setDate(order.date)
      setProduct(order.product)
      setOrderedQuantity(order.orderedQuantity.replace(" จาน", ""))

      const prodQuantity = order.remainingQuantity ? order.remainingQuantity.replace(" จาน", "") : ""
      setProductionQuantity(prodQuantity)
      setOriginalProductionQuantity(prodQuantity)

      setElectricityCost(order.electricityCost)
      setMaterialCost(order.materialCost)
      setTotalCost(order.totalCost)
    }
  }, [order])

  // Recalculate material cost when production quantity changes
  useEffect(() => {
    if (order && productionQuantity !== originalProductionQuantity) {
      const newQuantityNum = Number.parseInt(productionQuantity) || 0
      const materialNeeded = calculateMaterialNeeded(order.product, newQuantityNum)
      const materialCostPerLeaf = 1.0
      const newMaterialCost = materialNeeded * materialCostPerLeaf

      setMaterialCost(newMaterialCost)
      setTotalCost(newMaterialCost + electricityCost)
    }
  }, [productionQuantity, originalProductionQuantity, order, electricityCost])

  const handleSave = async () => {
    if (!order) return

    setIsUpdating(true)

    try {
      // ถ้าจำนวนการผลิตเปลี่ยนแปลง ให้อัปเดตวัตถุดิบ
      if (productionQuantity !== originalProductionQuantity) {
        const result = await updateProductionQuantity(
          order.id,
          Number.parseInt(productionQuantity),
        )

        if (!result.success) {
          alert(result.message || "ไม่สามารถอัปเดตจำนวนการผลิตได้")
          setIsUpdating(false)
          return
        }

        // Update materialCost and totalCost from backend response if available
        if (result.data) {
          setMaterialCost(result.data.materialCost || 0)
          setTotalCost(result.data.totalCost || 0)
          setOriginalProductionQuantity(productionQuantity) // Update originalProductionQuantity to prevent incorrect recalculation
        }
      }

      // Create updated order object
      const updatedOrder: Order = {
        ...order,
        date,
        product,
        orderedQuantity: `${orderedQuantity} จาน`,
        remainingQuantity: productionQuantity ? `${productionQuantity} จาน` : "",
        materialCost,
        totalCost,
      }

      onSave(updatedOrder)
      onClose()
    } catch (error) {
      console.error("Error updating order:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-yellow-300 text-black p-4">
          <DialogTitle className="text-center text-xl">แก้ไข</DialogTitle>
          <DialogDescription className="sr-only">แก้ไขข้อมูลออเดอร์</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-lot" className="block mb-2 text-sm">
                  LOT
                </Label>
                <Input id="edit-lot" type="text" value={order.lot} disabled className="bg-gray-100" />
              </div>

              <div>
                <Label htmlFor="edit-date" className="block mb-2 text-sm">
                  ว/ด/ป
                </Label>
                <div className="relative">
                  <Input
                    id="edit-date"
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-product" className="block mb-2 text-sm">
                  ผลิตภัณฑ์
                </Label>
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger id="edit-product">
                    <SelectValue placeholder="เลือกผลิตภัณฑ์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="จานสี่เหลี่ยม">จานสี่เหลี่ยม</SelectItem>
                    <SelectItem value="จานวงกลม">จานวงกลม</SelectItem>
                    <SelectItem value="จานหัวใจ">จานหัวใจ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-ordered-quantity" className="block mb-2 text-sm">
                  จำนวนที่สั่ง
                </Label>
                <div className="flex items-center">
                  <Input
                    id="edit-ordered-quantity"
                    type="text"
                    value={orderedQuantity}
                    onChange={(e) => setOrderedQuantity(e.target.value)}
                    className="flex-1"
                  />
                  <span className="ml-2 text-sm">จาน</span>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-production-quantity" className="block mb-2 text-sm">
                  จำนวนที่ผลิต
                </Label>
                <div className="flex items-center">
                  <Input
                    id="edit-production-quantity"
                    type="text"
                    value={productionQuantity}
                    onChange={(e) => setProductionQuantity(e.target.value)}
                    className="flex-1"
                  />
                  <span className="ml-2 text-sm">จาน</span>
                </div>
                {productionQuantity !== originalProductionQuantity && (
                  <p className="text-xs text-blue-500 mt-1">* ระบบจะคืนใบตองตึงเดิมและหักใหม่ตามจำนวนที่แก้ไข</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-qc-quantity" className="block mb-2 text-sm">
                  จำนวนQC
                </Label>
                <Input
                  id="edit-qc-quantity"
                  type="text"
                  value={order.qcQuantity}
                  disabled
                  className="bg-gray-100"
                  placeholder="กรอกจำนวนใบตองตึงที่ผ่านจาก CNN"
                />
              </div>

              <div>
                <Label htmlFor="edit-electricity-cost" className="block mb-2 text-sm">
                  ค่าไฟการผลิต
                </Label>
                <Input
                  id="edit-electricity-cost"
                  type="text"
                  value={electricityCost.toFixed(6) + " บาท"}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-material-cost" className="block mb-2 text-sm">
                  ต้นทุนวัตถุดิบ
                </Label>
                <Input
                  id="edit-material-cost"
                  type="text"
                  value={materialCost.toFixed(2) + " บาท"}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-total-cost" className="block mb-2 text-sm">
                  ต้นทุนรวม
                </Label>
                <Input
                  id="edit-total-cost"
                  type="text"
                  value={totalCost.toFixed(2) + " บาท"}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="edit-selling-price" className="block mb-2 text-sm">
                  ราคาขาย
                </Label>
                <Input
                  id="edit-selling-price"
                  type="text"
                  value={order.sellingPrice.toFixed(2) + " บาท"}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-2"
              disabled={isUpdating}
            >
              ย้อนกลับ
            </Button>
            <Button
              onClick={handleSave}
              className="bg-yellow-300 hover:bg-yellow-400 text-black px-8 py-2"
              disabled={isUpdating}
            >
              {isUpdating ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
