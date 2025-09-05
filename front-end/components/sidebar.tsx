import Link from "next/link"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  activePage?: string
  onClose?: () => void // เพิ่ม prop สำหรับปิด sidebar
}

export default function Sidebar({ isOpen, activePage = "รายรับ - รายจ่าย", onClose }: SidebarProps) {
  const menuItems = [
    { name: "หน้าหลัก", href: "/" },
    { name: "รายรับ - รายจ่าย", href: "/income-expense" },
    { name: "ข้อมูลวัตถุดิบ", href: "/materials" },
    { name: "ออเดอร์", href: "/orders" },
    { name: "สรุปรายงาน", href: "/reports" },
  ]

  return (
    <>
      {/* Overlay เฉพาะ mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-0 md:hidden"
          onClick={onClose}
          aria-label="ปิดเมนู"
        />
      )}
      <aside
        className={cn(
          "text-white w-64 flex-shrink-0 transition-all duration-300 ease-in-out fixed md:static h-full z-10",
          "backdrop-blur-md",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{
          backgroundImage: "url('/leaf_dish.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay layer สำหรับทำให้ข้อความอ่านง่ายขึ้น */}
        <div className="absolute inset-0 bg-[#A97539]/80 backdrop-blur-sm"></div>
        
        {/* Content layer */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex items-center justify-center h-16 border-b border-[#8B5A2B]/60">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">ระบบบันทึกและคำนวณต้นทุนจานใบไม้</h2>
          </div>
          <nav className="mt-6 flex-1">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 rounded-md transition-all duration-200",
                      "hover:bg-[#8B5A2B]/80 hover:backdrop-blur-sm",
                      "text-white drop-shadow-md",
                      item.name === activePage && "bg-[#8B5A2B]/90 backdrop-blur-sm shadow-lg",
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
    </>
  )
}