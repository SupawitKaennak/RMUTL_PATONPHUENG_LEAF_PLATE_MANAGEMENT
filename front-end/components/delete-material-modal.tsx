"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteMaterialModal({ isOpen, onClose, onConfirm }: DeleteMaterialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white text-white">
        <DialogHeader className="bg-red-400 text-whtie p-4">
          <DialogTitle className="text-center text-xl">ลบ</DialogTitle>
          <DialogDescription className="sr-only">ยืนยันการลบวัตถุดิบ</DialogDescription>
        </DialogHeader>
        <div className="p-8 text-center">
          <h2 className="text-xl font-medium mb-8 text-black">คุณต้องการลบใช่มั้ย?</h2>

          <div className="flex justify-center gap-4">
            <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md">
              ลบ
            </Button>
            <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-500 text-black px-8 py-2 rounded-md">
              ไม่ใช่
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
