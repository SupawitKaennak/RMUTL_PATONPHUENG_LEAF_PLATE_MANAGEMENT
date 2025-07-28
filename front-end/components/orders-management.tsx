"use client"

import { useState, useEffect, useContext } from "react"
import { Menu, Calendar, AlertCircle, Info, Filter } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DeleteOrderModal from "./delete-order-modal"
import EditOrderModal from "./edit-order-modal"
import SelectMachineModal from "./select-machine-modal"
import AddSellingPriceModal from "./add-selling-price-modal"
import { MaterialContext } from "./material-provider"
import type { Order } from "@/types/order"
import {
  getOrders,
  addOrder as addOrderService,
  updateOrder as updateOrderService,
  deleteOrder as deleteOrderService,
  addProductionQuantity,
  updateElectricityCost,
  getDishRecipes,
} from "@/services/order-service"

export default function OrdersManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
  const [isAddProductionModalOpen, setIsAddProductionModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSelectMachineModalOpen, setIsSelectMachineModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [productionQuantity, setProductionQuantity] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // New selling price modal state
  const [isAddSellingPriceModalOpen, setIsAddSellingPriceModalOpen] = useState(false)
  const [selectedOrderForSellingPrice, setSelectedOrderForSellingPrice] = useState<Order | null>(null)

  // New order form state
  const [newOrderDate, setNewOrderDate] = useState("")
  const [newOrderProduct, setNewOrderProduct] = useState("")
  const [newOrderQuantity, setNewOrderQuantity] = useState("")

  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterDate, setFilterDate] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterDishShape, setFilterDishShape] = useState("")

  // Try to access the material context
  const materialContext = useContext(MaterialContext)

  // Get dish recipes for display
  const dishRecipes = getDishRecipes()

  // Function to calculate material cost
  const calculateMaterialCost = (productType: string, quantity: number): number => {
    const materialPerDish = dishRecipes[productType as keyof typeof dishRecipes] || 0
    const materialNeeded = materialPerDish * quantity
    
    // ดึงราคาจาก material context
    const materialPrice = materialContext?.materials?.find(m => m.name === "ใบตองตึง")?.pricePerUnit || 0.20
    return materialNeeded * materialPrice
  }

  // Function to calculate total cost
  const calculateTotalCost = (materialCost: number, electricityCost: number): number => {
    return materialCost + electricityCost
  }

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await getOrders()
        setOrders(ordersData)
        setFilteredOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const applyFilter = () => {
    let filtered = [...orders]
    
    console.log('Applying filter with:', { filterDate, filterMonth, filterYear, filterDishShape })
    console.log('Total orders:', orders.length)
    
    // Show sample order dates for debugging
    if (orders.length > 0) {
      console.log('Sample order dates:')
      orders.slice(0, 3).forEach((o, i) => {
        console.log(`Order ${i + 1}: ${o.date}`)
      })
    }

    if (filterDate) {
      console.log('Filtering by date:', filterDate)
      filtered = filtered.filter(order => {
        // Parse order date (format: DD/MM/YY)
        const [day, month, year] = order.date.split('/')
        const orderDay = parseInt(day)
        const orderMonth = parseInt(month)
        const orderYear = parseInt(year) + 2500 // Convert YY to YYYY (assuming 25xx)

        // Parse filter date (format: YYYY-MM-DD from date picker)
        const filterDateObj = new Date(filterDate)
        const filterDay = filterDateObj.getDate()
        const filterMonth = filterDateObj.getMonth() + 1
        const filterYear = filterDateObj.getFullYear()

        // Convert filter year to Buddhist era for comparison
        const filterBuddhistYear = filterYear + 543

        const matches = orderDay === filterDay && 
                       orderMonth === filterMonth && 
                       orderYear === filterBuddhistYear
        
        console.log(`Order ${order.date}: day=${orderDay}, month=${orderMonth}, year=${orderYear}`)
        console.log(`Filter: day=${filterDay}, month=${filterMonth}, year=${filterYear} (CE) -> ${filterBuddhistYear} (BE), matches=${matches}`)
        
        return matches
      })
    }

    if (filterMonth) {
      console.log('Filtering by month:', filterMonth)
      filtered = filtered.filter(order => {
        const [, month] = order.date.split('/')
        const orderMonth = parseInt(month)
        const matches = orderMonth === parseInt(filterMonth)
        console.log(`Order ${order.date}: month=${orderMonth}, matches=${matches}`)
        return matches
      })
    }

    if (filterYear) {
      console.log('Filtering by year:', filterYear)
      filtered = filtered.filter(order => {
        const [, , year] = order.date.split('/')
        const orderYear = parseInt(year) + 2500 // Convert YY to YYYY
        const buddhistYear = parseInt(filterYear)
        const matches = orderYear === buddhistYear
        console.log(`Order ${order.date}: year=${orderYear}, buddhistYear=${buddhistYear}, matches=${matches}`)
        return matches
      })
    }

    if (filterDishShape) {
      console.log('Filtering by dish shape:', filterDishShape)
      filtered = filtered.filter(order => {
        const matches = order.product === filterDishShape
        console.log(`Order ${order.product}: matches=${matches}`)
        return matches
      })
    }

    console.log('Filtered orders:', filtered.length)
    setFilteredOrders(filtered)
  }

  const clearFilter = () => {
    setFilterDate("")
    setFilterMonth("")
    setFilterYear("")
    setFilterDishShape("")
    setFilteredOrders(orders)
  }

  // Generate year options dynamically
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear() + 543 // Convert to Buddhist era
    const years = []
    // Generate 10 years from current year (5 years back and 5 years forward)
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(
        <option key={i} value={i.toString()}>
          {i}
        </option>
      )
    }
    return years
  }

  const handleAddOrder = () => {
    setNewOrderDate("")
    setNewOrderProduct("")
    setNewOrderQuantity("")
    setIsAddOrderModalOpen(true)
  }

  // Function to get current date in Thai Buddhist Era format (DD/MM/YY)
  const getCurrentThaiDate = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, "0")
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const thaiYear = today.getFullYear() + 543 // Convert to Buddhist era
    const shortThaiYear = (thaiYear % 100).toString().padStart(2, "0") // Get last 2 digits
    return `${day}/${month}/${shortThaiYear}`
  }

  const handleSaveOrder = async () => {
    if (!newOrderProduct || !newOrderQuantity) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    try {
      const quantity = parseInt(newOrderQuantity)
      const materialCost = calculateMaterialCost(newOrderProduct, quantity)

      const newOrder = {
        date: newOrderDate || getCurrentThaiDate(),
        product: newOrderProduct,
        orderedQuantity: `${quantity} จาน`,
        materialCost,
        electricityCost: 0,
        totalCost: materialCost,
        sellingPrice: 0,
        remainingQuantity: `${quantity} จาน`,
        qcQuantity: "",
        status: "กำลังผลิต",
        lot: `LOT${Date.now()}`,
      }

      const orderId = await addOrderService(newOrder)
      const orderWithId = { id: orderId, ...newOrder }

      const updatedOrders = [orderWithId, ...orders]
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders)

      setSuccessMessage("เพิ่มออเดอร์สำเร็จ")
      setIsAddOrderModalOpen(false)
      setNewOrderDate("")
      setNewOrderProduct("")
      setNewOrderQuantity("")
    } catch (error) {
      console.error("Error adding order:", error)
      setError("ไม่สามารถเพิ่มออเดอร์ได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleEditOrder = (id: string) => {
    const order = orders.find((order) => order.id === id)
    if (order) {
      setSelectedOrder(order)
      setIsEditModalOpen(true)
    }
  }

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      // Update the order in Firestore and get updated order data
      const updatedOrderData = await updateOrderService(updatedOrder.id, updatedOrder)

      if (updatedOrderData) {
        // Update the order in local state with updated data from backend
        setOrders(orders.map((order) => (order.id === updatedOrderData.id ? updatedOrderData : order)))
        setFilteredOrders(orders.map((order) => (order.id === updatedOrderData.id ? updatedOrderData : order)))
      } else {
        // Fallback to using passed updatedOrder if backend data not available
        setOrders(orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      }

      setSuccessMessage("อัปเดตออเดอร์สำเร็จ")

      // Refresh material data if context is available
      if (materialContext?.refreshMaterials) {
        await materialContext.refreshMaterials()
      }
    } catch (error) {
      console.error("Error updating order:", error)
      setError("ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleDeleteOrder = (id: string) => {
    setSelectedOrderId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (selectedOrderId) {
      try {
        await deleteOrderService(selectedOrderId)
        setOrders(orders.filter((order) => order.id !== selectedOrderId))
        setFilteredOrders(orders.filter((order) => order.id !== selectedOrderId))
        setSuccessMessage("ลบออเดอร์สำเร็จ")

        // Refresh material data if context is available
        if (materialContext?.refreshMaterials) {
          await materialContext.refreshMaterials()
        }
      } catch (error) {
        console.error("Error deleting order:", error)
        setError("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setIsDeleteModalOpen(false)
        setSelectedOrderId(null)
      }
    }
  }

  const handleAddProduction = (id: string) => {
    setSelectedOrderId(id)
    setProductionQuantity("")
    setIsAddProductionModalOpen(true)
  }

  const handleAddSellingPrice = (order: Order) => {
    setSelectedOrderForSellingPrice(order)
    setIsAddSellingPriceModalOpen(true)
  }

  const handleSaveSellingPrice = async (updatedOrder: Order) => {
    try {
      // Calculate new material cost and total cost
      const quantity = updatedOrder.remainingQuantity ? parseInt(updatedOrder.remainingQuantity.replace(" จาน", "")) : 0
      const materialCost = calculateMaterialCost(updatedOrder.product, quantity)
      const totalCost = calculateTotalCost(materialCost, updatedOrder.electricityCost)

      const orderWithUpdatedCosts = {
        ...updatedOrder,
        materialCost,
        totalCost,
      }

      await updateOrderService(updatedOrder.id, orderWithUpdatedCosts)
      setOrders(orders.map((order) => (order.id === updatedOrder.id ? orderWithUpdatedCosts : order)))
      setFilteredOrders(orders.map((order) => (order.id === updatedOrder.id ? orderWithUpdatedCosts : order)))
      setSuccessMessage("อัปเดตราคาขายสำเร็จ")
    } catch (error) {
      console.error("Error updating selling price:", error)
      setError("ไม่สามารถอัปเดตราคาขายได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleSaveProduction = async () => {
    if (!selectedOrderId || !productionQuantity) return

    try {
      const order = orders.find((order) => order.id === selectedOrderId)
      if (!order) return

      const result = await addProductionQuantity(selectedOrderId, productionQuantity, order.product)

      if (result.success) {
        // Calculate new material cost
        const quantity = parseInt(productionQuantity)
        const materialCost = calculateMaterialCost(order.product, quantity)
        const totalCost = calculateTotalCost(materialCost, order.electricityCost)

        // Update the order in local state
        const updatedOrder = {
          ...order,
          remainingQuantity: `${productionQuantity} จาน`,
          materialCost,
          totalCost,
        }
        setOrders(orders.map((o) => (o.id === selectedOrderId ? updatedOrder : o)))
        setFilteredOrders(orders.map((o) => (o.id === selectedOrderId ? updatedOrder : o)))
        setSuccessMessage("เพิ่มจำนวนการผลิตสำเร็จ")

        // Refresh material data if context is available
        if (materialContext?.refreshMaterials) {
          await materialContext.refreshMaterials()
        }
      } else {
        setError(result.message || "ไม่สามารถเพิ่มจำนวนการผลิตได้")
      }
    } catch (error) {
      console.error("Error adding production quantity:", error)
      setError("ไม่สามารถเพิ่มจำนวนการผลิตได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsAddProductionModalOpen(false)
      setSelectedOrderId(null)
      setProductionQuantity("")
    }
  }

  const handleSelectMachine = (id: string) => {
    setSelectedOrderId(id)
    setIsSelectMachineModalOpen(true)
  }

  const handleSaveMachineSelection = async (costPerUnit: number, totalElectricityCost: number) => {
    if (!selectedOrderId) return

    try {
      const order = orders.find((order) => order.id === selectedOrderId)
      if (!order) return

      const success = await updateElectricityCost(selectedOrderId, totalElectricityCost, order.materialCost)

      if (success) {
        // Calculate new total cost
        const quantity = order.remainingQuantity ? parseInt(order.remainingQuantity.replace(" จาน", "")) : 0
        const materialCost = calculateMaterialCost(order.product, quantity)
        const totalCost = calculateTotalCost(materialCost, totalElectricityCost)

        // Update the order in local state
        const updatedOrder = {
          ...order,
          electricityCost: totalElectricityCost,
          materialCost,
          totalCost,
        }
        setOrders(orders.map((o) => (o.id === selectedOrderId ? updatedOrder : o)))
        setFilteredOrders(orders.map((o) => (o.id === selectedOrderId ? updatedOrder : o)))
        setSuccessMessage("อัปเดตค่าไฟการผลิตสำเร็จ")
      } else {
        setError("ไม่สามารถอัปเดตค่าไฟการผลิตได้")
      }
    } catch (error) {
      console.error("Error updating electricity cost:", error)
      setError("ไม่สามารถอัปเดตค่าไฟการผลิตได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsSelectMachineModalOpen(false)
      setSelectedOrderId(null)
    }
  }

  const hasOrders = filteredOrders.length > 0

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="ออเดอร์" onClose={() => setIsSidebarOpen(false)} />

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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                <svg
                  className="fill-current h-6 w-6 text-red-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative flex items-center">
              <Info className="h-5 w-5 mr-2" />
              <span className="block sm:inline">{successMessage}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage(null)}>
                <svg
                  className="fill-current h-6 w-6 text-green-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {/* สูตรการผลิต */}
            <div className="mb-4">
              <Card className="p-4 bg-blue-50">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">สูตรการผลิต</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {Object.entries(dishRecipes).map(([dishType, leavesNeeded]) => (
                    <div key={dishType} className="flex justify-between items-center">
                      <span className="font-medium">{dishType}:</span>
                      <span className="text-blue-600">{leavesNeeded} ใบตองตึง/จาน</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">* เมื่อแก้ไขหรือลบออเดอร์ ระบบจะคืนใบตองตึงกลับเข้าคลังโดยอัตโนมัติ</p>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-md">
                  <h2 className="text-xl font-semibold">แผนการผลิต (ออเดอร์)</h2>
                </div>
                <button
                  onClick={toggleFilter}
                  className={`p-2 rounded-md flex items-center ${
                    isFilterOpen ? 'bg-blue-200' : 'bg-blue-100 hover:bg-blue-200'
                  }`}
                  title="กรองข้อมูล"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
              {hasOrders && (
                <button
                  onClick={handleAddOrder}
                  className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                >
                  เพิ่มออเดอร์
                </button>
              )}
            </div>

            {/* Filter Section */}
            {isFilterOpen && (
              <div className="bg-white p-4 rounded-md shadow-sm mb-4 border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">วันที่:</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">เดือน:</label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="1">มกราคม</option>
                      <option value="2">กุมภาพันธ์</option>
                      <option value="3">มีนาคม</option>
                      <option value="4">เมษายน</option>
                      <option value="5">พฤษภาคม</option>
                      <option value="6">มิถุนายน</option>
                      <option value="7">กรกฎาคม</option>
                      <option value="8">สิงหาคม</option>
                      <option value="9">กันยายน</option>
                      <option value="10">ตุลาคม</option>
                      <option value="11">พฤศจิกายน</option>
                      <option value="12">ธันวาคม</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">ปี:</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">ทั้งหมด</option>
                      {generateYearOptions()}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">รูปทรงจาน:</label>
                    <select
                      value={filterDishShape}
                      onChange={(e) => setFilterDishShape(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="จานสี่เหลี่ยม">จานสี่เหลี่ยม</option>
                      <option value="จานวงกลม">จานวงกลม</option>
                      <option value="จานหัวใจ">จานหัวใจ</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700 opacity-0">ปุ่ม:</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={applyFilter}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex-1"
                      >
                        กรอง
                      </button>
                      <button
                        onClick={clearFilter}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex-1"
                      >
                        ล้าง
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto max-h-[850px] overflow-y-auto">
                  {hasOrders ? (
                    <table className="w-full">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lot
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ว/ด/ป
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ผลิตภัณฑ์
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            จำนวนที่สั่ง
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            จำนวนที่ผลิต
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            จำนวน QC
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ค่าไฟการผลิต
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ต้นทุนวัตถุดิบ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ต้นทุนรวม
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ราคาขาย
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            สถานะ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            การดำเนินการ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.lot}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderedQuantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.remainingQuantity ? (
                                <span className="text-gray-700">{order.remainingQuantity}</span>
                              ) : (
                                <button
                                  onClick={() => handleAddProduction(order.id)}
                                  className="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  เพิ่ม
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.qcQuantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.electricityCost > 0 ? (
                                <span className="text-gray-700">{order.electricityCost.toFixed(6)} บาท</span>
                              ) : (
                                <button
                                  onClick={() => handleSelectMachine(order.id)}
                                  className="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  เลือกเครื่องจักร
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(() => {
                                const quantity = order.remainingQuantity ? parseInt(order.remainingQuantity.replace(" จาน", "")) : 0
                                const materialCost = calculateMaterialCost(order.product, quantity)
                                return `${materialCost.toFixed(2)} บาท`
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(() => {
                                const quantity = order.remainingQuantity ? parseInt(order.remainingQuantity.replace(" จาน", "")) : 0
                                const materialCost = calculateMaterialCost(order.product, quantity)
                                const totalCost = calculateTotalCost(materialCost, order.electricityCost)
                                return `${totalCost.toFixed(2)} บาท`
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.sellingPrice > 0 ? (
                                <span className="text-gray-700">{order.sellingPrice.toFixed(2)} บาท</span>
                              ) : (
                                <button
                                  onClick={() => handleAddSellingPrice(order)}
                                  className="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  เพิ่มราคาขาย
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditOrder(order.id)}
                                  className="text-yellow-500 hover:text-blue-900"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">ยังไม่มีรายการออเดอร์</p>
                      <button
                        onClick={handleAddOrder}
                        className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                      >
                        เพิ่มออเดอร์แรก
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Add Order Modal */}
      <Dialog open={isAddOrderModalOpen} onOpenChange={setIsAddOrderModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
          <DialogHeader className="bg-teal-400 text-white p-4">
            <DialogTitle className="text-center text-xl">เพิ่ม</DialogTitle>
            <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มออเดอร์ใหม่</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <Label htmlFor="order-date" className="block mb-2">
                  วัน/เดือน/ปี
                </Label>
                <div className="relative">
                  <Input
                    id="order-date"
                    type="text"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="pr-10"
                    placeholder={getCurrentThaiDate()}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="order-product" className="block mb-2">
                  เลือกประเภทผลิตภัณฑ์
                </Label>
                <Select value={newOrderProduct} onValueChange={setNewOrderProduct}>
                  <SelectTrigger id="order-product">
                    <SelectValue placeholder="เลือกผลิตภัณฑ์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="จานสี่เหลี่ยม">จานสี่เหลี่ยม (ใช้ใบตองตึง 4 ใบ/จาน)</SelectItem>
                    <SelectItem value="จานวงกลม">จานวงกลม (ใช้ใบตองตึง 4 ใบ/จาน)</SelectItem>
                    <SelectItem value="จานหัวใจ">จานหัวใจ (ใช้ใบตองตึง 5 ใบ/จาน)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="order-quantity" className="block mb-2">
                  จำนวนที่สั่ง
                </Label>
                <div className="flex items-center">
                  <Input
                    id="order-quantity"
                    type="text"
                    value={newOrderQuantity}
                    onChange={(e) => setNewOrderQuantity(e.target.value)}
                    className="flex-1"
                    placeholder="ระบุจำนวน"
                  />
                  <span className="ml-2">จาน</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setIsAddOrderModalOpen(false)}
                className="bg-yellow-300 hover:bg-yellow-400 text-black px-6"
              >
                ยกเลิก
              </Button>
              <Button onClick={handleSaveOrder} className="bg-teal-400 hover:bg-teal-500 text-white px-6">
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Production Modal */}
      <Dialog open={isAddProductionModalOpen} onOpenChange={setIsAddProductionModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
          <DialogHeader className="bg-teal-400 text-white p-4">
            <DialogTitle className="text-center text-xl">เพิ่ม</DialogTitle>
            <DialogDescription className="sr-only">ฟอร์มสำหรับเพิ่มจำนวนการผลิต</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="production-quantity" className="block mb-2">
                จำนวนที่ผลิต
              </Label>
              <div className="flex items-center">
                <Input
                  id="production-quantity"
                  type="text"
                  value={productionQuantity}
                  onChange={(e) => setProductionQuantity(e.target.value)}
                  className="flex-1"
                  placeholder="ระบุจำนวน"
                />
                <span className="ml-2">จาน</span>
              </div>
              {selectedOrderId && (
                <p className="text-sm text-gray-600 mt-2">* ระบบจะลดใบตองตึงในคลังวัตถุดิบตามสูตรการผลิตโดยอัตโนมัติ</p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setIsAddProductionModalOpen(false)}
                className="bg-yellow-300 hover:bg-yellow-400 text-black px-6"
              >
                ยกเลิก
              </Button>
              <Button onClick={handleSaveProduction} className="bg-teal-400 hover:bg-teal-500 text-white px-6">
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddSellingPriceModal
        isOpen={isAddSellingPriceModalOpen}
        onClose={() => setIsAddSellingPriceModalOpen(false)}
        onSave={handleSaveSellingPrice}
        order={selectedOrderForSellingPrice}
      />

      {/* Select Machine Modal */}
      <SelectMachineModal
        isOpen={isSelectMachineModalOpen}
        onClose={() => setIsSelectMachineModalOpen(false)}
        onSelect={handleSaveMachineSelection}
        quantity={orders.find((order) => order.id === selectedOrderId)?.remainingQuantity || ""}
      />

      {/* Delete Order Modal */}
      <DeleteOrderModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteOrder}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateOrder}
        order={selectedOrder}
      />
    </div>
  )
}
