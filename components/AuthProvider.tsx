/**
 * @file AuthProvider.tsx
 * @description Global Authentication Provider managing Supabase sessions and user profiles.
 * Exposes a context and custom hook for consuming authentication state across the app.
 * @author Smart Tour Team
 * @dependencies react, @supabase/supabase-js, @/lib/supabase
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ==========================================
// Types
// ==========================================

/**
 * Type definition for the Auth Context state.
 * @interface AuthContextType
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: "user" | "company" | "admin";
    avatar_url: string | null;
  } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// ==========================================
// Context Initialization
// ==========================================

/**
 * Global Context for Authentication State
 */
const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, loading: true,
  signOut: async () => {},
});

// ==========================================
// Provider Component
// ==========================================

/**
 * AuthProvider Component
 * 
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components that require auth context
 * @returns {JSX.Element} The Auth Context Provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Handlers & Logic
  // ==========================================

  /**
   * Fetches user profile data from the 'profiles' table in Supabase.
   * Provides fallback logic if profile doesn't exist yet (e.g., first login).
   * 
   * @param {User} authUser - The authenticated user object from Supabase Auth
   */
  const loadProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*") // Fetch all fields including total_budget, verified, etc.
        .eq("id", authUser.id)
        .maybeSingle();
        
      if (data) {
        setProfile(data as AuthContextType["profile"]);
      } else {
        // Fallback if row missing
        const fallback = {
          id: authUser.id,
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name || "Traveler",
          phone: authUser.user_metadata?.phone || null,
          role: authUser.user_metadata?.role || "user",
          avatar_url: null,
          total_budget: 100000,
          verified: false
        };
        setProfile(fallback as any);
      }
    } catch (err) {
      console.error("[loadProfile] Error:", err);
      setProfile({
        id: authUser.id,
        email: authUser.email || "",
        full_name: authUser.user_metadata?.full_name || "Traveler",
        phone: authUser.user_metadata?.phone || null,
        role: "user",
        avatar_url: null
      } as any);
    }
  };

  /**
   * Effect hook to initialize authentication state on mount
   * and subscribe to auth state changes (login, logout, token refresh).
   */
  useEffect(() => {
    let active = true;

    // Supabase emits INITIAL_SESSION here, so a separate getSession() call is unnecessary.
    // Avoiding that parallel auth request prevents browser lock contention in dev.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          void loadProfile(session.user).finally(() => {
            if (active) setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs the user out of the application and redirects to the login page.
   * @returns {Promise<void>}
   */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Hard reload to clear all client-side state and redirect to landing page
    window.location.href = "/";
  };

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// Custom Hook
// ==========================================

/**
 * Custom hook to consume the authentication context.
 * 
 * @returns {AuthContextType} The current authentication state and functions
 */
export const useAuth = () => useContext(AuthContext);
