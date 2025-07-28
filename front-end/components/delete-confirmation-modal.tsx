"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ลบ",
  message = "คุณต้องการลบใช่มั้ย?",
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white text-white">
        <DialogHeader className="bg-red-400 text-white p-4">
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="sr-only">ยืนยันการลบรายการ</DialogDescription>
        </DialogHeader>
        <div className="p-8 text-center">
          <h2 className="text-xl font-medium mb-8 text-black">{message}</h2>

          <div className="flex justify-center gap-4">
            <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md">
              ลบ
            </Button>
            <Button onClick={onClose} className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-2 rounded-md">
              ไม่ใช่
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
