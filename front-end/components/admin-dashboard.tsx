"use client"

import { useState, useEffect, memo } from "react"
import { Menu, Users, Shield, BarChart3, Settings, LogOut, User, Activity, Database, Server } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { adminService, SystemStats } from "@/services/admin-service"
import Link from "next/link"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

// Memoized Header Component
const AdminHeader = memo(({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-[#7A5429] text-white p-4 flex items-center justify-between min-h-[56px]">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="block md:hidden p-1 mr-4 rounded-md hover:bg-[#7A5429] focus:outline-none focus:ring-2 focus:ring-[#7A5429]"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          หน้าหลักของผู้ดูแลระบบ
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4" />
          <span>{user?.fullName || user?.username}</span>
          <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">ADMIN</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-white hover:bg-[#7A5429]"
        >
          <LogOut className="h-4 w-4 mr-1" />
          ออกจากระบบ
        </Button>
      </div>
    </header>
  )
})

AdminHeader.displayName = 'AdminHeader'

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const statsData = await adminService.getSystemStats()
        setStats(statsData)
      } catch (err) {
        console.error("Error fetching admin stats:", err)
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const adminMenuItems = [
    { name: "หน้าหลักของผู้ดูแลระบบ", href: "/admin", icon: "Shield" },
    { name: "User Management", href: "/admin/users", icon: "Users" },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="หน้าหลักของผู้ดูแลระบบ" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="Admin Dashboard" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader toggleSidebar={toggleSidebar} />
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
      </div>
    )
  }

  // Prepare chart data
  const userRoleData = stats ? {
    labels: ['ผู้ใช้ทั่วไป', 'ผู้ดูแลระบบ'],
    datasets: [{
      data: [stats.users.regular, stats.users.admins],
      backgroundColor: ['#3b82f6', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  } : null

  const dataOverviewData = stats ? {
    labels: ['วัตถุดิบ', 'ออเดอร์', 'ธุรกรรม'],
    datasets: [{
      label: 'จำนวนข้อมูล',
      data: [stats.data.materials, stats.data.orders, stats.data.transactions],
      backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
      borderColor: ['#059669', '#d97706', '#7c3aed'],
      borderWidth: 1,
    }]
  } : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const barOptions = {
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
      <Sidebar isOpen={isSidebarOpen} activePage="หน้าหลักของผู้ดูแลระบบ" onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Admin Navigation */}
            <div className="mb-6">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Admin Panel Navigation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/users">
                    <Card className="p-4 hover:bg-blue-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <h3 className="font-semibold">จัดการผู้ใช้</h3>
                          <p className="text-sm text-gray-600">เพิ่ม แก้ไข ลบผู้ใช้</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                  <Card className="p-4 bg-gray-100 opacity-50">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-500">System Logs</h3>
                        <p className="text-sm text-gray-500">ดูประวัติการใช้งาน (เร็วๆ นี้)</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>

            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border border-blue-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats?.users.total || 0}</p>
                    <p className="text-xs text-blue-500">ผู้ใช้ที่ใช้งาน: {stats?.users.active || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-green-200">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">ผู้ดูแลระบบ</h3>
                    <p className="text-2xl font-bold text-green-600">{stats?.users.admins || 0}</p>
                    <p className="text-xs text-green-500">ผู้ใช้ทั่วไป: {stats?.users.regular || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-orange-200">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">ข้อมูลทั้งหมด</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {(stats?.data.materials || 0) + (stats?.data.orders || 0) + (stats?.data.transactions || 0)}
                    </p>
                    <p className="text-xs text-orange-500">รายการในระบบ</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-purple-200">
                <div className="flex items-center">
                  <Server className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Uptime</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats ? Math.floor(stats.system.uptime / 3600) : 0}h
                    </p>
                    <p className="text-xs text-purple-500">ชั่วโมงที่ทำงาน</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">สัดส่วนผู้ใช้</h3>
                <div className="h-64">
                  {userRoleData && (
                    <Pie options={chartOptions} data={userRoleData} />
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">ภาพรวมข้อมูลในระบบ</h3>
                <div className="h-64">
                  {dataOverviewData && (
                    <Bar options={barOptions} data={dataOverviewData} />
                  )}
                </div>
              </Card>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">ข้อมูลระบบ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Node.js Version</span>
                    <span className="text-gray-600 font-mono">{stats?.system.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Memory Usage</span>
                    <span className="text-gray-600">
                      {stats ? Math.round(stats.system.memoryUsage.heapUsed / 1024 / 1024) : 0} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Uptime</span>
                    <span className="text-gray-600">
                      {stats ? `${Math.floor(stats.system.uptime / 3600)}h ${Math.floor((stats.system.uptime % 3600) / 60)}m` : '0h 0m'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">ข้อมูลรายละเอียด</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">วัตถุดิบ</span>
                    <span className="text-blue-600 font-bold">{stats?.data.materials || 0} รายการ</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">ออเดอร์</span>
                    <span className="text-orange-600 font-bold">{stats?.data.orders || 0} รายการ</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">ธุรกรรม</span>
                    <span className="text-purple-600 font-bold">{stats?.data.transactions || 0} รายการ</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
