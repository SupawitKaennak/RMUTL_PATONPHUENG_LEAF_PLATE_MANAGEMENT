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
import type { Transaction } from "@/types/transaction"

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Transaction) => void
  transaction: Transaction | null
}

export default function EditTransactionModal({ isOpen, onClose, onSave, transaction }: EditTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"รายรับ" | "รายจ่าย">("รายรับ")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("")
  const [id, setId] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  // Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      setId(transaction.id)
      setTransactionType(transaction.isIncome ? "รายรับ" : "รายจ่าย")
      setDate(transaction.date)
      setCategory(transaction.category)
      setDescription(transaction.description)
      setAmount(transaction.amount.toString())
      setQuantity(transaction.quantity || "")
      setNotes(transaction.notes || "")
    }
  }, [transaction])

  useEffect(() => {
    // Check if all required fields are filled
    const isValid = category.trim() !== "" && description.trim() !== "" && Number.parseFloat(amount) > 0

    setIsFormValid(isValid)
  }, [category, description, amount])

  const handleSave = () => {
    if (!transaction) return

    // Create updated transaction object with all required fields
    const updatedTransaction: Transaction = {
      id,
      date: date.trim(),
      description: description.trim(),
      category,
      amount: Number.parseFloat(amount) || 0,
      quantity: quantity.trim(),
      isIncome: transactionType === "รายรับ",
      notes: notes.trim(),
    }

    console.log("Updating transaction:", updatedTransaction)
    onSave(updatedTransaction)
    onClose()
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-black text-white">
        <DialogHeader className="bg-yellow-500 text-white p-4">
          <DialogTitle className="text-center text-xl">แก้ไข</DialogTitle>
          <DialogDescription className="sr-only">ฟอร์มสำหรับแก้ไขรายรับหรือรายจ่าย</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="mb-4">
            <RadioGroup
              value={transactionType}
              onValueChange={(value) => setTransactionType(value as "รายรับ" | "รายจ่าย")}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="รายรับ" id="edit-income" />
                <Label htmlFor="edit-income" className="text-white">
                  รายรับ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="รายจ่าย" id="edit-expense" />
                <Label htmlFor="edit-expense" className="text-white">
                  รายจ่าย
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-date" className="block mb-2 text-white">
              วัน/เดือน/ปี
            </Label>
            <div className="relative">
              <Input
                id="edit-date"
                type="text"
                placeholder="DD/MM/YY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pr-10 bg-black border-white text-white"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" size={20} />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-category" className="block mb-2 text-white">
              ประเภท <span className="text-red-400">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="bg-black border-white text-white">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white">
                <SelectItem value="วัตถุดิบ" className="text-white focus:bg-gray-800 focus:text-white">
                  วัตถุดิบ
                </SelectItem>
                <SelectItem value="ค่าไฟ" className="text-white focus:bg-gray-800 focus:text-white">
                  ค่าไฟ
                </SelectItem>
                <SelectItem value="ขายงาน" className="text-white focus:bg-gray-800 focus:text-white">
                  ขายงาน
                </SelectItem>
                <SelectItem value="ค่าจ้าง" className="text-white focus:bg-gray-800 focus:text-white">
                  ค่าจ้าง
                </SelectItem>
                <SelectItem value="รายการอื่นๆ" className="text-white focus:bg-gray-800 focus:text-white">
                  รายการอื่นๆ
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-description" className="block mb-2 text-white">
              รายละเอียด <span className="text-red-400">*</span>
            </Label>
            <Input
              id="edit-description"
              type="text"
              placeholder="รายละเอียด"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black border-white text-white"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-amount" className="block mb-2 text-white">
              จำนวนเงิน <span className="text-red-400">*</span>
            </Label>
            <Input
              id="edit-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-black border-white text-white"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-quantity" className="block mb-2 text-white">
              จำนวน (ถ้ามี)
            </Label>
            <Input
              id="edit-quantity"
              type="text"
              placeholder="เช่น 10 ใบ, 5 กก."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-black border-white text-white"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="edit-notes" className="block mb-2 text-white">
              หมายเหตุ
            </Label>
            <Textarea
              id="edit-notes"
              placeholder="รายละเอียดเพิ่มเติม"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none bg-black border-white text-white"
            />
          </div>

          {!isFormValid && (
            <p className="text-red-400 text-sm mb-2">* กรุณากรอกข้อมูล ประเภท, รายละเอียด และจำนวนเงิน ให้ครบถ้วน</p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6"
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
