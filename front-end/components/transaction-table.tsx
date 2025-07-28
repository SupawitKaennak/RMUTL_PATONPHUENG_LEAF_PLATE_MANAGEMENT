"use client"

import type { Transaction } from "@/types/transaction"

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  return (
    <table className="w-full">
      <thead className="bg-blue-100">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ว/ด/ป
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            รายการ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ประเภท
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            จำนวนเงิน
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            จำนวน
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            รับ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            จ่าย
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            หมายเหตุ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            การดำเนินการ
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.date}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.amount.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.quantity}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
              {transaction.isIncome ? transaction.amount.toLocaleString() : ""}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
              {!transaction.isIncome ? transaction.amount.toLocaleString() : ""}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.notes}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button onClick={() => onEdit(transaction.id)} className="text-yellow-500 hover:text-blue-900">
                  แก้ไข
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-red-600 hover:text-red-900">
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
