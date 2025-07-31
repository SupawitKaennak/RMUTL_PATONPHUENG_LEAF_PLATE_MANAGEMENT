"use client"

import { useState } from "react"
import { Menu, Download } from "lucide-react"
import Sidebar from "./sidebar"
import { Button } from "@/components/ui/button"


export default function ReportsManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleExportToExcel = () => {
    // In a real application, this would generate and download an Excel file
    console.log("Exporting to Excel")
    alert("กำลังส่งออกข้อมูลเป็นไฟล์ Excel")
  }


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="สรุปรายงาน" onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-500 text-white p-4 flex items-center min-h-[56px]">
          <button
            onClick={toggleSidebar}
            className="block md:hidden p-1 mr- rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Menu className="h- w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">                 
            {/* Export Button */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={handleExportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                บันทึก ส่งออกเป็นไฟล์ excel
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
