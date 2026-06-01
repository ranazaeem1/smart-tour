"use client";

import { useAuth } from "@/components/AuthProvider";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { fetchCompanyByOwner } from "@/lib/db";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Plus,
  Menu,
  Building2,
  Sparkles
} from "lucide-react";

interface TopNavProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopNav({ title, onMenuClick }: TopNavProps) {
  const { profile, signOut } = useAuth();
  const [greeting, setGreeting] = useState("Good morning");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
    else setGreeting("Good morning");

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (profile?.role !== "company" || !profile.id) {
      setCompanyName(null);
      setCompanyId(null);
      return;
    }

    let cancelled = false;
    fetchCompanyByOwner(profile.id)
      .then((company) => {
        if (!cancelled) {
          setCompanyName(company?.name || profile.full_name || "Your Company");
          setCompanyId(company?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompanyName(profile.full_name || "Your Company");
          setCompanyId(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.role, profile?.full_name]);

  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
  const userName = profile?.full_name?.split(" ")[0] || "Traveler";
  const showQuickActions = profile?.role === "user";

  const dashboardTitle =
    profile?.role === "company"
      ? `Welcome to ${companyName || profile?.full_name || "Your Company"}`
      : profile?.role === "admin"
        ? title || "Admin Console"
        : `${userName}'s Dashboard`;

  const settingsHref =
    profile?.role === "company"
      ? "/company/settings"
      : profile?.role === "admin"
        ? "/admin/settings"
        : "/user/settings";

  const notificationRole =
    profile?.role === "company" ? "company" : profile?.role === "admin" ? "admin" : "user";

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between bg-[var(--card)]/80 backdrop-blur-xl px-4 md:px-6 lg:px-8 h-[80px] border-b border-[var(--border)] shadow-[var(--shadow-sm)] transition-all duration-300">
      {/* Left Section: Mobile Menu & Title */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-xl hover:bg-[var(--border)] active:scale-95 transition-all"
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="animate-fade min-w-0">
          <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-1">
            {greeting} 👋
          </p>
          <h1 className="text-lg md:text-xl font-black text-[var(--foreground)] m-0 leading-tight tracking-tight truncate">
            {dashboardTitle}
          </h1>

        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="hidden sm:flex items-center gap-3">
            <Link 
              href="/company/register" 
              className="btn btn-secondary !px-5 !py-2.5 !text-[10px] hidden xl:flex items-center gap-2"
              aria-label="Register your company on SmartTour"
            >
              <Building2 size={16} aria-hidden="true" />
              Register Company
            </Link>
            <Link 
              href="/user/planner" 
              className="btn btn-emerald !px-5 !py-2.5 !text-[10px] flex items-center gap-2 shadow-emerald-500/20"
              aria-label="Plan a new trip using AI"
            >
              <Plus size={16} aria-hidden="true" />
              <span className="hidden md:inline">Plan New Trip</span>
              <span className="md:hidden">New Trip</span>
            </Link>
          </div>
        )}

        <div className="h-8 w-[1px] bg-[var(--border)] mx-1 hidden md:block" aria-hidden="true"></div>

        <div className="flex items-center gap-3 md:gap-5">
          <NotificationBell role={notificationRole} userId={profile?.id} companyId={companyId ?? undefined} />
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 min-h-[44px] hover:bg-[var(--muted)] rounded-2xl transition-all duration-200 active:scale-95 ring-1 ring-transparent hover:ring-[var(--border)]"
              aria-label="Open profile menu"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-sm shadow-md border border-white/10 overflow-hidden" aria-hidden="true">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <ChevronDown size={14} className={`text-[var(--muted-foreground)] hidden sm:block transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-3 w-64 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] py-3 z-[110] animate-fade-in-up"
                role="menu"
                aria-label="User account menu"
              >
                <div className="px-5 py-4 mb-2 border-b border-[var(--border)]">
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Authenticated as</p>
                  <p className="text-sm font-bold text-[var(--foreground)] truncate" role="note">{profile?.email}</p>
                </div>

                <div className="space-y-1 px-2">
                  <Link 
                    href={settingsHref} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all group"
                    role="menuitem"
                    aria-label="Go to profile settings"
                  >
                    <User size={16} className="text-[var(--muted-foreground)] group-hover:text-emerald-500" aria-hidden="true" />
                    <span className="text-sm font-bold">Profile Settings</span>
                  </Link>
                  <Link 
                    href={settingsHref} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all group"
                    role="menuitem"
                    aria-label="Go to preferences"
                  >
                    <Sparkles size={16} className="text-[var(--muted-foreground)] group-hover:text-emerald-500" aria-hidden="true" />
                    <span className="text-sm font-bold">Preferences</span>
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)] px-2">
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all group text-left"
                    role="menuitem"
                    aria-label="Sign out of your account"
                  >
                    <LogOut size={18} className="text-rose-400 group-hover:text-rose-600" aria-hidden="true" />
                    <span className="text-sm font-black uppercase tracking-widest text-[11px]">Secure Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
