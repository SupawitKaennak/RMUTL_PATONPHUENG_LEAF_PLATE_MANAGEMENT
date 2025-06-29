import Link from "next/link"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  activePage?: string
}

export default function Sidebar({ isOpen, activePage = "รายรับ - รายจ่าย" }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "รายรับ - รายจ่าย", href: "/income-expense" },
    { name: "ข้อมูลวัตถุดิบ", href: "/materials" },
    { name: "ออเดอร์", href: "/orders" },
    { name: "สรุปรายงาน", href: "/reports" },
  ]

  return (
    <aside
      className={cn(
        "bg-blue-300 text-white w-64 flex-shrink-0 transition-all duration-300 ease-in-out fixed md:static h-full z-10",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-blue-400">
          <h2 className="text-xl font-bold">ระบบบันทึกและคำนวณต้นทุนจานใบไม้</h2>
        </div>
        <nav className="mt-6 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-md hover:bg-blue-400 transition-colors",
                    item.name === activePage && "bg-blue-500",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
