"use client"

import { useState, useEffect } from "react"
import { Menu, AlertCircle, RefreshCw } from "lucide-react"
import Sidebar from "./sidebar"
import TransactionTable from "./transaction-table"
import AddTransactionModal from "./add-transaction-modal"
import EditTransactionModal from "./edit-transaction-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import type { Transaction } from "@/types/transaction"
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/services/transaction-service"

export default function IncomeExpenseTracker() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const transactionsData = await getTransactions()
      setTransactions(transactionsData)
      setError(null)
    } catch (error) {
      console.error("Error fetching transactions:", error)
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

  const calculateBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.isIncome ? total + transaction.amount : total - transaction.amount
    }, 0)
  }

  const handleAddTransaction = () => {
    setIsAddModalOpen(true)
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

      setTransactions([transactionWithId, ...transactions])
    } catch (error) {
      console.error("Error saving transaction:", error)
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setSelectedTransaction(transaction)
      setIsEditModalOpen(true)
    }
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      // Update the transaction in Firestore
      await updateTransaction(updatedTransaction.id, updatedTransaction)

      // Update the transaction in local state
      setTransactions(
        transactions.map((transaction) =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
        ),
      )
    } catch (error) {
      console.error("Error updating transaction:", error)
      setError("ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        // Delete the transaction from Firestore
        await deleteTransaction(transactionToDelete)

        // Remove the transaction from local state
        setTransactions(transactions.filter((transaction) => transaction.id !== transactionToDelete))

        // Close the modal and reset state
        setIsDeleteModalOpen(false)
        setTransactionToDelete(null)
      } catch (error) {
        console.error("Error deleting transaction:", error)
        setError("ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      }
    }
  }

  const hasTransactions = transactions.length > 0

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
      <Sidebar isOpen={isSidebarOpen} activePage="รายรับ - รายจ่าย" onClose={() => setIsSidebarOpen(false)} />

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

          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-md">
                  <span className="text-lg">ยอดคงเหลือ : {calculateBalance().toLocaleString()} บาท</span>
                </div>
                <button
                  onClick={refreshTransactionsData}
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

              {hasTransactions && (
                <button
                  onClick={handleAddTransaction}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
                >
                  เพิ่ม
                </button>
              )}
            </div>

            {hasTransactions ? (
              <div className="overflow-hidden rounded-lg shadow">
                <div className="max-h-[600px] overflow-y-auto">
                  <TransactionTable
                    transactions={transactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">ยังไม่มีรายการรายรับ-รายจ่าย</p>
                <button
                  onClick={handleAddTransaction}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  เพิ่มรายการแรก
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTransaction}
        transaction={selectedTransaction}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="ลบรายการ"
        message="คุณต้องการลบรายการนี้ใช่หรือไม่?"
      />
    </div>
  )
}
