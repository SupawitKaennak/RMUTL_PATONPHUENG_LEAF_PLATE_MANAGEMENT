"use client"

import type { Transaction } from "@/types/transaction"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-blue-100">
        <tr>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            ว/ด/ป
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            รายการ
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            ประเภท
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            จำนวนเงิน
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            จำนวน
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            รับ
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            จ่าย
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            หมายเหตุ
          </th>
          <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            ACTION
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="hover:bg-gray-50">
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.date}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.description}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.category}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.amount.toLocaleString()}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.quantity}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
              {transaction.isIncome ? transaction.amount.toLocaleString() : ""}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">
              {!transaction.isIncome ? transaction.amount.toLocaleString() : ""}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{transaction.notes}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">
              <div className="flex space-x-2">
                <button onClick={() => onEdit(transaction.id)} className="text-yellow-500 hover:text-yellow-700">
                  แก้ไข
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-red-500 hover:text-red-700">
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
