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
  { label: "Destinations", href: "/#destinations" },
  { label: "Tours", href: "/#tours" },
  { label: "AI Planner", href: "/#ai" },
  { label: "About", href: "/#about" },
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
  const [menuOpen, setMenuOpen] = useState(false);

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <nav className="navbar">
      {/* Platform Logo & Brand Name */}
      <Link href="/" className="nav-logo" style={{ textDecoration:"none", color:"var(--text-primary)" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14D2BE"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
          <path d="M16 3L28 28H4L16 3Z" fill="url(#logoG)" opacity="0.9"/>
          <circle cx="16" cy="14" r="3" fill="white" opacity="0.8"/>
          <path d="M10 28C10 24 13 21 16 21C19 21 22 24 22 28" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>
        <span className="text-gradient">Smart Tour</span>
      </Link>

      {/* Navigation Links Loop */}
      <div className="nav-links" style={{ display: menuOpen ? "none" : "flex" }}>
        {NAV_LINKS.map(l => (
          <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
        ))}
      </div>

      {/* Call to Action Buttons */}
      <div className="nav-actions">
        <Link href="/auth/login?role=company" className="btn btn-secondary btn-sm">
          For Companies
        </Link>
        <Link href="/auth/login?role=user" className="btn btn-primary btn-sm">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
