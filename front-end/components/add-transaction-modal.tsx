"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: any) => void
}

export default function AddTransactionModal({ isOpen, onClose, onSave }: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"รายรับ" | "รายจ่าย">("รายรับ")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    // Check if all required fields are filled
    const isValid = category.trim() !== "" && description.trim() !== "" && Number.parseFloat(amount) > 0

    setIsFormValid(isValid)
  }, [category, description, amount])

  const getCurrentThaiDate = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, "0")
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const thaiYear = today.getFullYear() + 543 // Convert to Buddhist era
    const shortThaiYear = (thaiYear % 100).toString().padStart(2, "0") // Get last 2 digits
    return `${day}/${month}/${shortThaiYear}`
  }

  const handleSave = () => {
    // Create a new transaction object
    const newTransaction = {
      date: date || getCurrentThaiDate(),
      description: description.trim(),
      category: category,
      amount: Number.parseFloat(amount) || 0,
      quantity: quantity.trim(),
      isIncome: transactionType === "รายรับ",
      notes: notes.trim(),
    }

    onSave(newTransaction)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTransactionType("รายรับ")
    setDate("")
    setCategory("")
    setDescription("")
    setNotes("")
    setAmount("")
    setQuantity("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white text-white">
        <DialogHeader className="bg-teal-500 text-white p-4">
          <DialogTitle className="text-center text-xl">เพิ่ม</DialogTitle>
          <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มรายรับหรือรายจ่ายใหม่</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="mb-4">
            <RadioGroup
              defaultValue={transactionType}
              onValueChange={(value) => setTransactionType(value as "รายรับ" | "รายจ่าย")}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="รายรับ" id="add-income" />
                <Label htmlFor="add-income" className="text-black">
                  รายรับ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="รายจ่าย" id="add-expense" />
                <Label htmlFor="add-expense" className="text-black">
                  รายจ่าย
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="add-date" className="block mb-2 text-black">
              วัน/เดือน/ปี
            </Label>
            <div className="relative">
              <Input
                id="add-date"
                type="text"
                placeholder={getCurrentThaiDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pr-10 bg-white border-gray text-black"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" size={20} />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="add-category" className="block mb-2 text-black">
              ประเภท <span className="text-red-400">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="add-category" className="bg-white border-gray text-black">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent className="bg-white text-white border-gray">
                <SelectItem value="วัตถุดิบ" className="text-black focus:bg-gray-300 focus:text-black">
                  วัตถุดิบ
                </SelectItem>
                <SelectItem value="ค่าไฟ" className="text-black focus:bg-gray-300 focus:text-black">
                  ค่าไฟ
                </SelectItem>
                <SelectItem value="ขายงาน" className="text-black focus:bg-gray-300 focus:text-black">
                  ขายงาน
                </SelectItem>
                <SelectItem value="ค่าจ้าง" className="text-black focus:bg-gray-300 focus:text-black">
                  ค่าจ้าง
                </SelectItem>
                <SelectItem value="รายการอื่นๆ" className="text-black focus:bg-gray-300 focus:text-black">
                  รายการอื่นๆ
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="add-description" className="block mb-2 text-black">
              รายละเอียด <span className="text-red-400">*</span>
            </Label>
            <Input
              id="add-description"
              type="text"
              placeholder="รายละเอียด"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white border-gray text-black"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="add-amount" className="block mb-2 text-black">
              จำนวนเงิน <span className="text-red-400">*</span>
            </Label>
            <Input
              id="add-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white border-gray text-black"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="add-quantity" className="block mb-2 text-black">
              จำนวน (ถ้ามี)
            </Label>
            <Input
              id="add-quantity"
              type="text"
              placeholder="เช่น 10 ใบ, 5 กก."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-white border-gray text-black"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="add-notes" className="block mb-2 text-black">
              หมายเหตุ
            </Label>
            <Textarea
              id="add-notes"
              placeholder="รายละเอียดเพิ่มเติม"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none bg-white border-gray text-black"
            />
          </div>

          {!isFormValid && (
            <p className="text-red-400 text-sm mb-2">* กรุณากรอกข้อมูล ประเภท, รายละเอียด และจำนวนเงิน ให้ครบถ้วน</p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-teal-500 hover:bg-teal-500 text-white px-6"
              disabled={!isFormValid}
            >
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
