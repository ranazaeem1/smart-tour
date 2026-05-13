"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import Chatbot from "@/components/Chatbot";
import RequireAuth from "@/components/RequireAuth";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mountain, 
  ClipboardList, 
  Wallet, 
  Star, 
  Users, 
  Settings 
} from "lucide-react";

const COMPANY_NAV = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/company/dashboard" },
  { icon: <MessageSquare size={20} />, label: "Messages", href: "/company/chat/list" },
  { icon: <Mountain size={20} />, label: "My Tours", href: "/company/tours" },
  { icon: <ClipboardList size={20} />, label: "Bookings", href: "/company/bookings" },
  { icon: <Wallet size={20} />, label: "Revenue", href: "/company/revenue" },
  { icon: <Star size={20} />, label: "Reviews", href: "/company/reviews" },
  { icon: <Users size={20} />, label: "Customers", href: "/company/customers" },
  { icon: <Settings size={20} />, label: "Settings", href: "/company/settings" },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <RequireAuth role="company">
      <div className="flex min-h-screen bg-[var(--background)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen z-50">
          <Sidebar 
            items={COMPANY_NAV} 
            role="company" 
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
                items={COMPANY_NAV} 
                role="company" 
                collapsed={false} 
                setCollapsed={() => setIsMobileMenuOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Main Interface Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav title="Operator Console" onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main 
            className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full transition-all duration-500"
            role="main"
            aria-label="Company Dashboard Content"
          >
            {children}
          </main>
        </div>
        
        <Chatbot />
      </div>
    </RequireAuth>
  );
}
