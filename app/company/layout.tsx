"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import RequireAuth from "@/components/RequireAuth";

const COMPANY_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/company/dashboard" },
  { icon: "🏔️", label: "My Tours", href: "/company/tours" },
  { icon: "📋", label: "Bookings", href: "/company/bookings" },
  { icon: "💰", label: "Revenue", href: "/company/revenue" },
  { icon: "⭐", label: "Reviews", href: "/company/reviews" },
  { icon: "👥", label: "Customers", href: "/company/customers" },
  { icon: "➕", label: "Add Tour", href: "/company/tours/new" },
  { icon: "⚙️", label: "Settings", href: "/company/settings" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <RequireAuth role="company">
      <div className="dashboard-layout">
        <Sidebar items={COMPANY_NAV} role="company" onCollapseChange={setCollapsed} />
        <main className="main-content" style={{ marginLeft: sidebarWidth }}>
          {children}
        </main>
        <Chatbot />
      </div>
    </RequireAuth>
  );
}
