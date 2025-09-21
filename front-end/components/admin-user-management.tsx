"use client"

import { useState, useEffect, memo } from "react"
import { Menu, Users, Shield, LogOut, User, Plus, Edit, Trash2, RefreshCw, Search, Filter } from "lucide-react"
import Sidebar from "./sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { adminService, AdminUser, CreateUserData, UpdateUserData } from "@/services/admin-service"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
          <Users className="h-6 w-6 mr-2" />
          จัดการผู้ใช้
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

export default function AdminUserManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateUserData & { isActive: boolean }>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "user",
    isActive: true
  })
  const [editForm, setEditForm] = useState<UpdateUserData>({})
  
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await adminService.getUsers()
      setUsers(usersData)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้")
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => 
        statusFilter === "active" ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    try {
      if (!createForm.username || !createForm.email || !createForm.password || !createForm.fullName) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกข้อมูลให้ครบถ้วน",
          variant: "destructive",
        })
        return
      }

      await adminService.createUser(createForm)
      toast({
        title: "สร้างผู้ใช้สำเร็จ",
        description: `ผู้ใช้ ${createForm.username} ถูกสร้างเรียบร้อยแล้ว`,
      })
      
      setCreateForm({
        username: "",
        email: "",
        password: "",
        fullName: "",
        role: "user",
        isActive: true
      })
      setCreateDialogOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.message || "ไม่สามารถสร้างผู้ใช้ได้",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      await adminService.updateUser(selectedUser.id, editForm)
      toast({
        title: "อัปเดตผู้ใช้สำเร็จ",
        description: `ข้อมูลผู้ใช้ ${selectedUser.username} ถูกอัปเดตเรียบร้อยแล้ว`,
      })
      
      setEditForm({})
      setSelectedUser(null)
      setEditDialogOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.message || "ไม่สามารถอัปเดตผู้ใช้ได้",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await adminService.deleteUser(selectedUser.id)
      toast({
        title: "ลบผู้ใช้สำเร็จ",
        description: `ผู้ใช้ ${selectedUser.username} ถูกลบเรียบร้อยแล้ว`,
      })
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.message || "ไม่สามารถลบผู้ใช้ได้",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setEditForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} activePage="User Management" onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="User Management" onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">จัดการผู้ใช้ในระบบ</h2>
                    <p className="text-gray-600">เพิ่ม แก้ไข ลบ และจัดการผู้ใช้ทั้งหมด</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchUsers} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      รีเฟรช
                    </Button>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <Plus className="h-4 w-4 mr-1" />
                          เพิ่มผู้ใช้
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl p-0">
                        {/* Green Header */}
                        <div className="bg-green-400 p-4 rounded-t-lg">
                          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                            <Plus className="h-5 w-5 mr-2" />
                            เพิ่ม
                          </DialogTitle>
                        </div>
                        
                        <div className="p-6 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ชื่อผู้ใช้
                                </label>
                                <Input
                                  value={createForm.username}
                                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                                  placeholder="กรอกชื่อผู้ใช้"
                                  className="border-gray-300 focus:border-gray-500 focus:ring-green-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  อีเมล
                                </label>
                                <Input
                                  type="email"
                                  value={createForm.email}
                                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                                  placeholder="กรอกอีเมล"
                                  className="border-gray-300 focus:border-gray-500 focus:ring-green-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ชื่อเต็ม
                                </label>
                                <Input
                                  value={createForm.fullName}
                                  onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                                  placeholder="กรอกชื่อเต็ม"
                                  className="border-gray-300 focus:border-gray-500 focus:ring-green-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  รหัสผ่าน
                                </label>
                                <Input
                                  type="password"
                                  value={createForm.password}
                                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                  placeholder="กรอกรหัสผ่าน"
                                  className="border-gray-300 focus:border-gray-500 focus:ring-green-500"
                                />
                              </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  บทบาท
                                </label>
                                <Select
                                  value={createForm.role}
                                  onValueChange={(value: 'admin' | 'user') => setCreateForm({...createForm, role: value})}
                                >
                                  <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">ผู้ใช้</SelectItem>
                                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  สถานะ
                                </label>
                                <Select
                                  value={createForm.isActive ? 'active' : 'inactive'}
                                  onValueChange={(value) => setCreateForm({...createForm, isActive: value === 'active'})}
                                >
                                  <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">ใช้งานอยู่</SelectItem>
                                    <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  วันที่สร้าง
                                </label>
                                <Input
                                  value={new Date().toLocaleDateString('th-TH')}
                                  disabled
                                  className="bg-gray-100 text-gray-600"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  เข้าสู่ระบบล่าสุด
                                </label>
                                <Input
                                  value="ยังไม่เคยเข้าสู่ระบบ"
                                  disabled
                                  className="bg-gray-100 text-gray-600"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                            <Button 
                              variant="outline" 
                              onClick={() => setCreateDialogOpen(false)}
                              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                              ย้อนกลับ
                            </Button>
                            <Button 
                              onClick={handleCreateUser}
                              className="px-6 bg-green-400 hover:bg-green-500 text-gray-900 font-medium"
                            >
                              เพิ่ม
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="ค้นหาผู้ใช้..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="กรองตามบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกบทบาท</SelectItem>
                      <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                      <SelectItem value="user">ผู้ใช้</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="กรองตามสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="active">ใช้งานอยู่</SelectItem>
                      <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="p-2 md:p-4">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm">ชื่อผู้ใช้</TableHead>
                      <TableHead className="text-xs md:text-sm hidden sm:table-cell">ชื่อเต็ม</TableHead>
                      <TableHead className="text-xs md:text-sm">อีเมล</TableHead>
                      <TableHead className="text-xs md:text-sm">บทบาท</TableHead>
                      <TableHead className="text-xs md:text-sm">สถานะ</TableHead>
                      <TableHead className="text-xs md:text-sm hidden md:table-cell">วันที่สร้าง</TableHead>
                      <TableHead className="text-xs md:text-sm hidden lg:table-cell">เข้าสู่ระบบล่าสุด</TableHead>
                      <TableHead className="text-right text-xs md:text-sm">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-xs md:text-sm">{user.username}</TableCell>
                        <TableCell className="text-xs md:text-sm hidden sm:table-cell">{user.fullName}</TableCell>
                        <TableCell className="text-xs md:text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : 'default'}
                            className={`text-xs px-2 py-1 whitespace-nowrap ${
                              user.role === 'admin' 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                          >
                            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? 'default' : 'secondary'}
                            className={`text-xs px-2 py-1 whitespace-nowrap ${
                              user.isActive 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-gray-400 hover:bg-gray-500 text-white'
                            }`}
                          >
                            {user.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-xs md:text-sm hidden lg:table-cell">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'ไม่เคยเข้าสู่ระบบ'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 md:h-9 md:w-auto px-1 md:px-3"
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="hidden md:inline ml-1">แก้ไข</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              className="h-8 w-8 md:h-9 md:w-auto px-1 md:px-3 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="hidden md:inline ml-1">ลบ</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || roleFilter !== "all" || statusFilter !== "all" 
                      ? "ไม่พบผู้ใช้ที่ตรงตามเงื่อนไขการค้นหา" 
                      : "ไม่มีผู้ใช้ในระบบ"}
                  </div>
                )}
              </div>
            </Card>

            {/* Edit User Dialog - Yellow Theme */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="sm:max-w-2xl p-0">
                {/* Yellow Header */}
                <div className="bg-yellow-400 p-4 rounded-t-lg">
                  <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    แก้ไข
                  </DialogTitle>
                </div>
                
                {selectedUser && (
                  <div className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อผู้ใช้
                          </label>
                          <Input
                            value={editForm.username || ''}
                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            placeholder="กรอกชื่อผู้ใช้"
                            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            อีเมล
                          </label>
                          <Input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder="กรอกอีเมล"
                            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ชื่อเต็ม
                          </label>
                          <Input
                            value={editForm.fullName || ''}
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            placeholder="กรอกชื่อเต็ม"
                            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            บทบาท
                          </label>
                          <Select
                            value={editForm.role || 'user'}
                            onValueChange={(value: 'admin' | 'user') => setEditForm({...editForm, role: value})}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">ผู้ใช้</SelectItem>
                              <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            สถานะ
                          </label>
                          <Select
                            value={editForm.isActive === true ? 'active' : editForm.isActive === false ? 'inactive' : 'active'}
                            onValueChange={(value) => setEditForm({...editForm, isActive: value === 'active'})}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">ใช้งานอยู่</SelectItem>
                              <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            วันที่สร้าง
                          </label>
                          <Input
                            value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('th-TH') : ''}
                            disabled
                            className="bg-gray-100 text-gray-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            เข้าสู่ระบบล่าสุด
                          </label>
                          <Input
                            value={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('th-TH') : 'ไม่เคยเข้าสู่ระบบ'}
                            disabled
                            className="bg-gray-100 text-gray-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID ผู้ใช้
                          </label>
                          <Input
                            value={selectedUser.id}
                            disabled
                            className="bg-gray-100 text-gray-600 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditDialogOpen(false)}
                        className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        ย้อนกลับ
                      </Button>
                      <Button 
                        onClick={handleEditUser}
                        className="px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium"
                      >
                        บันทึก
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete User Dialog - Custom Style */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-md p-0">
                {/* Red Header */}
                <div className="bg-red-400 p-4 rounded-t-lg">
                  <DialogTitle className="text-xl font-semibold text-white text-center">
                    ลบ
                  </DialogTitle>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="text-center">
                    <p className="text-gray-800 text-lg font-medium">
                      คุณต้องการลบใช่มั้ย?
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-4 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setDeleteDialogOpen(false)}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                    >
                      ไม่ใช่
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteUser}
                      className="px-6 bg-red-400 hover:bg-red-500 text-white border border-gray-800"
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
