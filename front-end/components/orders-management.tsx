"use client"

import { useState, useEffect, useContext } from "react"
import { Menu, Calendar, AlertCircle, Info } from "lucide-react"
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

  // New order form state
  const [newOrderDate, setNewOrderDate] = useState("")
  const [newOrderProduct, setNewOrderProduct] = useState("")
  const [newOrderQuantity, setNewOrderQuantity] = useState("")

  const [orders, setOrders] = useState<Order[]>([])

  // Try to access the material context
  const materialContext = useContext(MaterialContext)

  // Get dish recipes for display
  const dishRecipes = getDishRecipes()

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await getOrders()
        setOrders(ordersData)
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
    if (!newOrderProduct || !newOrderQuantity) return

    try {
      // Use current date if date field is empty
      const orderDate = newOrderDate || getCurrentThaiDate()

      // Generate a new lot number (A + next number)
      let newLotNumber = "A001" // Default for first order

      if (orders.length > 0) {
        const maxLotNumber = orders
          .filter((order) => order.lot.startsWith("A"))
          .map((order) => Number.parseInt(order.lot.substring(1)))
          .reduce((max, num) => Math.max(max, num), 0)

        newLotNumber = `A${String(maxLotNumber + 1).padStart(3, "0")}`
      }

      const newOrder: Omit<Order, "id"> = {
        lot: newLotNumber,
        date: orderDate,
        product: newOrderProduct,
        orderedQuantity: `${newOrderQuantity} จาน`,
        remainingQuantity: "",
        qcQuantity: "",
        electricityCost: 0,
        materialCost: 0,
        totalCost: 0,
        sellingPrice: 0,
        status: "กำลังผลิต",
        machineId: "",
      }

      // Add the new order to Firestore
      const orderId = await addOrderService(newOrder)

      // Add the order to local state with the new ID
      const orderWithId: Order = {
        id: orderId,
        ...newOrder,
      }

      setOrders([orderWithId, ...orders])
      setIsAddOrderModalOpen(false)
      setSuccessMessage(`เพิ่มออเดอร์ ${newLotNumber} สำเร็จ`)
    } catch (error) {
      console.error("Error saving order:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
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
      // Update the order in Firestore
      await updateOrderService(updatedOrder.id, updatedOrder)

      // Update the order in local state
      setOrders(orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
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
        // Delete the order from Firestore (this will also return materials)
        const result = await deleteOrderService(selectedOrderId)

        if (result.success) {
          // Remove the order from local state
          setOrders(orders.filter((order) => order.id !== selectedOrderId))
          setIsDeleteModalOpen(false)
          setSelectedOrderId(null)
          setSuccessMessage(result.message || "ลบออเดอร์สำเร็จ")

          // Refresh material data if context is available
          if (materialContext?.refreshMaterials) {
            await materialContext.refreshMaterials()
          }
        } else {
          setError(result.message || "ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
        }
      } catch (error) {
        console.error("Error deleting order:", error)
        setError("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      }
    }
  }

  const handleAddProduction = (id: string) => {
    setSelectedOrderId(id)
    setProductionQuantity("")
    setIsAddProductionModalOpen(true)
  }

  const handleSaveProduction = async () => {
    if (!selectedOrderId || !productionQuantity) return

    try {
      const order = orders.find((order) => order.id === selectedOrderId)
      if (!order) return

      // Update the order with production quantity
      const result = await addProductionQuantity(selectedOrderId, productionQuantity, order.product)

      if (result.success) {
        // Update the order in local state
        setOrders(
          orders.map((order) => {
            if (order.id === selectedOrderId) {
              return {
                ...order,
                remainingQuantity: `${productionQuantity} จาน`,
                materialCost: order.materialCost || 0, // จะถูกอัปเดตจาก service
                totalCost: order.materialCost || 0,
              }
            }
            return order
          }),
        )
        setIsAddProductionModalOpen(false)
        setSelectedOrderId(null)
        setProductionQuantity("")
        setSuccessMessage(result.message || "เพิ่มจำนวนการผลิตสำเร็จ")

        // Refresh material data if context is available
        if (materialContext?.refreshMaterials) {
          await materialContext.refreshMaterials()
        }
      } else {
        setError(result.message || "ไม่สามารถเพิ่มจำนวนการผลิตได้")
      }
    } catch (error) {
      console.error("Error saving production:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleSelectMachine = (id: string) => {
    const order = orders.find((order) => order.id === id)
    if (order && order.remainingQuantity) {
      setSelectedOrderId(id)
      setIsSelectMachineModalOpen(true)
    } else {
      // Show an alert if production quantity is not set
      alert("กรุณาระบุจำนวนที่ผลิตก่อนเลือกเครื่องจักร")
    }
  }

  const handleSaveMachineSelection = async (electricityCost: number, totalElectricityCost: number) => {
    if (!selectedOrderId) return

    try {
      const order = orders.find((order) => order.id === selectedOrderId)
      if (!order) return

      // Update electricity cost in Firestore
      const success = await updateElectricityCost(selectedOrderId, totalElectricityCost, order.materialCost)

      if (success) {
        // Update the order in local state
        setOrders(
          orders.map((order) => {
            if (order.id === selectedOrderId) {
              const newTotalCost = order.materialCost + totalElectricityCost

              return {
                ...order,
                electricityCost: totalElectricityCost,
                totalCost: newTotalCost,
              }
            }
            return order
          }),
        )
        setSuccessMessage("บันทึกข้อมูลเครื่องจักรสำเร็จ")
      } else {
        setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      }

      setIsSelectMachineModalOpen(false)
      setSelectedOrderId(null)
    } catch (error) {
      console.error("Error saving machine selection:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const hasOrders = orders.length > 0

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="ออเดอร์" />

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
              <h2 className="text-xl font-semibold">แผนการผลิต (ออเดอร์)</h2>
              {hasOrders && (
                <button
                  onClick={handleAddOrder}
                  className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                >
                  เพิ่ม
                </button>
              )}
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto max-h-[660px] overflow-y-auto">
                {hasOrders ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          Lot
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ว/ด/ป
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ผลิตภัณฑ์
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          จำนวนที่สั่ง
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          จำนวนที่ผลิต
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          จำนวน QC
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ค่าไฟการผลิต
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ต้นทุนวัตถุดิบ
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ต้นทุนรวม
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ราคาขาย
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          สถานะ
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-700">
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.lot}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.date}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.product}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.orderedQuantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
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
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.qcQuantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
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
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {order.materialCost > 0 ? `${order.materialCost.toFixed(2)} บาท` : ""}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {order.totalCost > 0 ? `${order.totalCost.toFixed(2)} บาท` : ""}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {order.sellingPrice > 0 ? `${order.sellingPrice.toFixed(2)} บาท` : ""}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{order.status}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditOrder(order.id)}
                                className="text-yellow-500 hover:text-yellow-700"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-500 hover:text-red-700"
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
                  <div className="p-8 text-center">
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
