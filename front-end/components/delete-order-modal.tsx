"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteOrderModal({ isOpen, onClose, onConfirm }: DeleteOrderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white text-black">
        <DialogHeader className="bg-red-400 text-white p-4">
          <DialogTitle className="text-center text-xl">ลบ</DialogTitle>
          <DialogDescription className="sr-only">ยืนยันการลบออเดอร์</DialogDescription>
        </DialogHeader>
        <div className="p-8 text-center">
          <h2 className="text-xl font-medium mb-8">คุณต้องการลบใช่มั้ย?</h2>

          <div className="flex justify-center gap-4">
            <Button onClick={onConfirm} className="bg-red-400 hover:bg-red-500 text-white px-8 py-2 rounded-md">
              ลบ
            </Button>
            <Button onClick={onClose} className="bg-yellow-300 hover:bg-yellow-400 text-black px-8 py-2 rounded-md">
              ไม่ใช่
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
