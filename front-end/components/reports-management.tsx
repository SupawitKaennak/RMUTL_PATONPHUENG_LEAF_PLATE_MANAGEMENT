"use client"

import { useState, useEffect } from "react"
import { Menu, Download, TrendingUp, TrendingDown, Package, DollarSign, BarChart3, PieChart, Calendar, FileText } from "lucide-react"
import Sidebar from "./sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getTransactions } from "@/services/transaction-service"
import { getOrders } from "@/services/order-service"
import { getMaterials } from "@/services/material-service"
import { getMaterialHistory } from "@/services/material-history-service"
import type { Transaction } from "@/types/transaction"
import type { Order } from "@/types/order"
import type { Material } from "@/types/material"

// Utility function to parse Thai date format (DD/MM/YY)
const parseThaiDate = (dateString: string): Date => {
  try {
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // Month is 0-indexed
        let year = parseInt(parts[2])
        
        // Handle 2-digit year (BE)
        if (year < 100) {
          year = year + 2500 // Convert 2-digit BE to 4-digit BE
        }
        
        // Convert BE to CE (BE - 543 = CE)
        const ceYear = year - 543
        
        // Debug logging
        console.log(`Date parsing: ${dateString} -> Day: ${day}, Month: ${month + 1}, BE Year: ${year}, CE Year: ${ceYear}`)
        
        return new Date(ceYear, month, day)
      }
    } else if (dateString.includes('-')) {
      return new Date(dateString)
    }
    
    return new Date(dateString)
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return new Date()
  }
}

