/**
 * @file not-found.tsx
 * @description Custom 404 Not Found page for the application. Displays a user-friendly message
 * when a requested route does not exist.
 * @author Smart Tour Team
 * @dependencies next/link
 */

// ==========================================
// Imports
// ==========================================
import Link from "next/link";

// ==========================================
// Component: NotFound
// ==========================================

/**
 * NotFound Component
 * Renders the 404 page layout with a mountain-themed message and a link back home.
 * 
 * @returns {JSX.Element} The rendered 404 page
 */
export default function NotFound() {
  // TODO: Add tracking/analytics event for 404 page hits to monitor broken links

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🏔️</div>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 10 }}>404</h1>
      <h2 style={{ fontSize: 24, marginBottom: 20, color: "var(--text-secondary)" }}>Lost in the mountains?</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>The page you are looking for doesn't exist or has been moved.</p>
      
      {/* Link to navigate the user back to the homepage */}
      <Link href="/" className="btn btn-primary">
        Go Back Home
      </Link>
    </div>
  );
}
