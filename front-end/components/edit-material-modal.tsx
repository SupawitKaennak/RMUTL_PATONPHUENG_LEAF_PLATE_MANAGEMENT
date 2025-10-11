'use client'

import { useState, useEffect } from "react"
import type { Material } from "@/types/material"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface EditMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (material: Material) => void
  material: Material | null
}

export default function EditMaterialModal({
  isOpen,
  onClose,
  onSave,
  material,
}: EditMaterialModalProps) {
  const [quantity, setQuantity] = useState(0)
  const [pricePerUnit, setPricePerUnit] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (material) {
      setQuantity(material.quantity)
      setPricePerUnit(material.pricePerUnit || 0)
    }
  }, [material])

  const handleSave = async () => {
    if (material) {
      setIsSaving(true)
      try {
        await onSave({
          ...material,
          quantity,
          pricePerUnit,
        })
      } finally {
        setIsSaving(false)
        onClose() // Close modal after saving
      }
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-yellow-300 text-black p-4">
          <DialogTitle className="text-center text-xl">แก้ไขวัตถุดิบ</DialogTitle>
          <DialogDescription className="sr-only">
            แก้ไขจำนวนและราคาของวัตถุดิบ
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="material-name" className="block mb-2 text-sm">
              ชื่อวัตถุดิบ
            </Label>
            <Input
              id="material-name"
              type="text"
              value={material?.name || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="quantity" className="block mb-2 text-sm">
              จำนวน
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1"
              placeholder="ระบุจำนวน"
            />
          </div>
          <div>
            <Label htmlFor="pricePerUnit" className="block mb-2 text-sm">
              ราคาต่อหน่วย
            </Label>
            <Input
              id="pricePerUnit"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              className="mt-1"
              placeholder="ระบุราคา"
            />
          </div>
        </div>
        <div className="flex justify-between p-6 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-2"
            disabled={isSaving}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            className="bg-yellow-300 hover:bg-yellow-400 text-black px-8 py-2"
            disabled={isSaving}
          >
            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
