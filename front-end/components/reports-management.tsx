"use client"

import { useState } from "react"
import { Menu, Download } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler)

// Sample data for the bar chart
const monthlyData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "รายรับ",
      data: [150, 220, 260, 110, 410, 250, 230, 100, 140, 270, 220, 190],
      backgroundColor: "#3b82f6",
    },
    {
      label: "รายจ่าย",
      data: [120, 240, 110, 160, 350, 230, 180, 160, 70, 150, 240, 110],
      backgroundColor: "#cbd5e1",
    },
  ],
}

// Sample data for the line chart
const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "ค่าไฟ",
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 40, 50, 60],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    },
    {
      label: "ต้นทุน",
      data: [45, 55, 65, 59, 80, 81, 56, 55, 40, 60, 70, 80],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    },
    {
      label: "วัตถุดิบ",
      data: [20, 30, 40, 35, 25, 30, 20, 40, 35, 30, 25, 40],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    },
    {
      label: "ยอดขาย",
      data: [60, 70, 80, 90, 100, 85, 75, 65, 70, 80, 90, 95],
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    },
  ],
}

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

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "กราฟเปรียบเทียบรายรับ-รายจ่าย",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Line chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "กราฟแสดง ค่าไฟ ต้นทุน วัตถุดิบ และ ยอดขาย",
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    hover: {
      mode: "nearest" as const,
      intersect: true,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
            {/* Bar Chart */}
            <Card className="p-6 mb-8">
              <div className="h-80">
                <Bar options={barOptions} data={monthlyData} />
              </div>
            </Card>

            {/* Line Chart */}
            <Card className="p-6 mb-8">
              <div className="h-80">
                <Line options={lineOptions} data={lineChartData} />
              </div>
            </Card>

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
