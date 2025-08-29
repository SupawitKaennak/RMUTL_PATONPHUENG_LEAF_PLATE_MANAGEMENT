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
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Validate material name
    if (!materialName.trim()) {
      newErrors.materialName = "กรุณาเลือกชื่อวัตถุดิบ"
    }

    // Validate unit
    if (!unit) {
      newErrors.unit = "กรุณาเลือกหน่วย"
    }

    // Validate quantity
    if (!quantity.trim()) {
      newErrors.quantity = "กรุณาระบุปริมาณ"
    } else if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = "กรุณาระบุปริมาณเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0"
    }

    // Validate price per unit
    if (!pricePerUnit.trim()) {
      newErrors.pricePerUnit = "กรุณาระบุราคาต่อหน่วย"
    } else if (isNaN(Number(pricePerUnit)) || Number(pricePerUnit) < 0) {
      newErrors.pricePerUnit = "กรุณาระบุราคาต่อหน่วยเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

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
      name: materialName.trim(),
      quantity: Number(quantity),
      unit: unit,
      pricePerUnit: Number(pricePerUnit),
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
    setErrors({})
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value)
      if (errors.quantity) {
        setErrors(prev => ({ ...prev, quantity: "" }))
      }
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers, decimal point, and empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPricePerUnit(value)
      if (errors.pricePerUnit) {
        setErrors(prev => ({ ...prev, pricePerUnit: "" }))
      }
    }
  }

  const handleNameChange = (value: string) => {
    setMaterialName(value)
    if (errors.materialName) {
      setErrors(prev => ({ ...prev, materialName: "" }))
    }
  }

  const handleUnitChange = (value: string) => {
    setUnit(value)
    if (errors.unit) {
      setErrors(prev => ({ ...prev, unit: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg bg-white text-black">
        <DialogHeader className="bg-teal-400 text-white p-4">
          <DialogTitle className="text-center text-xl">เพิ่ม</DialogTitle>
          <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มวัตถุดิบใหม่</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="material-name" className="block mb-2">
              ชื่อวัตถุดิบ <span className="text-red-500">*</span>
            </Label>
            <Select value={materialName} onValueChange={handleNameChange}>
              <SelectTrigger id="material-name" className={`bg-white border-gray text-black ${errors.materialName ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="เลือกชื่อวัตถุดิบ" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray">
                <SelectItem value="ใบตองตึง" className="text-black focus:bg-gray-300 focus:text-black">
                  ใบตองตึง
                </SelectItem>
                <SelectItem value="แป้งข้าวเหนียว" className="text-black focus:bg-gray-300 focus:text-black">
                  แป้งข้าวเหนียว
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.materialName && (
              <p className="text-red-500 text-sm mt-1">{errors.materialName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="material-unit" className="block mb-2">
              หน่วย <span className="text-red-500">*</span>
            </Label>
            <Select value={unit} onValueChange={handleUnitChange}>
              <SelectTrigger id="material-unit" className={`bg-white border-gray text-black ${errors.unit ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="เลือกหน่วย" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray">
                <SelectItem value="ใบ" className="text-black focus:bg-gray-300 focus:text-black">
                  ใบ
                </SelectItem>
                <SelectItem value="กรัม" className="text-black focus:bg-gray-300 focus:text-black">
                  กรัม
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
          </div>

          <div>
            <Label htmlFor="material-quantity" className="block mb-2">
              ปริมาณ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="material-quantity"
              type="text"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="0"
              className={`bg-white border-gray text-black ${errors.quantity ? 'border-red-500' : ''}`}
              required
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price-per-unit" className="block mb-2">
              ราคาต่อหน่วย <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price-per-unit"
              type="text"
              value={pricePerUnit}
              onChange={handlePriceChange}
              placeholder="0.00"
              className={`bg-white border-gray text-black ${errors.pricePerUnit ? 'border-red-500' : ''}`}
              required
            />
            {errors.pricePerUnit && (
              <p className="text-red-500 text-sm mt-1">{errors.pricePerUnit}</p>
            )}
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
