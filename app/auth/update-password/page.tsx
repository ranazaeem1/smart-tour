"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

const bgImage =
  'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop")';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess("Password updated successfully! You can now log in with your new password.");

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl px-6 py-4 font-semibold focus:outline-none transition-all";

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
          <h2 className="auth-title text-3xl font-black mb-2 tracking-tighter uppercase italic">
            Update Password
          </h2>
          <p className="auth-muted text-sm font-medium mb-10 leading-relaxed">
            Please enter your new password below.
          </p>

          {error && (
            <div className="auth-alert-error px-6 py-4 rounded-2xl text-sm mb-8 animate-fade border">
              <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> {error}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert-success px-6 py-4 rounded-2xl text-sm mb-8 animate-fade border">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-4">
                New Password
              </label>
              <input
                className={inputClass}
                type="password"
                placeholder="Enter your password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-emerald w-full py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span className="inline-flex items-center gap-2">Update Password <ArrowRight size={14} /></span>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link
              href="/auth/login"
              className="auth-footer-muted text-[11px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors underline decoration-emerald-500/40 underline-offset-4"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
