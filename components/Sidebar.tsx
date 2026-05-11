/**
 * @file Sidebar.tsx
 * @description Application sidebar navigation component. Handles responsive collapsing,
 * dynamic role-based navigation links, and user settings/logout interactions.
 * @author Smart Tour Team
 * @dependencies react, next/link, next/navigation, @/components/AuthProvider
 */

// ==========================================
// Imports
// ==========================================
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

// ==========================================
// Types & Interfaces
// ==========================================

/**
 * Defines the structure for an individual sidebar navigation link.
 * @interface SidebarItem
 */
interface SidebarItem { 
  icon: string; 
  label: string; 
  href: string; 
}

/**
 * Props for the Sidebar component.
 * @interface SidebarProps
 */
interface SidebarProps {
  items: SidebarItem[];
  role: "user" | "company" | "admin";
  userName?: string;
  userInitials?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

// ==========================================
// Constants
// ==========================================

const roleColors: Record<string, string> = {
  user: "var(--teal)",
  company: "var(--purple-light)",
  admin: "var(--teal)", // Hidden color
};

const roleLabels: Record<string, string> = {
  user: "Traveler",
  company: "Tour Company",
  admin: "Administrator",
};

// ==========================================
// Component: Sidebar
// ==========================================

/**
 * Sidebar Component
 * Displays the main navigation, user profile summary, and application settings.
 * 
 * @param {SidebarProps} props - Component properties
 * @returns {JSX.Element} The rendered Sidebar
 */
export default function Sidebar({ items, role, userName: propUserName, userInitials: propInitials, onCollapseChange }: SidebarProps) {
  // Hooks
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  
  // State Management
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Computed Values
  const displayName = profile?.full_name || propUserName || "User";
  const displayRole = (profile?.role as string) || role;
  // Fallback initial generation
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || propInitials || "U";

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Toggles the sidebar collapsed state and notifies parent components.
   * 
   * @param {boolean} val - New collapsed state
   */
  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
    onCollapseChange?.(val);
  };

  const w = collapsed ? 72 : 260;

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <aside className={`sidebar ${!collapsed ? 'active' : ''}`} style={{ 
      width: w, 
      transition: "width 0.25s ease",
      background: "rgba(21, 34, 56, 0.85)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)"
    }}>
      {/* Logo Section */}
      <Link href="/" className="sidebar-logo" style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", marginBottom: 28, textDecoration: "none" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-main)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L28 28H4L16 3Z" fill="white" opacity="0.9" />
            <circle cx="16" cy="14" r="3" fill="white" />
          </svg>
        </div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 18, whiteSpace: "nowrap" }} className="text-gradient">Smart Tour</span>}
      </Link>

      {/* Role Badge Panel */}
      {!collapsed && (
        <div style={{ margin: "0 4px 20px", padding: "10px 14px", background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Panel</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e0be78" }}>
            {roleLabels[displayRole] || roleLabels[role]}
          </div>
        </div>
      )}

      {/* Navigation Links Loop */}
      <nav className="sidebar-nav">
        {items.map(item => {
          // Complex logic to determine if the link is active based on exact or partial path matches
          const active = pathname === item.href || (item.href !== "/user/dashboard" && item.href !== "/admin/dashboard" && item.href !== "/company/dashboard" && pathname.startsWith(item.href + "/"));
          const exactActive = pathname === item.href;
          const isActive = exactActive || (!exactActive && active);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{ justifyContent: collapsed ? "center" : "flex-start", paddingLeft: collapsed ? 0 : 14 }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Actions & Settings */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        
        {/* User Profile Summary */}
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.12)", marginBottom: 4 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{roleLabels[displayRole] || roleLabels[role]}</div>
            </div>
          </div>
        )}



        {/* ── Logout Button — prominent red, always visible ── */}
        <button
          onClick={() => signOut()}
          title={collapsed ? "Logout" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            width: "100%",
            padding: collapsed ? "11px 0" : "11px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            background: "rgba(244, 63, 94, 0.12)",
            color: "#f87171",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(244, 63, 94, 0.25)";
            e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.6)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(244, 63, 94, 0.12)";
            e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.35)";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => handleCollapse(!collapsed)}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "var(--radius-md)",
            padding: "10px", cursor: "pointer", color: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "var(--transition)", fontSize: 16,
          }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
    </aside>
  );
}
