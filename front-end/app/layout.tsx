import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { MaterialProvider } from "@/components/material-provider"

export const metadata: Metadata = {
  title: "RMUTL_PATONPHUENG_LEAF_PLATE_MANAGEMENT",
  description: "Track income and expenses",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MaterialProvider>
          {children}
        </MaterialProvider>
      </body>
    </html>
  )
}