export default function ReportsManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialHistory, setMaterialHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543)
  const [selectedReport, setSelectedReport] = useState("summary")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [transactionsData, ordersData, materialsData, materialHistoryData] = await Promise.all([
          getTransactions(),
          getOrders(),
          getMaterials(),
          getMaterialHistory(),
        ])
        
        setTransactions(transactionsData)
        setOrders(ordersData)
        setMaterials(materialsData)
        setMaterialHistory(materialHistoryData)
      } catch (err) {
        console.error("Error fetching reports data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Generate year options
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear() + 543
    const years = []
    for (let i = currentYear; i >= currentYear - 4; i--) {
      years.push(i)
    }
    return years
  }

  // Filter data by selected year
  const filterDataByYear = (data: any[], dateField: string) => {
    if (data.length === 0) return []
    
    return data.filter(item => {
      if (!item[dateField]) return false
      
      const date = parseThaiDate(item[dateField])
      const itemYear = date.getFullYear() + 543
      return itemYear === selectedYear
    })
  }

  const filteredTransactions = filterDataByYear(transactions, 'date')
  const filteredOrders = filterDataByYear(orders, 'date')

  // Calculate summary data
  const totalIncome = filteredTransactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  const totalProduction = filteredOrders.reduce((sum, order) => {
    const orderedQty = parseInt(order.orderedQuantity.replace(/[^\d]/g, '')) || 0
    return sum + orderedQty
  }, 0)

  const totalElectricityCost = filteredOrders.reduce((sum, order) => sum + (order.electricityCost || 0), 0)
  const totalCost = filteredOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0)
  const totalSellingPrice = filteredOrders.reduce((sum, order) => sum + (order.sellingPrice || 0), 0)

  const currentStock = materials.reduce((sum, material) => {
    if (material.name.toLowerCase().includes('ใบตองตึง')) {
      return sum + material.quantity
    }
    return sum
  }, 0)

  // Calculate monthly data
  const getMonthlyData = () => {
    const monthlyData = new Array(12).fill(0).map(() => ({ 
      income: 0, 
      expenses: 0, 
      production: 0, 
      orders: 0 
    }))
    
    filteredTransactions.forEach(transaction => {
      const date = parseThaiDate(transaction.date)
      const month = date.getMonth()
      if (transaction.isIncome) {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += transaction.amount
      }
    })

    filteredOrders.forEach(order => {
      const date = parseThaiDate(order.date)
      const month = date.getMonth()
      const qty = parseInt(order.orderedQuantity.replace(/[^\d]/g, '')) || 0
      monthlyData[month].production += qty
      monthlyData[month].orders += 1
    })

    return monthlyData
  }

  const monthlyData = getMonthlyData()

  const handleExportToExcel = () => {
    // Generate report data
    const reportData = {
      year: selectedYear,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalProduction,
        totalOrders: filteredOrders.length,
        totalTransactions: filteredTransactions.length,
        currentStock,
        totalElectricityCost,
        totalCost,
        totalSellingPrice
      },
      monthlyData,
      orders: filteredOrders,
      transactions: filteredTransactions,
      materials
    }

    // Create CSV content with proper Thai encoding
    const csvContent = generateCSV(reportData)
    
    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent
    
    // Download file with proper encoding
    const blob = new Blob([csvWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `รายงาน_ปี_${selectedYear}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSV = (data: any) => {
    let csv = 'รายงานปี พ.ศ.,' + data.year + '\n'
    csv += 'รายงานปี ค.ศ.,' + (data.year - 543) + '\n\n'
    
    // Summary
    csv += 'สรุปข้อมูล\n'
    csv += 'รายรับรวม,' + data.summary.totalIncome + '\n'
    csv += 'รายจ่ายรวม,' + data.summary.totalExpenses + '\n'
    csv += 'กำไรสุทธิ,' + data.summary.netProfit + '\n'
    csv += 'การผลิตรวม,' + data.summary.totalProduction + '\n'
    csv += 'จำนวนออเดอร์,' + data.summary.totalOrders + '\n'
    csv += 'จำนวนธุรกรรม,' + data.summary.totalTransactions + '\n'
    csv += 'สต็อกคงเหลือ,' + data.summary.currentStock + '\n'
    csv += 'ค่าไฟรวม,' + data.summary.totalElectricityCost + '\n'
    csv += 'ต้นทุนรวม,' + data.summary.totalCost + '\n'
    csv += 'ราคาขายรวม,' + data.summary.totalSellingPrice + '\n\n'
    
    // Monthly data
    csv += 'ข้อมูลรายเดือน\n'
    csv += 'เดือน,รายรับ,รายจ่าย,กำไร,การผลิต,จำนวนออเดอร์\n'
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    months.forEach((month, index) => {
      const income = data.monthlyData[index].income
      const expenses = data.monthlyData[index].expenses
      const profit = income - expenses
      csv += `"${month}",${income},${expenses},${profit},${data.monthlyData[index].production},${data.monthlyData[index].orders}\n`
    })
    
    // Orders data
    csv += '\nข้อมูลออเดอร์\n'
    csv += 'LOT,วันที่,ผลิตภัณฑ์,จำนวน,สถานะ,ต้นทุน,ราคาขาย\n'
    data.orders.forEach((order: any) => {
      // Parse the date to show in correct format
      const parsedDate = parseThaiDate(order.date)
      const formattedDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()}`
      csv += `"${order.lot}","${formattedDate}","${order.product}","${order.orderedQuantity}","${order.status}",${order.totalCost || 0},${order.sellingPrice || 0}\n`
    })
    
    // Materials data
    csv += '\nข้อมูลวัตถุดิบ\n'
    csv += 'ชื่อ,จำนวน,หน่วย,ราคาต่อหน่วย,มูลค่ารวม\n'
    data.materials.forEach((material: any) => {
      csv += `"${material.name}",${material.quantity},"${material.unit}",${material.pricePerUnit},${material.quantity * material.pricePerUnit}\n`
    })
    
    return csv
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="สรุปรายงาน" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="สรุปรายงาน" onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-500 text-white p-4 flex items-center min-h-[56px]">
          <button
            onClick={toggleSidebar}
            className="block md:hidden p-1 mr-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">สรุปและรายงานผล</h1>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Year Selector */}
            <div className="mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-700">เลือกปีที่ต้องการดูรายงาน:</h2>
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
                    แสดงรายงานปี พ.ศ. {selectedYear}
                  </div>
                </div>
              </Card>
            </div>

            {/* Report Type Selector */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedReport("summary")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedReport === "summary"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  สรุปภาพรวม
                </button>
                <button
                  onClick={() => setSelectedReport("financial")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedReport === "financial"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  รายงานการเงิน
                </button>
                <button
                  onClick={() => setSelectedReport("production")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedReport === "production"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  รายงานการผลิต
                </button>
                <button
                  onClick={() => setSelectedReport("inventory")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    selectedReport === "inventory"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  รายงานคลังสินค้า
                </button>
              </div>
            </div>

            {/* Summary Report */}
            {selectedReport === "summary" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 border border-green-200">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">รายรับรวม</h3>
                        <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} ฿</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-red-200">
                    <div className="flex items-center">
                      <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">รายจ่ายรวม</h3>
                        <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} ฿</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-purple-200">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">กำไรสุทธิ</h3>
                        <p className="text-2xl font-bold text-purple-600">{netProfit.toLocaleString()} ฿</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-blue-200">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">การผลิตรวม</h3>
                        <p className="text-2xl font-bold text-blue-600">{totalProduction.toLocaleString()} จาน</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">สรุปข้อมูลรายเดือน</h3>
                    <div className="space-y-3">
                      {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((month, index) => (
                        <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{month}</span>
                          <div className="text-sm text-gray-600">
                            <span className="mr-4">รายรับ: {monthlyData[index].income.toLocaleString()} ฿</span>
                            <span className="mr-4">รายจ่าย: {monthlyData[index].expenses.toLocaleString()} ฿</span>
                            <span>การผลิต: {monthlyData[index].production} จาน</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">สถิติเพิ่มเติม</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">จำนวนออเดอร์</span>
                        <span className="text-blue-600 font-bold">{filteredOrders.length} ออเดอร์</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">จำนวนธุรกรรม</span>
                        <span className="text-green-600 font-bold">{filteredTransactions.length} รายการ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">สต็อกคงเหลือ</span>
                        <span className="text-orange-600 font-bold">{currentStock.toLocaleString()} ใบ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium">อัตรากำไรเฉลี่ย</span>
                        <span className="text-purple-600 font-bold">
                          {(() => {
                            const ordersWithCost = filteredOrders.filter(order => order.totalCost > 0 && order.sellingPrice > 0)
                            const totalProfit = ordersWithCost.reduce((sum, order) => {
                              return sum + (order.sellingPrice - order.totalCost)
                            }, 0)
                            const totalRevenue = ordersWithCost.reduce((sum, order) => sum + order.sellingPrice, 0)
                            return totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'
                          })()}%
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Financial Report */}
            {selectedReport === "financial" && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">รายงานการเงินรายเดือน</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2">เดือน</th>
                          <th className="border border-gray-300 px-4 py-2">รายรับ (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">รายจ่าย (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">กำไร (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">อัตรากำไร (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((month, index) => {
                          const income = monthlyData[index].income
                          const expenses = monthlyData[index].expenses
                          const profit = income - expenses
                          const profitRate = income > 0 ? (profit / income) * 100 : 0
                          
                          return (
                            <tr key={month} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium">{month}</td>
                              <td className="border border-gray-300 px-4 py-2 text-green-600">{income.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2 text-red-600">{expenses.toLocaleString()}</td>
                              <td className={`border border-gray-300 px-4 py-2 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profit.toLocaleString()}
                              </td>
                              <td className={`border border-gray-300 px-4 py-2 ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitRate.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Production Report */}
            {selectedReport === "production" && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">รายงานการผลิตรายเดือน</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2">เดือน</th>
                          <th className="border border-gray-300 px-4 py-2">จำนวนออเดอร์</th>
                          <th className="border border-gray-300 px-4 py-2">การผลิต (จาน)</th>
                          <th className="border border-gray-300 px-4 py-2">ค่าไฟ (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">ต้นทุนรวม (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">ราคาขาย (฿)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((month, index) => {
                          const monthOrders = filteredOrders.filter(order => {
                            const date = parseThaiDate(order.date)
                            return date.getMonth() === index
                          })
                          
                          const production = monthlyData[index].production
                          const electricityCost = monthOrders.reduce((sum, order) => sum + (order.electricityCost || 0), 0)
                          const totalCost = monthOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0)
                          const sellingPrice = monthOrders.reduce((sum, order) => sum + (order.sellingPrice || 0), 0)
                          
                          return (
                            <tr key={month} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium">{month}</td>
                              <td className="border border-gray-300 px-4 py-2">{monthlyData[index].orders}</td>
                              <td className="border border-gray-300 px-4 py-2">{production.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2">{electricityCost.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2">{totalCost.toLocaleString()}</td>
                              <td className="border border-gray-300 px-4 py-2">{sellingPrice.toLocaleString()}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Inventory Report */}
            {selectedReport === "inventory" && (
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">รายงานคลังสินค้า</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2">ชื่อวัตถุดิบ</th>
                          <th className="border border-gray-300 px-4 py-2">จำนวนคงเหลือ</th>
                          <th className="border border-gray-300 px-4 py-2">หน่วย</th>
                          <th className="border border-gray-300 px-4 py-2">ราคาต่อหน่วย (฿)</th>
                          <th className="border border-gray-300 px-4 py-2">มูลค่ารวม (฿)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material) => (
                          <tr key={material.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">{material.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{material.quantity.toLocaleString()}</td>
                            <td className="border border-gray-300 px-4 py-2">{material.unit}</td>
                            <td className="border border-gray-300 px-4 py-2">{material.pricePerUnit.toLocaleString()}</td>
                            <td className="border border-gray-300 px-4 py-2">{(material.quantity * material.pricePerUnit).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Export Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <Button
                onClick={handleExportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                ส่งออกรายงานเป็นไฟล์ CSV
              </Button>
              <Button
                onClick={() => {
                  // For now, show a message about Excel export
                  alert('ฟีเจอร์ส่งออก Excel จะพร้อมใช้งานในเวอร์ชันถัดไป\nตอนนี้กรุณาใช้ไฟล์ CSV แทน')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                ส่งออกรายงานเป็นไฟล์ Excel
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
