"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (material: any) => void
}

export default function AddMaterialModal({ isOpen, onClose, onSave }: AddMaterialModalProps) {
  const [materialName, setMaterialName] = useState("")
  const [unit, setUnit] = useState("")
  const [quantity, setQuantity] = useState("")
  const [pricePerUnit, setPricePerUnit] = useState("")

  const handleSave = () => {
    // Get current date in Thai Buddhist Era format (DD/MM/YY)
    const today = new Date()
    const day = today.getDate().toString().padStart(2, "0")
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const thaiYear = today.getFullYear() + 543 // Convert to Buddhist era
    const shortThaiYear = (thaiYear % 100).toString().padStart(2, "0") // Get last 2 digits
    const currentDate = `${day}/${month}/${shortThaiYear}`

    // Create a new material object
    const newMaterial = {
      date: currentDate,
      name: materialName,
      quantity: Number.parseInt(quantity) || 0,
      unit: unit,
      pricePerUnit: Number.parseFloat(pricePerUnit) || 0,
    }

    onSave(newMaterial)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setMaterialName("")
    setUnit("")
    setQuantity("")
    setPricePerUnit("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg bg-black text-white">
        <DialogHeader className="bg-teal-400 text-white p-4">
          <DialogTitle className="text-center text-xl">เพิ่ม</DialogTitle>
          <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มวัตถุดิบใหม่</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="material-name" className="block mb-2">
              ชื่อวัตถุดิบ
            </Label>
            <Input
              id="material-name"
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="ระบุชื่อวัตถุดิบ"
              className="bg-black border-white text-white"
            />
          </div>

          <div>
            <Label htmlFor="material-unit" className="block mb-2">
              หน่วย
            </Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="material-unit" className="bg-black border-white text-white">
                <SelectValue placeholder="เลือกหน่วย" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white">
                <SelectItem value="ใบ" className="text-white focus:bg-gray-800 focus:text-white">
                  ใบ
                </SelectItem>
                <SelectItem value="ถุง" className="text-white focus:bg-gray-800 focus:text-white">
                  ถุง
                </SelectItem>
                <SelectItem value="อัน" className="text-white focus:bg-gray-800 focus:text-white">
                  อัน
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="material-quantity" className="block mb-2">
              ปริมาณ
            </Label>
            <Input
              id="material-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="bg-black border-white text-white"
            />
          </div>

          <div>
            <Label htmlFor="price-per-unit" className="block mb-2">
              ราคาต่อหน่วย
            </Label>
            <Input
              id="price-per-unit"
              type="number"
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              placeholder="0.00"
              className="bg-black border-white text-white"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-teal-400 hover:bg-teal-500 text-white px-6">
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
