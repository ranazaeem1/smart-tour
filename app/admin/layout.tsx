"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import RequireAuth from "@/components/RequireAuth";
import Chatbot from "@/components/Chatbot";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Mountain, 
  ClipboardList, 
  Wallet, 
  Star, 
  ShieldAlert, 
  BarChart3, 
  Settings 
} from "lucide-react";

const ADMIN_NAV = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin/dashboard" },
  { icon: <Users size={20} />, label: "Users", href: "/admin/users" },
  { icon: <Building2 size={20} />, label: "Companies", href: "/admin/companies" },
  { icon: <Mountain size={20} />, label: "All Tours", href: "/admin/tours" },
  { icon: <ClipboardList size={20} />, label: "Bookings", href: "/admin/bookings" },
  { icon: <Wallet size={20} />, label: "Revenue", href: "/admin/revenue" },
  { icon: <Star size={20} />, label: "Reviews", href: "/admin/reviews" },
  { icon: <ShieldAlert size={20} />, label: "Safety Management", href: "/admin/safety" },
  { icon: <BarChart3 size={20} />, label: "Analytics", href: "/admin/analytics" },
  { icon: <Settings size={20} />, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <RequireAuth role="admin">
      <div className="flex min-h-screen bg-[var(--background)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen z-50">
          <Sidebar 
            items={ADMIN_NAV} 
            role="admin" 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
          />
        </div>

        {/* Mobile Sidebar (Drawer) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[200] animate-fade">
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <div className="relative w-[224px] h-full animate-fade-in-left shadow-2xl">
              <Sidebar 
                items={ADMIN_NAV} 
                role="admin" 
                collapsed={false} 
                setCollapsed={() => setIsMobileMenuOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav title="Administrator Panel" onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main 
            className="admin-main-shell flex-1 p-5 md:p-6 lg:p-7 w-full transition-all duration-500"
            role="main"
          >
            {children}
          </main>
        </div>

        <Chatbot />
      </div>
    </RequireAuth>
  );
}
