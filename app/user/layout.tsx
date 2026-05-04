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
  { icon: "👥", label: "Group Travel", href: "/user/group" },
  { icon: "⭐", label: "My Reviews", href: "/user/reviews" },
  { icon: "🛡️", label: "Safety Map", href: "/user/safety" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <RequireAuth role="user">
      <div className="dashboard-layout">
        <Sidebar items={USER_NAV} role="user" onCollapseChange={setCollapsed} />
        <main className="main-content" style={{ marginLeft: sidebarWidth }}>
          {children}
        </main>
        <Chatbot />
      </div>
    </RequireAuth>
  );
}
