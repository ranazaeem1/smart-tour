"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import Chatbot from "@/components/Chatbot";
import RequireAuth from "@/components/RequireAuth";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wallet, 
  Map, 
  Mountain, 
  CalendarCheck, 
  Star, 
  ShieldAlert
} from 'lucide-react';

const USER_NAV = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/user/dashboard" },
  { icon: <MessageSquare size={20} />, label: "Messages", href: "/user/chat/list" },
  { icon: <Wallet size={20} />, label: "Budget Tracker", href: "/user/budget" },
  { icon: <Map size={20} />, label: "AI Planner", href: "/user/planner" },
  { icon: <Mountain size={20} />, label: "Browse Tours", href: "/user/tours" },
  { icon: <CalendarCheck size={20} />, label: "My Bookings", href: "/user/bookings" },
  { icon: <Star size={20} />, label: "My Reviews", href: "/user/reviews" },
  { icon: <ShieldAlert size={20} />, label: "Safety Map", href: "/user/safety" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  
  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const currentItem = USER_NAV.find(item => pathname.startsWith(item.href));
  const pageTitle = currentItem?.label || "Dashboard";

  return (
    <RequireAuth role="user">
      <div className="min-h-screen bg-[var(--background)] flex font-sans overflow-x-hidden transition-colors duration-300">
        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150] lg:hidden animate-fade"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 z-[200] lg:relative transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <Sidebar 
            items={USER_NAV} 
            role="user" 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
          <TopNav 
            title={pageTitle} 
            onMenuClick={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade overflow-x-hidden">
            {children}
          </main>
        </div>

        <Chatbot />
      </div>
    </RequireAuth>
  );
}
