/**
 * @file page.tsx
 * @description Authentication page for Smart Tour. Handles both Login and Registration flows
 * within a single UI using Supabase Auth. Also handles role-based redirection post-login.
 * @author Smart Tour Team
 * @dependencies react, next/navigation, next/link, @/lib/supabase, @/lib/db
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { upsertProfile } from "@/lib/db";

// ==========================================
// Component: AuthForm
// ==========================================

/**
 * Main form component managing authentication state, UI toggling between login and register,
 * and Supabase backend interactions.
 * 
 * @returns {JSX.Element} The rendered authentication form
 */
function AuthForm() {
  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  // Extract role query param to determine if registering as user or company
  const roleParam = searchParams.get("role") || "user";
  
  // State Management
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Handles form submission for both login and registration flows.
   * Interacts with Supabase Auth API and manages local state (loading, error, success).
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "register") {
        // --- Registration Flow ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
              role: "user",
              phone: form.phone,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Fallback: manually upsert profile in case DB trigger fails or hasn't fired yet
          // FIXME: Remove this once a reliable database trigger for user creation is established
          await upsertProfile({
            id: data.user.id,
            email: form.email,
            full_name: form.name,
            phone: form.phone || undefined,
            role: "user",
          });

          // Check if email confirmation is disabled (auto-login) or enabled
          if (data.session) {
            router.push("/user/dashboard");
          } else {
            setSuccess("✅ Account created! Check your email to confirm your account, then sign in.");
          }
        }
      } else {
        // --- Login Flow ---
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Fetch the user's role to determine correct post-login redirect
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userRole = (profile as any)?.role || "user";
          
          // Role-based redirection
          // TODO: Export these route strings to a central constant file for better maintainability
          if (userRole === "admin") router.push("/admin/dashboard");
          else if (userRole === "company") router.push("/company/dashboard");
          else router.push("/user/dashboard");
        }
      }
    } catch (err: unknown) {
      // Extract human-readable error message for UI
      const msg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Background with overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sunset-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.85) contrast(1.05)", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)", zIndex: 1 }} />

      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 2 }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><path d="M16 3L28 28H4L16 3Z" fill="white" opacity="0.9" /><circle cx="16" cy="14" r="3" fill="white" /></svg>
              </div>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "Outfit, sans-serif" }}>Smart Tour</span>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div style={{ 
          padding: 40, 
          background: "rgba(255, 255, 255, 0.1)", 
          backdropFilter: "blur(32px) saturate(150%)", 
          WebkitBackdropFilter: "blur(32px) saturate(150%)", 
          border: "1px solid rgba(255, 255, 255, 0.2)", 
          borderTop: "1px solid rgba(255, 255, 255, 0.6)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "var(--radius-xl)", 
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)" 
        }}>
          {/* Tabs: Login / Register switcher */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255, 255, 255, 0.1)", padding: 4, borderRadius: "var(--radius-full)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
            <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(null); setSuccess(null); }} style={{ flex: 1, background: mode === "login" ? "rgba(255, 255, 255, 0.25)" : "transparent", color: "#fff", boxShadow: mode === "login" ? "0 2px 8px rgba(0,0,0,0.2)" : "none", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>Login</button>
            <button className={`tab-btn ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(null); setSuccess(null); }} style={{ flex: 1, background: mode === "register" ? "rgba(255, 255, 255, 0.25)" : "transparent", color: "#fff", boxShadow: mode === "register" ? "0 2px 8px rgba(0,0,0,0.2)" : "none", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>Register</button>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
            {mode === "login" ? "Welcome Back!" : "Create Account"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", marginBottom: 24, fontWeight: 500 }}>
            {mode === "login"
              ? "Sign in to your account to continue your journey 👤"
              : "Create an account to start your adventure with us 👤"}
          </p>

          {/* Feedback Messages */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: 16, fontSize: 13 }}>
              {success}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 700, color: "#fff" }}>Full Name</label>
                <input className="input" placeholder="Ali Hassan" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#fff", backdropFilter: "blur(12px)" }} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 700, color: "#fff" }}>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#fff", backdropFilter: "blur(12px)" }} />
            </div>
            {mode === "register" && (
              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 700, color: "#fff" }}>Phone Number</label>
                <input className="input" type="tel" placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#fff", backdropFilter: "blur(12px)" }} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 700, color: "#fff" }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#fff", backdropFilter: "blur(12px)" }} />
            </div>

            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: -8 }}>
                <button type="button" onClick={() => router.push("/auth/forgot-password")} style={{ background: "none", border: "none", color: "#67e8f9", fontSize: 12, cursor: "pointer", fontWeight: 600, textDecoration: "none", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "14px", border: "1px solid rgba(255,255,255,0.4)" }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : (mode === "login" ? "Sign In →" : "Create Account →")}
            </button>
          </form>

          {/* Toggle Action link */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, textDecoration: "underline", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// Default Export
// ==========================================

/**
 * AuthPage Component
 * Wraps the AuthForm in a Suspense boundary as it utilizes 'useSearchParams()'.
 * 
 * @returns {JSX.Element} The rendered authentication page wrapper
 */
export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="loading-spinner" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
