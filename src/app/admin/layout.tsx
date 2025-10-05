import "../globals.css"
import type { Metadata } from "next"
import React from "react"
import AdminLayoutClient from "./AdminLayoutClient"

export const metadata: Metadata = {
  title: "Admin - HanalaFood",
  description: "Admin Dashboard for HanalaFood",
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