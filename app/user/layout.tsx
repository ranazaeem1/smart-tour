"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import RequireAuth from "@/components/RequireAuth";

const USER_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/user/dashboard" },
  { icon: "💰", label: "Budget Tracker", href: "/user/budget" },
  { icon: "🗺️", label: "AI Planner", href: "/user/planner" },
  { icon: "🏔️", label: "Browse Tours", href: "/user/tours" },
  { icon: "📋", label: "My Bookings", href: "/user/bookings" },
  { icon: "⭐", label: "My Reviews", href: "/user/reviews" },
  { icon: "🛡️", label: "Safety Map", href: "/user/safety" },
  { icon: "🏢", label: "Register Company", href: "/user/register-company" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <RequireAuth role="user">
      <div className="dashboard-layout">
        {/* Mobile Menu Toggle */}
        <button 
          className="btn btn-secondary btn-icon mobile-only" 
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, boxShadow: "var(--shadow-lg)" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "☰" : "✕"}
        </button>

        <Sidebar items={USER_NAV} role="user" onCollapseChange={setCollapsed} />
        <main className="main-content" style={{ paddingLeft: sidebarWidth }}>
          {children}
        </main>
        <Chatbot />
      </div>
    </RequireAuth>
  );
}
