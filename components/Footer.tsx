/**
 * @file Footer.tsx
 * @description Professional footer component for the Smart Tour platform.
 * Contains navigation links, brand information, and social entry points.
 * @author Smart Tour Team
 * @dependencies next/link, react
 */

import Link from "next/link";

/**
 * Footer Component
 * Renders a multi-column professional footer with brand identity and structured navigation.
 * 
 * @returns {JSX.Element} The rendered footer
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#fff", padding: "80px 60px 40px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 60 }}>
        
        {/* Brand Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #0d9488, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M16 3L28 28H4L16 3Z" fill="white" opacity="0.9" />
                <circle cx="16" cy="14" r="3" fill="white" />
              </svg>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.5px" }}>Smart Tour</span>
          </Link>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 320 }}>
            Pioneering the future of travel in Pakistan with artificial intelligence, 
            dynamic safety systems, and trusted tour partners. Your gateway to the extraordinary.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {/* Social Icons Placeholders - Using simple styled circles for now */}
            {["FB", "TW", "IG", "LI"].map(social => (
              <div key={social} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.3s" }}>
                {social}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Columns */}
        {[
          {
            heading: "Account",
            links: [
              { label: "Log In", href: "/auth/login" },
              { label: "Sign Up", href: "/auth/login" },
              { label: "User Dashboard", href: "/user/dashboard" },
              { label: "Destinations", href: "/destinations" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "Partner Portal", href: "/auth/login" },
              { label: "Partner Benefits", href: "/about" },
              { label: "Contact Sales", href: "/contact" },
              { label: "About Us", href: "/about" },
            ],
          },
          {
            heading: "Legal & Support",
            links: [
              { label: "Contact Us", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Safety Guide", href: "/#features" },
            ],
          },
        ].map(col => (
          <div key={col.heading}>
            <h4 style={{ color: "var(--text-primary)", marginBottom: 24, fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              {col.heading}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 15, transition: "color 0.2s" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          &copy; {currentYear} Smart Tour Platform. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/privacy" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Terms</Link>
          <Link href="/contact" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
