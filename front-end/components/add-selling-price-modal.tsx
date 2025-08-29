"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Order } from "@/types/order"

interface AddSellingPriceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (order: Order) => void
  order: Order | null
}

export default function AddSellingPriceModal({ isOpen, onClose, onSave, order }: AddSellingPriceModalProps) {
  const [sellingPrice, setSellingPrice] = useState("")

  useEffect(() => {
    if (order) {
      setSellingPrice(order.sellingPrice > 0 ? order.sellingPrice.toString() : "")
    }
  }, [order])

  const handleSave = () => {
    if (!order) return
    const priceNum = parseFloat(sellingPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      alert("กรุณาระบุราคาขายที่ถูกต้อง")
      return
    }
    const updatedOrder: Order = {
      ...order,
      sellingPrice: priceNum,
    }
    onSave(updatedOrder)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-teal-400 text-white p-4">
          <DialogTitle className="text-center text-xl">เพิ่มราคาขาย</DialogTitle>
          <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มราคาขาย</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div>
            <Label htmlFor="selling-price" className="block mb-2">
              ราคาขาย
            </Label>
            <Input
              id="selling-price"
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="ระบุราคาขาย"
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-500 text-black px-6">
              ยกเลิก
            </Button>
            <Button onClick={handleSave} className="bg-teal-400 hover:bg-teal-500 text-white px-6">
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
