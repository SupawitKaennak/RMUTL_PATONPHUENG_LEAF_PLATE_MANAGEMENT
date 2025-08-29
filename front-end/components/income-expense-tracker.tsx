"use client"

import { useState, useEffect, memo } from "react"
import { Menu, Plus, Filter, RefreshCw, TrendingUp, TrendingDown, DollarSign, Calendar, Search, X, User, LogOut, AlertCircle } from "lucide-react"
import Sidebar from "./sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/services/transaction-service"
import type { Transaction } from "@/types/transaction"
import AddTransactionModal from "./add-transaction-modal"
import EditTransactionModal from "./edit-transaction-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import TransactionTable from "./transaction-table"

// Memoized Header Component
const IncomeExpenseHeader = memo(({ toggleSidebar }: { toggleSidebar: () => void }) => {
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
        <h1 className="text-xl font-semibold">รายรับ-รายจ่าย</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4" />
          <span>{user?.fullName || user?.username}</span>
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

IncomeExpenseHeader.displayName = 'IncomeExpenseHeader'

export default function IncomeExpenseTracker() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [filterDate, setFilterDate] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterSearch, setFilterSearch] = useState("")
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Fetch transactions on component mount
  useEffect(() => {
    // รอให้ auth loading เสร็จก่อน แล้วค่อยตรวจสอบ authentication
    if (!authLoading) {
      fetchTransactions()
    }
  }, [isAuthenticated, authLoading])

  const fetchTransactions = async () => {
    // ตรวจสอบว่า user ได้ login แล้วหรือยัง
    if (!isAuthenticated) {
      console.log("🔒 User not authenticated, skipping transactions fetch")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("💰 Fetching transactions...")
      const transactionsData = await getTransactions()
      setTransactions(transactionsData)
      setFilteredTransactions(transactionsData)
      setError(null)
      console.log("✅ Transactions fetched successfully")
    } catch (error) {
      console.error("❌ Error fetching transactions:", error)
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  const refreshTransactionsData = async () => {
    try {
      setIsRefreshing(true)
      await fetchTransactions()
    } catch (error) {
      console.error("Error refreshing transactions:", error)
      setError("ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const applyFilter = () => {
    let filtered = [...transactions]

    if (filterDate) {
      filtered = filtered.filter(transaction => {
        // Parse transaction date (format: DD/MM/YY)
        const [day, month, year] = transaction.date.split('/')
        const transactionDay = parseInt(day)
        const transactionMonth = parseInt(month)
        const transactionYear = parseInt(year) + 2500 // Convert YY to YYYY (assuming 25xx)

        // Parse filter date (format: YYYY-MM-DD from date picker)
        const filterDateObj = new Date(filterDate)
        const filterDay = filterDateObj.getDate()
        const filterMonth = filterDateObj.getMonth() + 1
        const filterYear = filterDateObj.getFullYear()

        // Convert filter year to Buddhist era for comparison
        const filterBuddhistYear = filterYear + 543

        return transactionDay === filterDay && 
               transactionMonth === filterMonth && 
               transactionYear === filterBuddhistYear
      })
    }

    if (filterMonth) {
      filtered = filtered.filter(transaction => {
        const [, month] = transaction.date.split('/')
        const transactionMonth = parseInt(month)
        return transactionMonth === parseInt(filterMonth)
      })
    }

    if (filterYear) {
      filtered = filtered.filter(transaction => {
        const [, , year] = transaction.date.split('/')
        const transactionYear = parseInt(year) + 2500 // Convert YY to YYYY
        const buddhistYear = parseInt(filterYear)
        return transactionYear === buddhistYear
      })
    }

    if (filterSearch) {
      const searchTerm = filterSearch.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm) ||
        transaction.notes.toLowerCase().includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm)
      )
    }

    setFilteredTransactions(filtered)
  }

  const clearFilter = () => {
    setFilterDate("")
    setFilterMonth("")
    setFilterYear("")
    setFilterSearch("")
    setFilteredTransactions(transactions)
  }

  const calculateBalance = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return transaction.isIncome ? total + transaction.amount : total - transaction.amount
    }, 0)
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

  // Generate month options dynamically
  const generateMonthOptions = () => {
    const months = [
      { value: "1", label: "มกราคม" },
      { value: "2", label: "กุมภาพันธ์" },
      { value: "3", label: "มีนาคม" },
      { value: "4", label: "เมษายน" },
      { value: "5", label: "พฤษภาคม" },
      { value: "6", label: "มิถุนายน" },
      { value: "7", label: "กรกฎาคม" },
      { value: "8", label: "สิงหาคม" },
      { value: "9", label: "กันยายน" },
      { value: "10", label: "ตุลาคม" },
      { value: "11", label: "พฤศจิกายน" },
      { value: "12", label: "ธันวาคม" }
    ]
    
    return months.map(month => (
      <option key={month.value} value={month.value}>
        {month.label}
      </option>
    ))
  }

  // Auto-apply filter when filter values change
  useEffect(() => {
    if (transactions.length > 0) {
      applyFilter()
    }
  }, [filterDate, filterMonth, filterYear, filterSearch, transactions])

  const handleAddTransaction = () => {
    setShowAddModal(true)
  }

  const handleSaveTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    try {
      // Add the transaction to Firestore
      const transactionId = await addTransaction(newTransaction)

      // Add the transaction to local state with the new ID
      const transactionWithId: Transaction = {
        id: transactionId,
        ...newTransaction,
      }

      const updatedTransactions = [transactionWithId, ...transactions]
      setTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions)
    } catch (error) {
      console.error("Error saving transaction:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setEditingTransaction(transaction)
    }
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      // Update the transaction in Firestore
      await updateTransaction(updatedTransaction.id, updatedTransaction)

      // Update the transaction in local state
      const updatedTransactions = transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
      setTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions)
    } catch (error) {
      console.error("Error updating transaction:", error)
      setError("ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setDeletingTransaction(transaction)
    }
  }

  const confirmDelete = async () => {
    if (deletingTransaction) {
      try {
        // Delete the transaction from Firestore
        await deleteTransaction(deletingTransaction.id)

        // Remove the transaction from local state
        const updatedTransactions = transactions.filter((t) => t.id !== deletingTransaction.id)
        setTransactions(updatedTransactions)
        setFilteredTransactions(updatedTransactions)

        // Close the modal and reset state
        setDeletingTransaction(null)
      } catch (error) {
        console.error("Error deleting transaction:", error)
        setError("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      }
    }
  }

  const hasTransactions = filteredTransactions.length > 0

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} activePage="รายรับ - รายจ่าย" onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <IncomeExpenseHeader toggleSidebar={toggleSidebar} />

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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-md">
                  <span className="text-xl font-semibold bg-blue-100">ยอดคงเหลือ : {calculateBalance().toLocaleString()} บาท</span>
                </div>
                <button
                  onClick={refreshTransactionsData}
                  className="p-2 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center"
                  title="รีเฟรชข้อมูล"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? (
                    <span className="ml-1 text-sm">กำลังรีเฟรช...</span>
                  ) : null}
                </button>
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

              {hasTransactions && (
                <button
                  onClick={handleAddTransaction}
                  className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-md"
                >
                  เพิ่มรายการ
                </button>
              )}
            </div>

            {/* Filter Section */}
            {isFilterOpen && (
              <div className="bg-white p-4 rounded-md shadow-sm mb-4 border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">ค้นหา:</label>
                    <input
                      type="text"
                      placeholder="ค้นหารายการ, ประเภท, หมายเหตุ..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">วันที่:</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">เดือน:</label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    >
                      <option value="">ทั้งหมด</option>
                      {generateMonthOptions()}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">ปี:</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    >
                      <option value="">ทั้งหมด</option>
                      {generateYearOptions()}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="text-xs text-gray-500">
                      {filterDate || filterMonth || filterYear || filterSearch ? 
                        `กรองแล้ว: ${filteredTransactions.length} รายการ` : 
                        `ทั้งหมด: ${transactions.length} รายการ`
                      }
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={clearFilter}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm w-full"
                    >
                      ล้าง
                    </button>
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
            ) : hasTransactions ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto max-h-[850px] overflow-y-auto">
                  <TransactionTable
                    transactions={filteredTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">ยังไม่มีรายการรายรับ-รายจ่าย</p>
                  <button
                    onClick={handleAddTransaction}
                    className="bg-teal-400 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    เพิ่มรายการแรก
                  </button>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveTransaction}
      />

      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        transaction={editingTransaction}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={confirmDelete}
        title="ลบรายการ"
        message={`คุณต้องการลบรายการ "${deletingTransaction?.description}" หรือไม่?`}
      />
    </div>
  )
}
