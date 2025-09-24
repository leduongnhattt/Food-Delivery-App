"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  SquarePlus,
  LogOut,
  Package,
  TicketPercent,
  BarChart3,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { log } from "console";

const menuItems = [
  { href: "/enterprise/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/enterprise/menu", label: "Menu", icon: Menu },
  { href: "/enterprise/product", label: "Product", icon: Package },
  { href: "/enterprise/add-product", label: "Add Product", icon: SquarePlus },
  { href: "/enterprise/discount", label: "Discount", icon: TicketPercent },
  { href: "/enterprise/profile", label: "Profile", icon: User },
];

export default function EnterpriseNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    logout();
  };

  const firsrTwoLetters = user?.username ? user.username.slice(0, 2).toUpperCase() : "";

  return (
    <>
      {/* Top Header - Full Width */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <div>
            <h2 className="text-xl font-bold text-blue-600">Enterprise Name</h2>
          </div>

          {/* Enterprise Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{ firsrTwoLetters }</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{ user?.username }</p>
              <p className="text-xs text-gray-500">Enterprise</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Below Header */}
      <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 z-40">
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative
                      ${
                        active
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        active ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-4 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
