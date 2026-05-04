"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RequireAuth from "@/components/RequireAuth";

const ADMIN_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "👥", label: "Users", href: "/admin/users" },
  { icon: "🏢", label: "Companies", href: "/admin/companies" },
  { icon: "🏔️", label: "All Tours", href: "/admin/tours" },
  { icon: "📋", label: "Bookings", href: "/admin/bookings" },
  { icon: "💰", label: "Revenue", href: "/admin/revenue" },
  { icon: "⭐", label: "Reviews", href: "/admin/reviews" },
  { icon: "🛡️", label: "Safety Alerts", href: "/admin/safety" },
  { icon: "📊", label: "Analytics", href: "/admin/analytics" },
  { icon: "⚙️", label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <RequireAuth role="admin">
      <div className="dashboard-layout">
        <Sidebar items={ADMIN_NAV} role="admin" onCollapseChange={setCollapsed} />
        <main className="main-content" style={{ marginLeft: sidebarWidth }}>
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
