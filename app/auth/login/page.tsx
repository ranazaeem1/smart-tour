/**
 * @file page.tsx
 * @description Authentication page for Smart Tour. Handles both Login and Registration flows
 * within a single UI using Supabase Auth. Light theme aligned with the global design system.
 */

"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { upsertProfile } from "@/lib/db";
import { emailPattern, normalizeEmail, onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "user";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", emergencyPhone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "register") {
        const determinedRole = form.email.toLowerCase() === "zaeemrajpoot2234@gmail.com" 
          ? "admin" 
          : (roleParam === "company" ? "company" : "user");

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
              role: determinedRole,
              phone: form.phone,
              emergency_phone: form.emergencyPhone,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          try {
            await upsertProfile({
              id: data.user.id,
              email: form.email,
              full_name: form.name,
              phone: form.phone,
              emergency_phone: form.emergencyPhone,
              role: determinedRole,
            });

            if (data.session) {
              if (determinedRole === "admin") router.push("/admin/dashboard");
              else if (determinedRole === "company") router.push("/company/dashboard");
              else router.push("/user/dashboard");
            } else {
              setSuccess(`Account created as ${determinedRole}. Check your email to confirm, then sign in.`);
            }
          } catch (err) {
            console.error('Error saving profile:', err);
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

          const userRole = (profile as any)?.role || data.user.user_metadata?.role || "user";

          if (userRole === "admin") router.push("/admin/dashboard");
          else if (userRole === "company") router.push("/company/dashboard");
          else router.push("/user/dashboard");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl px-6 py-4 font-semibold focus:outline-none transition-all";

  const bgImage =
    'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop")';

  return (
    <div className="auth-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="auth-bg-image absolute inset-0" style={{ backgroundImage: bgImage }} />
      </div>

      <div className="relative z-10 w-full max-w-[460px] animate-fade">
        <div className="text-center mb-10">
          <Link href="/" className="auth-brand inline-flex items-center gap-3 group">
            <img src="/logo.svg" alt="Smart Tour logo" className="w-14 h-14 rounded-full object-contain group-hover:scale-105 transition-transform" />
            <span className="text-3xl font-black uppercase italic tracking-tighter">
              <span className="auth-brand-smart">Smart</span>
              <span className="auth-brand-tour">Tour</span>
            </span>
          </Link>
        </div>

        <div className="auth-glass-card rounded-[32px] p-10 md:p-12">
          <div className="text-center mb-8">
            <span className="text-2xl font-black uppercase italic tracking-tighter">
              <span className="auth-panel-smart">Smart</span>
              <span className="auth-panel-tour">Tour</span>
            </span>
          </div>
          <div className="auth-glass-tabs flex gap-2 p-1 rounded-2xl mb-10">
            <button
              suppressHydrationWarning
              type="button"
              className={`flex-1 py-3 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                mode === "login"
                  ? "auth-tab-active"
                  : "auth-tab-inactive"
              }`}
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
            >
              Login
            </button>
            <button
              suppressHydrationWarning
              type="button"
              className={`flex-1 py-3 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                mode === "register"
                  ? "auth-tab-active"
                  : "auth-tab-inactive"
              }`}
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
            >
              Register
            </button>
          </div>

          <h2 className="auth-title text-3xl font-black mb-2 tracking-tighter uppercase italic">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-muted text-sm font-medium mb-10 leading-relaxed">
            {mode === "login"
              ? "Sign in to your account to continue your extraordinary journey."
              : "Create an account to start your adventure with our AI intelligence."}
          </p>

          {error && (
            <div className="auth-alert-error px-6 py-4 rounded-2xl text-sm mb-8 animate-fade border">
              {error}
            </div>
          )}
          {success && (
            <div className="auth-alert-success px-6 py-4 rounded-2xl text-sm mb-8 animate-fade border">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-4">
                  Full Name
                </label>
                <input
                  suppressHydrationWarning
                  className={inputClass}
                  placeholder="Ali Hassan"
                  required
                  pattern={textOnlyPattern}
                  title="Use letters only."
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: stripNumbers(e.target.value) }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4">
                Email Address
              </label>
              <input
                suppressHydrationWarning
                className={inputClass}
                type="email"
                inputMode="email"
                pattern={emailPattern}
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: normalizeEmail(e.target.value) }))}
              />
            </div>
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-4">
                  Phone Number
                </label>
                <input
                  suppressHydrationWarning
                  className={inputClass}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9,15}"
                  maxLength={15}
                  placeholder="03XXXXXXXXX"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: onlyDigits(e.target.value) }))}
                />
              </div>
            )}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-4">
                  Emergency Phone Number
                </label>
                <input
                  suppressHydrationWarning
                  className={inputClass}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9,15}"
                  maxLength={15}
                  placeholder="Emergency contact e.g. 03XXXXXXXXX"
                  required
                  value={form.emergencyPhone}
                  onChange={e => setForm(p => ({ ...p, emergencyPhone: onlyDigits(e.target.value) }))}
                />
                <p className="auth-muted text-xs font-bold ml-4">SOS alerts will use this number for emergency signal sharing.</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4">
                Password
              </label>
              <input
                suppressHydrationWarning
                className={inputClass}
                type="password"
                placeholder="Enter your password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-[11px] font-black uppercase tracking-widest hover:text-white/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              suppressHydrationWarning
              type="submit"
              className="btn btn-emerald w-full py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <span className="auth-footer-muted text-[11px] font-black uppercase tracking-widest">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }}
              className="auth-link text-[11px] font-black uppercase tracking-widest hover:text-white/80 transition-colors underline decoration-white/40 underline-offset-4"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
