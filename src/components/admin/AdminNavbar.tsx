"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ChevronDown,
} from "lucide-react";
import { getAuthToken, logoutUser } from "@/lib/auth-helpers";
import { fetchAdminProfile } from "@/services/admin.service";

interface AdminProfile {
  username: string;
  email: string;
  avatar: string | null;
}

const NAV_SECTIONS: {
  title: string;
  items: { href: string; label: string }[];
}[] = [
  {
    title: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
  {
    title: "Management",
    items: [
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/enterprises", label: "Enterprises" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/discount", label: "Discount" },
      { href: "/admin/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Support",
    items: [{ href: "/admin/support", label: "Support" }],
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Default all sections open.
    setOpenSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      for (const sec of NAV_SECTIONS) {
        if (next[sec.title] === undefined) next[sec.title] = true;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      document.documentElement.style.setProperty(
        "--admin-sidebar-w",
        "264px",
      );
    } catch {}
  }, []);

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.replace('/signin');
          return;
        }

        try {
          const data = await fetchAdminProfile();
          setAdminProfile(data);
        } catch {
          console.error("Failed to fetch admin profile");
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminProfile();
  }, [router]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    try {
      localStorage.removeItem('verified');
    } catch {}
    router.replace('/signin');
  };

  // Get initials from username or email
  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const initials = getInitials(adminProfile?.username, adminProfile?.email);

  return (
    <>
      {/* Top Header - Full Width */}
      <header className="fixed top-0 left-0 right-0 h-16 z-30 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between h-full px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-500 shadow-sm" />
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-slate-900">
                HanalaFood
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                Admin Console
              </div>
            </div>
          </Link>

          {/* Admin Info */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div>
                  <div className="w-20 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            ) : adminProfile?.avatar ? (
              <>
                <Image
                  src={adminProfile.avatar}
                  alt={adminProfile.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {adminProfile.username}
                  </p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-fuchsia-500 to-rose-500 shadow-sm ring-2 ring-white">
                  <span className="text-white text-sm font-semibold">{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {adminProfile?.username || adminProfile?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - Light, sectioned */}
      <aside
        className="fixed top-16 left-0 h-[calc(100vh-64px)] w-[264px] bg-white border-r border-slate-200 z-40"
      >
        <div className="h-full flex flex-col">
          {/* Navigation */}
          <nav className="flex-1 py-2 overflow-y-auto bg-white">
            {NAV_SECTIONS.map((sec) => {
              const isOpen = openSections[sec.title] !== false;
              return (
                <div key={sec.title} className="pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((prev) => ({
                        ...prev,
                        [sec.title]: !isOpen,
                      }))
                    }
                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                      isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="py-1">
                      {sec.items.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              prefetch
                              className={`relative block px-4 py-2 pl-9 text-sm transition-colors ${
                                active
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              {/* Active indicator */}
                              <span
                                className={`absolute left-0 top-1 bottom-1 w-1 bg-blue-600 transition-opacity ${
                                  active ? "opacity-100" : "opacity-0"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="font-medium">{label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-slate-200 bg-white">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                {adminProfile?.avatar ? (
                  <Image
                    src={adminProfile.avatar}
                    alt={adminProfile.username}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {adminProfile?.username || "Admin"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {adminProfile?.email || ""}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
