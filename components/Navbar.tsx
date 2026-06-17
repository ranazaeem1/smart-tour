"use client";
/**
 * @file Navbar.tsx
 * @description Main navigation bar component for the Smart Tour platform.
 * Handles responsive routing and displays authentication-related calls to action.
 * @author Smart Tour Team
 * @dependencies next/link, react
 */

// ==========================================
// Imports
// ==========================================
import Link from "next/link";
import { useState } from "react";

// ==========================================
// Constants
// ==========================================

/**
 * Pre-defined navigation links for the top menu.
 * @constant
 * @type {Array<{label: string, href: string}>}
 */
const NAV_LINKS = [
  { label: "Destinations", href: "/destinations" },
  { label: "AI Planner", href: "/#ai" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

// ==========================================
// Component: Navbar
// ==========================================

/**
 * Navbar Component
 * Renders the top navigation menu, logo, and action buttons.
 * Includes a responsive state for mobile menus (currently hidden on mobile, to be implemented).
 * 
 * @returns {JSX.Element} The rendered navigation bar
 */
export default function Navbar() {
  // State to track if the mobile menu is open
  // FIXME: Mobile menu implementation is incomplete. Needs a toggle button and mobile-specific layout.
  const [menuOpen] = useState(false);

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <nav className="navbar">
      {/* Platform Logo & Brand Name */}
      <Link href="/" className="nav-logo" style={{ textDecoration:"none", color:"var(--text-primary)" }}>
        <img src="/logo.svg" alt="Smart Tour logo" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: "50%" }} />
        <span className="text-gradient">Smart Tour</span>
      </Link>

      {/* Navigation Links Loop */}
      <div className="nav-links" style={{ display: menuOpen ? "none" : "flex" }}>
        {NAV_LINKS.map(l => (
          <Link key={l.label} href={l.href} className="nav-link">{l.label}</Link>
        ))}
      </div>

      {/* Call to Action Buttons */}
      <div className="nav-actions">
        <Link href="/auth/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500 }}>
          Login
        </Link>
        <Link href="/auth/login" className="btn btn-primary btn-sm">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
