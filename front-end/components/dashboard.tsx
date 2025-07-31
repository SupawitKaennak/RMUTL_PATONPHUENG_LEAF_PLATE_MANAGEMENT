"use client"

import { useState, useEffect } from "react"
import { Menu, TrendingUp, TrendingDown, Package, DollarSign, BarChart3, PieChart } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import type { Transaction } from "@/types/transaction"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"
import { Bar, Pie, Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
)

// Sample data for production analytics
const productionData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "จำนวนจานที่ผลิต",
      data: [1200, 1350, 1100, 1400, 1600, 1800, 1700, 1900, 2100, 2000, 2200, 2400],
      backgroundColor: "#3b82f6",
      borderColor: "#2563eb",
      borderWidth: 1,
    },
  ],
}

// Product type distribution
const productTypeData = {
  labels: ["จานสี่เหลี่ยม", "จานวงกลม", "จานหัวใจ"],
  datasets: [
    {
      data: [45, 35, 20],
      backgroundColor: ["#ef4444", "#3b82f6", "#10b981"],
      borderWidth: 2,
      borderColor: "#ffffff",
    },
  ],
}

// Production status trend
const productionStatusData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "กำลังเตรียมการ",
      data: [15, 20, 18, 25, 30, 28, 35, 40, 38, 45, 42, 50],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "กำลังผลิต",
      data: [25, 30, 28, 35, 40, 45, 50, 55, 60, 65, 70, 75],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "ผลิตเสร็จสิ้น",
      data: [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
}

// Financial analytics - Revenue vs Expenses
const financialData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "รายรับ",
      data: [15000, 18000, 16000, 20000, 24000, 28000, 26000, 30000, 34000, 32000, 36000, 40000],
      backgroundColor: "#10b981",
      borderColor: "#059669",
      borderWidth: 1,
    },
    {
      label: "รายจ่าย",
      data: [12000, 14000, 13000, 16000, 18000, 20000, 19000, 22000, 24000, 23000, 26000, 28000],
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
      borderWidth: 1,
    },
  ],
}

// Net profit trend
const netProfitData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "กำไรสุทธิ",
      data: [3000, 4000, 3000, 4000, 6000, 8000, 7000, 8000, 10000, 9000, 10000, 12000],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#10b981",
    },
  ],
}

// Cost structure
const costStructureData = {
  labels: ["วัตถุดิบ", "ค่าไฟ", "ค่าแรง", "อื่นๆ"],
  datasets: [
    {
      data: [40, 25, 20, 15],
      backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"],
      borderWidth: 2,
      borderColor: "#ffffff",
    },
  ],
}

// Selling price vs cost per plate
const priceVsCostData = {
  labels: ["จานสี่เหลี่ยม", "จานวงกลม", "จานหัวใจ"],
  datasets: [
    {
      label: "ราคาขาย",
      data: [500, 500, 500],
      backgroundColor: "#10b981",
      borderColor: "#059669",
      borderWidth: 1,
    },
    {
      label: "ต้นทุนต่อจาน",
      data: [320, 350, 380],
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
      borderWidth: 1,
    },
  ],
}

// Inventory analytics - Leaf usage
const leafUsageData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "การใช้ใบตองตึง (ใบ)",
      data: [4800, 5400, 4400, 5600, 6400, 7200, 6800, 7600, 8400, 8000, 8800, 9600],
      backgroundColor: "#059669",
      borderColor: "#047857",
      borderWidth: 1,
    },
  ],
}

// Stock level trend
const stockLevelData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "ระดับสต็อกใบตองตึง",
      data: [10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: "#f59e0b",
    },
  ],
}

// Material usage distribution
const materialUsageData = {
  labels: ["ใช้ในการผลิต", "คืนจากออเดอร์", "เพิ่มใหม่"],
  datasets: [
    {
      data: [70, 20, 10],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      borderWidth: 2,
      borderColor: "#ffffff",
    },
  ],
}

// Performance analytics - Production efficiency
const efficiencyData = {
  labels: ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"],
  datasets: [
    {
      label: "จำนวนจานต่อสัปดาห์",
      data: [400, 450, 500, 550],
      backgroundColor: "#8b5cf6",
      borderColor: "#7c3aed",
      borderWidth: 1,
    },
  ],
}

// Machine utilization
const machineUtilizationData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "อัตราการใช้เครื่องจักร (%)",
      data: [75, 80, 78, 85, 90, 88, 92, 95, 93, 96, 98, 100],
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: "#8b5cf6",
    },
  ],
}

// Cost per unit
const costPerUnitData = {
  labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  datasets: [
    {
      label: "ต้นทุนการผลิต (บาท)",
      data: [350, 340, 330, 320, 310, 300, 290, 285, 280, 275, 270, 265],
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
      borderWidth: 1,
    },
  ],
}

