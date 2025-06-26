"use client"

import { useState, useEffect } from "react"
import { Menu, RefreshCw, AlertCircle } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import AddMaterialModal from "./add-material-modal"
import DeleteMaterialModal from "./delete-material-modal"
import type { Material, MaterialHistory } from "@/types/material"
import {
  getMaterials,
  getMaterialHistory,
  addMaterial,
  addMaterialHistory,
  deleteMaterial,
} from "@/services/material-service"

export default function MaterialsManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialHistory, setMaterialHistory] = useState<MaterialHistory[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch materials and history on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const materialsData = await getMaterials()
        const historyData = await getMaterialHistory()

        setMaterials(materialsData)
        setMaterialHistory(historyData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // เพิ่มฟังก์ชันสำหรับรีเฟรชข้อมูลวัตถุดิบ
  const refreshMaterialsData = async () => {
    try {
      setIsRefreshing(true)
      const materialsData = await getMaterials()
      const historyData = await getMaterialHistory()

      setMaterials(materialsData)
      setMaterialHistory(historyData)
      setError(null)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleAddMaterial = () => {
    setIsAddModalOpen(true)
  }

  const handleSaveMaterial = async (newMaterial: Omit<Material, "id">) => {
    try {
      // เพิ่มหรืออัปเดตวัตถุดิบใน Firestore
      const materialId = await addMaterial(newMaterial)

      // ตรวจสอบว่าเป็นการเพิ่มใหม่หรืออัปเดตข้อมูลเดิม
      const existingIndex = materials.findIndex((m) => m.name === newMaterial.name)

      if (existingIndex >= 0) {
        // ถ้าเป็นการอัปเดตข้อมูลเดิม
        const updatedMaterials = [...materials]
        updatedMaterials[existingIndex] = {
          ...updatedMaterials[existingIndex],
          quantity: updatedMaterials[existingIndex].quantity + newMaterial.quantity,
          date: newMaterial.date,
          pricePerUnit: newMaterial.pricePerUnit || updatedMaterials[existingIndex].pricePerUnit,
        }

        setMaterials(updatedMaterials)
      } else {
        // ถ้าเป็นการเพิ่มข้อมูลใหม่
        const materialWithId: Material = {
          id: materialId,
          ...newMaterial,
        }

        setMaterials([materialWithId, ...materials])
      }

      // Only create history entry if quantity is greater than 0
      if (newMaterial.quantity > 0) {
        // Create a history entry for adding the material
        const historyEntry: Omit<MaterialHistory, "id"> = {
          action: "เพิ่ม",
          date: newMaterial.date,
          name: newMaterial.name,
          quantity: newMaterial.quantity,
          unit: newMaterial.unit,
        }

        // Add the history entry to Firestore
        const historyId = await addMaterialHistory(historyEntry)

        // Add the history to local state with the new ID
        const historyWithId: MaterialHistory = {
          id: historyId,
          ...historyEntry,
        }

        setMaterialHistory([historyWithId, ...materialHistory])
      }

      // ปิด modal หลังจากบันทึกข้อมูลเสร็จ
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error saving material:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleDeleteMaterial = (id: string) => {
    setSelectedMaterialId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteMaterial = async () => {
    if (selectedMaterialId) {
      try {
        // หาข้อมูลวัตถุดิบที่จะลบ
        const materialToDelete = materials.find((material) => material.id === selectedMaterialId)

        if (materialToDelete) {
          // สร้างประวัติการลบ
          const historyEntry: Omit<MaterialHistory, "id"> = {
            action: "ลบ",
            date: new Date().toLocaleDateString("th-TH", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            name: materialToDelete.name,
            quantity: materialToDelete.quantity,
            unit: materialToDelete.unit,
          }

          // บันทึกประวัติลงใน Firestore
          const historyId = await addMaterialHistory(historyEntry)

          // เพิ่มประวัติใน local state
          const historyWithId: MaterialHistory = {
            id: historyId,
            ...historyEntry,
          }
          setMaterialHistory([historyWithId, ...materialHistory])
        }

        // ลบข้อมูลจาก Firestore
        await deleteMaterial(selectedMaterialId)

        // ลบข้อมูลจาก local state
        setMaterials(materials.filter((material) => material.id !== selectedMaterialId))
        console.log("Material deleted successfully")

        // ปิด modal
        setIsDeleteModalOpen(false)
        setSelectedMaterialId(null)
      } catch (error) {
        console.error("Error deleting material:", error)
        setError("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      }
    }
  }

  const hasMaterials = materials.length > 0
  const hasMaterialHistory = materialHistory.length > 0

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
      <Sidebar isOpen={isSidebarOpen} activePage="ข้อมูลวัตถุดิบ" />

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

          <div className="max-w-7xl mx-auto">
            {/* Current Materials Inventory */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold bg-blue-100 p-2 rounded-md">ยอดคงเหลือวัตถุดิบ</h2>
                  <button
                    onClick={refreshMaterialsData}
                    className="ml-2 p-2 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center"
                    title="รีเฟรชข้อมูล"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? (
                      <span className="ml-1 text-sm">กำลังรีเฟรช...</span>
                    ) : (
                      <span className="ml-1 text-sm">รีเฟรชข้อมูล</span>
                    )}
                  </button>
                </div>
                {hasMaterials && (
                  <button
                    onClick={handleAddMaterial}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  {hasMaterials ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            ว/ด/ป
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            วัตถุดิบ
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            ปริมาณ
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            หน่วย
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            ราคาต่อหน่วย
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {materials.map((material) => (
                          <tr key={material.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{material.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{material.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                              {material.quantity.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{material.unit}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                              {material.pricePerUnit.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ลบ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 mb-4">ยังไม่มีรายการวัตถุดิบ</p>
                      <button
                        onClick={handleAddMaterial}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
                      >
                        เพิ่มวัตถุดิบแรก
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Material History */}
            <div>
              <h2 className="text-xl font-semibold bg-yellow-100 p-2 rounded-md mb-4">ประวัติการเพิ่ม/ลด/ลบวัตถุดิบ</h2>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-[600px] overflow-y-auto">
                    {hasMaterialHistory ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              ประวัติ
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              ว/ด/ป
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              วัตถุดิบ
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              ปริมาณ
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                              หน่วย
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {materialHistory.map((history) => (
                            <tr key={history.id} className="hover:bg-gray-50">
                              <td
                                className={`px-4 py-2 whitespace-nowrap text-sm ${
                                  history.action === "เพิ่ม"
                                    ? "text-green-500"
                                    : history.action === "ลด"
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                }`}
                              >
                                {history.action}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{history.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{history.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                {history.quantity.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{history.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">ยังไม่มีประวัติการเพิ่ม/ลด/ลบวัตถุดิบ</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveMaterial} />

      {/* Delete Material Modal */}
      <DeleteMaterialModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteMaterial}
      />
    </div>
  )
}
