"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
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

// Sample data for the charts
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

// Mini line chart data
const miniLineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [65, 59, 80, 81, 56, 55],
      borderColor: "#10b981",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    },
  ],
}

const miniExpenseLineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [40, 45, 42, 41, 40, 43],
      borderColor: "#ef4444",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    },
  ],
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])

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

  // Pie chart data
  const pieData = {
    labels: ["กำไร", "ขาดทุน"],
    datasets: [
      {
        data: [75, 25],
        backgroundColor: ["#4ade80", "#f87171"],
        borderWidth: 0,
      },
    ],
  }

  // Pie chart options
  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "0%",
    responsive: true,
    maintainAspectRatio: true,
  }

  // Mini line chart options
  const miniLineOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  }

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="Dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-500 text-white p-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 mr-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Time and Date Card */}
              <Card className="p-6 bg-blue-50">
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-5xl font-bold mb-4">{formattedTime}</h2>
                  <p className="text-2xl mb-2">{formattedDate}</p>
                  <p className="text-4xl font-bold">{dayOfWeekThai}</p>
                </div>
              </Card>

              {/* Total Income Card */}
              <Card className="p-6 border border-green-200">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold">รายรับรวม</h3>
                    <div className="h-10 w-24">
                      <Line data={miniLineData} options={miniLineOptions} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-500 mb-2">10,000 ฿</p>
                  <p className="text-sm text-gray-600">
                    เดือนที่ผ่านมา <span className="text-green-500">+10%</span>
                  </p>
                </div>
              </Card>

              {/* Total Expense Card */}
              <Card className="p-6 border border-red-200">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold">รายจ่ายรวม</h3>
                    <div className="h-10 w-24">
                      <Line data={miniExpenseLineData} options={miniLineOptions} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-500 mb-2">5,000 ฿</p>
                  <p className="text-sm text-gray-600">
                    เดือนที่ผ่านมา <span className="text-red-500">-3%</span>
                  </p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Profit/Loss Pie Chart */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">กำไร</h3>
                <div className="flex items-center">
                  <div className="w-48 h-48 mx-auto">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-green-400 mr-2"></div>
                      <span>กำไร</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-400 mr-2"></div>
                      <span>ขาดทุน</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Monthly Comparison Chart */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">กราฟเปรียบเทียบรายรับ-รายจ่าย</h3>
                <div className="h-64">
                  <Bar options={barOptions} data={monthlyData} />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
