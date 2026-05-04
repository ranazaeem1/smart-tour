/**
 * @file RequireAuth.tsx
 * @description Higher-Order Component (HOC) / Wrapper for enforcing role-based authentication on protected routes.
 * Redirects unauthorized users to the login page or their respective dashboards.
 * @author Smart Tour Team
 * @dependencies next/navigation, react, @/components/AuthProvider
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ==========================================
// Types
// ==========================================

/**
 * Props for the RequireAuth component
 * @typedef {Object} RequireAuthProps
 * @property {"user" | "company" | "admin"} role - The minimum required role to access the route
 * @property {React.ReactNode} children - The protected components to render if authorized
 */
interface RequireAuthProps {
  role: "user" | "company" | "admin";
  children: React.ReactNode;
}

// ==========================================
// Component: RequireAuth
// ==========================================

/**
 * RequireAuth Wrapper
 * Ensures that a user is authenticated and has the correct role before rendering children.
 * 
 * @param {RequireAuthProps} props - Component properties containing role requirement and children
 * @returns {JSX.Element | null} Returns the children if authorized, otherwise a loading spinner or null
 */
export default function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // ==========================================
  // Hooks & Logic
  // ==========================================
  
  useEffect(() => {
    // 1. Wait for the authentication state to finish loading
    if (loading) return;
    
    // 2. If there's no authenticated user, redirect to the login page
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    
    // 3. Prevent race conditions: wait until the profile data is fetched
    if (!profile) return;
    
    // 4. Admin override: Admins bypass role restrictions
    // TODO: Consider implementing a more robust granular permissions system in the future
    if (profile.role === "admin") return;
    
    // 5. Role mismatch handler: redirect authenticated user to their appropriate dashboard
    if (profile.role !== role) {
      if (profile.role === "company") {
        router.replace("/company/dashboard");
      } else {
        router.replace("/user/dashboard");
      }
    }
  }, [loading, user, profile, role, router]);

  // ==========================================
  // Render Guards
  // ==========================================

  // Display a full-screen spinner while evaluating authentication state
  if (loading) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
        <span className="loading-spinner"/>
      </div>
    );
  }
  
  // Display spinner if user is authenticated but the DB profile hasn't loaded yet
  if (user && !profile) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
        <span className="loading-spinner"/>
      </div>
    );
  }
  
  // Render nothing if user is unauthorized to prevent flash of protected content
  if (!user) return null;
  if (profile && profile.role !== role && profile.role !== "admin") return null;

  // Render the protected content for authorized users
  return <>{children}</>;
}
