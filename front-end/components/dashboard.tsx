"use client"

import { useState, useEffect } from "react"
import { Menu, TrendingUp, TrendingDown, Package, DollarSign, BarChart3, PieChart } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import type { Transaction } from "@/types/transaction"
import type { Order } from "@/types/order"
import type { Material } from "@/types/material"
import { getTransactions } from "@/services/transaction-service"
import { getOrders } from "@/services/order-service"
import { getMaterials } from "@/services/material-service"
import { getMaterialHistory } from "@/services/material-history-service"
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

// Utility function to parse Thai date format (DD/MM/YY)
const parseThaiDate = (dateString: string): Date => {
  try {
    // Handle different date formats
    if (dateString.includes('/')) {
      // Thai format: DD/MM/YY
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // Month is 0-indexed
        let year = parseInt(parts[2])
        
        // Handle 2-digit year (BE)
        if (year < 100) {
          year = year + 2500 // Convert 2-digit BE to 4-digit BE
        }
        
        // Convert BE to CE
        const ceYear = year - 543
        
        return new Date(ceYear, month, day)
      }
    } else if (dateString.includes('-')) {
      // ISO format: YYYY-MM-DD
      return new Date(dateString)
    }
    
    // Fallback to standard Date parsing
    return new Date(dateString)
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return new Date() // Return current date as fallback
  }
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialHistory, setMaterialHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543) // Default to current BE year

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [transactionsData, ordersData, materialsData] = await Promise.all([
          getTransactions(),
          getOrders(),
          getMaterials(),
        ])
        const materialHistoryData = await getMaterialHistory()
        
        console.log('Loaded data:', {
          transactions: transactionsData.length,
          orders: ordersData.length,
          materials: materialsData.length,
          materialHistory: materialHistoryData.length
        })
        
        setTransactions(transactionsData)
        setOrders(ordersData)
        setMaterials(materialsData)
        setMaterialHistory(materialHistoryData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Only run once on mount

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Generate year options for selector (5 years back from current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear() + 543 // Current BE year
    const years = []
    for (let i = currentYear; i >= currentYear - 4; i--) {
      years.push(i)
    }
    return years
  }

  // Filter data by selected year
  const filterDataByYear = (data: any[], dateField: string) => {
    if (data.length === 0) return []
    
    const filtered = data.filter(item => {
      if (!item[dateField]) {
        return false
      }
      
      const date = parseThaiDate(item[dateField])
      const itemYear = date.getFullYear() + 543 // Convert to BE
      return itemYear === selectedYear
    })
    
    return filtered
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

  // Calculate real data from transactions
  const filteredTransactions = filterDataByYear(transactions, 'date')
  const filteredOrders = filterDataByYear(orders, 'date')
  
  const totalIncome = filteredTransactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  // Calculate total production from orders
  const totalProduction = filteredOrders.reduce((sum, order) => {
    const orderedQty = parseInt(order.orderedQuantity.replace(/[^\d]/g, '')) || 0
    return sum + orderedQty
  }, 0)

  // Calculate current stock from materials
  const currentStock = materials.reduce((sum, material) => {
    if (material.name.toLowerCase().includes('ใบตองตึง')) {
      return sum + material.quantity
    }
    return sum
  }, 0)

  // Prepare chart data from real data
  const prepareFinancialData = () => {
    const monthlyData = new Array(12).fill(0).map(() => ({ income: 0, expenses: 0 }))
    
    filteredTransactions.forEach(transaction => {
      const date = parseThaiDate(transaction.date)
      const month = date.getMonth()
      if (transaction.isIncome) {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += transaction.amount
      }
    })

    return {
      labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      datasets: [
        {
          label: "รายรับ",
          data: monthlyData.map(d => d.income),
          backgroundColor: "#10b981",
          borderColor: "#059669",
          borderWidth: 1,
        },
        {
          label: "รายจ่าย",
          data: monthlyData.map(d => d.expenses),
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          borderWidth: 1,
        },
      ],
    }
  }

  const prepareProductionData = () => {
    const monthlyData = new Array(12).fill(0)
    
    filteredOrders.forEach(order => {
      const date = parseThaiDate(order.date)
      const month = date.getMonth()
      const qty = parseInt(order.orderedQuantity.replace(/[^\d]/g, '')) || 0
      monthlyData[month] += qty
    })

    return {
      labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      datasets: [
        {
          label: "จำนวนจานที่ผลิต",
          data: monthlyData,
          backgroundColor: "#3b82f6",
          borderColor: "#2563eb",
          borderWidth: 1,
        },
      ],
    }
  }

  const prepareProductTypeData = () => {
    const productTypes: { [key: string]: number } = {}
    
    filteredOrders.forEach(order => {
      const product = order.product
      const qty = parseInt(order.orderedQuantity.replace(/[^\d]/g, '')) || 0
      productTypes[product] = (productTypes[product] || 0) + qty
    })

    const labels = Object.keys(productTypes)
    const data = Object.values(productTypes)
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }
  }

  const prepareMaterialUsageData = () => {
    const usageTypes = {
      "ใช้ในการผลิต": 0,
      "เพิ่มใหม่": 0,
      "คืนจากออเดอร์": 0,
    }

    // Calculate real usage from material history
    materialHistory.forEach(history => {
      if (history.name.toLowerCase().includes('ใบตองตึง')) {
        switch (history.action) {
          case "นำไปใช้":
            usageTypes["ใช้ในการผลิต"] += history.quantity
            break
          case "เพิ่ม":
            usageTypes["เพิ่มใหม่"] += history.quantity
            break
          case "คืนวัตถุดิบ":
            usageTypes["คืนจากออเดอร์"] += history.quantity
            break
        }
      }
    })

    // If no history data, fallback to current stock
    if (usageTypes["เพิ่มใหม่"] === 0) {
      materials.forEach(material => {
        if (material.name.toLowerCase().includes('ใบตองตึง')) {
          usageTypes["เพิ่มใหม่"] += material.quantity
        }
      })
    }

    // If still no usage data, estimate from production
    if (usageTypes["ใช้ในการผลิต"] === 0) {
      usageTypes["ใช้ในการผลิต"] = totalProduction * 4 // Assume 4 leaves per plate
    }

    return {
      labels: Object.keys(usageTypes),
      datasets: [
        {
          data: Object.values(usageTypes),
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }
  }

  const prepareElectricityCostData = () => {
    const monthlyData = new Array(12).fill(0)
    
    filteredOrders.forEach(order => {
      const date = parseThaiDate(order.date)
      const month = date.getMonth()
      monthlyData[month] += order.electricityCost || 0
    })

    return {
      labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      datasets: [
        {
          label: "ค่าไฟการผลิต (บาท)",
          data: monthlyData,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#f59e0b",
        },
      ],
    }
  }

  const prepareCostVsPriceData = () => {
    // Group data by month instead of individual lots
    const monthlyData = new Array(12).fill(0).map(() => ({ 
      totalCost: 0, 
      sellingPrice: 0, 
      orderCount: 0 
    }))
    
    filteredOrders.forEach(order => {
      const date = parseThaiDate(order.date)
      const month = date.getMonth()
      monthlyData[month].totalCost += order.totalCost || 0
      monthlyData[month].sellingPrice += order.sellingPrice || 0
      monthlyData[month].orderCount += 1
    })

    return {
      labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      datasets: [
        {
          label: "ต้นทุนรวม (บาท)",
          data: monthlyData.map(d => d.totalCost),
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          borderWidth: 1,
        },
        {
          label: "ราคาขายรวม (บาท)",
          data: monthlyData.map(d => d.sellingPrice),
          backgroundColor: "#10b981",
          borderColor: "#059669",
          borderWidth: 1,
        },
      ],
    }
  }

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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="Dashboard" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="Dashboard" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    )
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
            {/* Year Selector */}
            <div className="mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-700">เลือกปีที่ต้องการดูข้อมูล:</h2>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {generateYearOptions().map((year) => (
                        <option key={year} value={year}>
                          พ.ศ. {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    แสดงข้อมูลปี พ.ศ. {selectedYear}
                  </div>
                </div>
              </Card>
            </div>

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
                    <p className="text-2xl font-bold text-green-600">{totalProduction.toLocaleString()} จาน</p>
                    <p className="text-xs text-green-500">จาก {filteredOrders.length} ออเดอร์</p>
                  </div>
                </div>
              </Card>

              {/* Total Revenue Card */}
              <Card className="p-4 border border-blue-200">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">รายรับรวม</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalIncome.toLocaleString()} ฿</p>
                    <p className="text-xs text-blue-500">จาก {filteredTransactions.filter(t => t.isIncome).length} รายการ</p>
                  </div>
                </div>
              </Card>

              {/* Net Profit Card */}
              <Card className="p-4 border border-purple-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">กำไรสุทธิ</h3>
                    <p className="text-2xl font-bold text-purple-600">{netProfit.toLocaleString()} ฿</p>
                    <p className="text-xs text-purple-500">รายจ่าย {totalExpenses.toLocaleString()} ฿</p>
                  </div>
                </div>
              </Card>
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
                    <Bar options={barOptions} data={prepareFinancialData()} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สรุปการเงิน</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">รายรับรวม</span>
                      <span className="text-green-600 font-bold">{totalIncome.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">รายจ่ายรวม</span>
                      <span className="text-red-600 font-bold">{totalExpenses.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">กำไรสุทธิ</span>
                      <span className="text-purple-600 font-bold">{netProfit.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">จำนวนธุรกรรม</span>
                      <span className="text-blue-600 font-bold">{filteredTransactions.length} รายการ</span>
                    </div>
                  </div>
                </Card>
              </div>
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
                    <Bar options={barOptions} data={prepareProductionData()} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สัดส่วนประเภทผลิตภัณฑ์</h3>
                  <div className="h-64">
                    <Pie options={pieOptions} data={prepareProductTypeData()} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สรุปการผลิต</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">การผลิตรวม</span>
                      <span className="text-green-600 font-bold">{totalProduction.toLocaleString()} จาน</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">จำนวนออเดอร์</span>
                      <span className="text-blue-600 font-bold">{filteredOrders.length} ออเดอร์</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">สต็อกคงเหลือ</span>
                      <span className="text-orange-600 font-bold">{currentStock.toLocaleString()} ใบ</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">ประเภทผลิตภัณฑ์</span>
                      <span className="text-purple-600 font-bold">{new Set(filteredOrders.map(o => o.product)).size} ประเภท</span>
                    </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สัดส่วนการใช้งานวัตถุดิบ</h3>
                  <div className="h-64">
                    <Pie options={pieOptions} data={prepareMaterialUsageData()} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ข้อมูลวัตถุดิบ</h3>
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{material.name}</span>
                        <span className="text-gray-600 font-bold">
                          {material.quantity.toLocaleString()} {material.unit}
                        </span>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        ไม่มีข้อมูลวัตถุดิบ
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Cost Analysis Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                การวิเคราะห์ต้นทุน (Cost Analysis)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ค่าไฟการผลิตรายเดือน</h3>
                  <div className="h-64">
                    <Line options={lineOptions} data={prepareElectricityCostData()} />
                  </div>
                </Card>
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ต้นทุนรวม vs ราคาขายรายเดือน</h3>
                  <div className="h-64">
                    <Bar options={barOptions} data={prepareCostVsPriceData()} />
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สรุปต้นทุน</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">ค่าไฟรวม</span>
                      <span className="text-orange-600 font-bold">
                        {filteredOrders.reduce((sum, order) => sum + (order.electricityCost || 0), 0).toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">ต้นทุนรวม</span>
                      <span className="text-blue-600 font-bold">
                        {filteredOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0).toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">ราคาขายรวม</span>
                      <span className="text-green-600 font-bold">
                        {filteredOrders.reduce((sum, order) => sum + (order.sellingPrice || 0), 0).toLocaleString()} ฿
                      </span>
                    </div>
                  </div>
                </Card>
              
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">อัตรากำไรเฉลี่ย</h3>
                  <div className="space-y-4">
                    {(() => {
                      const ordersWithCost = filteredOrders.filter(order => order.totalCost > 0 && order.sellingPrice > 0)
                      const totalProfit = ordersWithCost.reduce((sum, order) => {
                        return sum + (order.sellingPrice - order.totalCost)
                      }, 0)
                      const avgProfitRate = ordersWithCost.length > 0 
                        ? (totalProfit / ordersWithCost.reduce((sum, order) => sum + order.totalCost, 0)) * 100 
                        : 0
                      
                      return (
                        <>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="font-medium">กำไรรวม</span>
                            <span className="text-purple-600 font-bold">{totalProfit.toLocaleString()} ฿</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                            <span className="font-medium">อัตรากำไรเฉลี่ย</span>
                            <span className="text-indigo-600 font-bold">{avgProfitRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">จำนวนออเดอร์</span>
                            <span className="text-gray-600 font-bold">{ordersWithCost.length} ออเดอร์</span>
                          </div>
                        </>
                      )
                    })()}
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
