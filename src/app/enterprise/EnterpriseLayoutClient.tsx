"use client";

import EnterpriseNavBar from "@/components/enterprise/EnterpriseNavbar";
import React from "react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EnterpriseNavBar />

      {/* Main Content */}
      <main
        style={
          {
            ["--ui-header-height" as any]: "56px",
            ["--ui-sidebar-width" as any]: "181px",
          } as React.CSSProperties
        }
        className="ml-[var(--ui-sidebar-width)] pt-[var(--ui-header-height)] min-h-screen bg-gray-50"
      >
        <div className="w-full h-full p-3 sm:p-4">{children}</div>
      </main>
    </>
  );
}
