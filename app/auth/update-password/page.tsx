"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Optional: Verify that there is an active session
    // Supabase will automatically handle the session from the URL hash
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // setError("No active session found. Please request a new password reset link.");
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess("Password updated successfully! You can now log in with your new password.");
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sunset-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.85) contrast(1.05)", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)", zIndex: 1 }} />

      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 2 }}>
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
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
            Update Password
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", marginBottom: 24 }}>
            Please enter your new password below.
          </p>

          {error && <div className="alert alert-danger" style={{ marginBottom: 16, fontSize: 13 }}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}

          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 700, color: "#fff" }}>New Password</label>
              <input className="input" type="password" placeholder="••••••••" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "#fff", backdropFilter: "blur(12px)" }} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "14px", border: "1px solid rgba(255,255,255,0.4)" }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : "Update Password →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
