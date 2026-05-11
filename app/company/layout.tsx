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
  { icon: "⚙️", label: "Settings", href: "/company/settings" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <RequireAuth role="company">
      <div className="dashboard-layout">
        {/* Mobile Menu Toggle */}
        <button 
          className="btn btn-secondary btn-icon mobile-only" 
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, boxShadow: "var(--shadow-lg)" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "✕"}
        </button>

        <Sidebar items={COMPANY_NAV} role="company" onCollapseChange={setCollapsed} />
        <main className="main-content" style={{ paddingLeft: sidebarWidth }}>
          {children}
        </main>
        <Chatbot />
      </div>
    </RequireAuth>
  );
}
