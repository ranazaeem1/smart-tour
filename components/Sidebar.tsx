"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface SidebarItem { 
  icon: React.ReactNode; 
  label: string; 
  href: string; 
}

interface SidebarProps {
  items: SidebarItem[];
  role: "user" | "company" | "admin";
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ items, role, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside 
      className={`sidebar-gradient h-screen flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${collapsed ? 'w-[80px]' : 'w-[224px]'} border-r border-white/5 bg-black`}
    >
      {/* Logo Section */}
      <div className="h-[80px] flex items-center px-6 mb-2">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="h-9 w-9 shrink-0 bg-emerald-600 rounded-[14px] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(16,185,129,0.5)]">
            <span className="text-white font-black text-lg tracking-tighter">S</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade">
              <span className="text-[14px] font-black whitespace-nowrap tracking-tighter leading-tight">
                <span className="text-black">SMART</span>
                <span className="text-emerald-500">TOUR</span>
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                Enterprise Hub
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        {!collapsed && (
          <div className="px-4 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-50">
            Main Menu
          </div>
        )}
        
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/user/dashboard" && pathname.startsWith(item.href + "/"));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item group flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center px-0' : 'px-4'}`}
              title={collapsed ? item.label : ""}
            >
              <span className={`transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:scale-110 group-hover:text-emerald-500'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="whitespace-nowrap font-bold text-[13px] tracking-tight animate-fade">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section & Footer */}
      <div className="mt-auto p-4 space-y-4" role="contentinfo">
        {!collapsed && profile && (
          <div className="p-4 bg-white/5 rounded-[24px] border border-white/5 animate-fade mb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black border border-white/10 shadow-lg">
                {profile.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate leading-none">{profile.full_name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{profile.phone || role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-3 p-3 min-h-[44px] rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group ${collapsed ? 'justify-center' : 'px-4'}`}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {!collapsed && <span className="font-bold text-[13px] animate-fade">Logout</span>}
          </button>

          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center p-3 min-h-[44px] rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all duration-300 hidden lg:flex"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
