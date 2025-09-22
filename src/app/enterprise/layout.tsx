import "../globals.css"
import type { Metadata } from "next"
import React from "react"
import AdminLayoutClient from "./EnterpriseLayoutClient"

export const metadata: Metadata = {
  title: "Enterprise - HanalaFood",
  description: "Enterprise Dashboard for HanalaFood",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white">
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </body>
    </html>
  )
}