// Best selling products
const bestSellingData = {
  labels: ["จานสี่เหลี่ยม", "จานวงกลม", "จานหัวใจ"],
  datasets: [
    {
      label: "จำนวนที่ขายได้",
      data: [1200, 900, 600],
      backgroundColor: ["#ef4444", "#3b82f6", "#10b981"],
      borderColor: ["#dc2626", "#2563eb", "#059669"],
      borderWidth: 1,
    },
  ],
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  // Format date as DD/MM/YYYY in Buddhist era (BE)
  const thaiDate = new Date(currentTime)
  const thaiYear = thaiDate.getFullYear() + 543 // Convert to Buddhist era
  const formattedDate = `${thaiDate.getDate().toString().padStart(2, "0")}/${(thaiDate.getMonth() + 1).toString().padStart(2, "0")}/${thaiYear}`

  // Get day of week in Thai
  const daysOfWeekThai = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
  const dayOfWeekThai = daysOfWeekThai[currentTime.getDay()]

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="Dashboard" onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-500 text-white p-4 flex items-center min-h-[56px]">
          <button
            onClick={toggleSidebar}
            className="block md:hidden p-1 mr-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Time and Date Card */}
              <Card className="p-4 bg-blue-50">
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl font-bold mb-2">{formattedTime}</h2>
                  <p className="text-lg mb-1">{formattedDate}</p>
                  <p className="text-xl font-bold text-blue-600">{dayOfWeekThai}</p>
                </div>
              </Card>

              {/* Total Production Card */}
              <Card className="p-4 border border-green-200">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">การผลิตรวม</h3>
                    <p className="text-2xl font-bold text-green-600">24,000 จาน</p>
                    <p className="text-xs text-green-500">+15% จากเดือนที่แล้ว</p>
                  </div>
                </div>
              </Card>

              {/* Total Revenue Card */}
              <Card className="p-4 border border-blue-200">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">รายรับรวม</h3>
                    <p className="text-2xl font-bold text-blue-600">400,000 ฿</p>
                    <p className="text-xs text-blue-500">+12% จากเดือนที่แล้ว</p>
                  </div>
                </div>
              </Card>

              {/* Net Profit Card */}
              <Card className="p-4 border border-purple-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">กำไรสุทธิ</h3>
                    <p className="text-2xl font-bold text-purple-600">120,000 ฿</p>
                    <p className="text-xs text-purple-500">+18% จากเดือนที่แล้ว</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Production Analytics Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                การวิเคราะห์การผลิต (Production Analytics)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">จำนวนการผลิตรายเดือน</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={productionData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สัดส่วนประเภทผลิตภัณฑ์</h3>
                  <div className="h-64">
                    <Pie options={pieOptions} data={productTypeData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สถานะการผลิต</h3>
                  <div className="h-64">
                    <Line options={lineOptions} data={productionStatusData} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Financial Analytics Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                การวิเคราะห์การเงิน (Financial Analytics)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">รายรับ-รายจ่ายรายเดือน</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={financialData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">กำไรสุทธิรายเดือน</h3>
                  <div className="h-64">
                    <Line options={lineOptions} data={netProfitData} />
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สัดส่วนต้นทุน</h3>
                  <div className="h-64">
                    <Pie options={pieOptions} data={costStructureData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ราคาขาย vs ต้นทุนต่อจาน</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={priceVsCostData} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Inventory Analytics Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                การวิเคราะห์คลังวัตถุดิบ (Inventory Analytics)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">การใช้ใบตองตึงรายเดือน</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={leafUsageData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ระดับสต็อกใบตองตึง</h3>
                  <div className="h-64">
                    <Line options={lineOptions} data={stockLevelData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สัดส่วนการใช้งานวัตถุดิบ</h3>
                  <div className="h-64">
                    <Pie options={pieOptions} data={materialUsageData} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Performance Analytics Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                การวิเคราะห์ประสิทธิภาพ (Performance Analytics)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ประสิทธิภาพการผลิต</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={efficiencyData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">อัตราการใช้เครื่องจักร</h3>
                  <div className="h-64">
                    <Line options={lineOptions} data={machineUtilizationData} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ต้นทุนการผลิต</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={costPerUnitData} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Summary Analytics Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                การวิเคราะห์สรุป (Summary Analytics)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ผลิตภัณฑ์ที่ขายดี</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={bestSellingData} />
                  </div>
                </Card>               
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สรุปภาพรวม</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">การผลิตรวม</span>
                      <span className="text-green-600 font-bold">24,000 จาน</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">รายรับรวม</span>
                      <span className="text-blue-600 font-bold">400,000 ฿</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">กำไรสุทธิ</span>
                      <span className="text-purple-600 font-bold">120,000 ฿</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">สต็อกคงเหลือ</span>
                      <span className="text-orange-600 font-bold">4,500 ใบ</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
