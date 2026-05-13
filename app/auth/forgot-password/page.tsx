/**
 * @file page.tsx
 * @description Forgot Password page for Smart Tour. Aligned with the Modern Dark Enterprise theme
 * and featuring a premium blurred background aesthetic.
 */

"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess("If that email is in our system, you will receive a reset link shortly.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black font-sans">
      {/* Background with mountain sunset and LIGHT BLUR */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-105 blur-[6px]"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] animate-fade">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-3xl font-black text-white uppercase italic tracking-tighter">Smart<span className="text-emerald-500">Tour</span></span>
          </Link>
        </div>

        {/* Main Card - Dark Glass Effect */}
        <div className="bg-black/60 backdrop-blur-[40px] border border-white/10 rounded-[48px] p-10 md:p-12 shadow-2xl shadow-black/50">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
            Forgot Password
          </h2>
          <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Feedback Messages */}
          {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl text-sm mb-8 animate-fade">⚠️ {error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl text-sm mb-8 animate-fade">{success}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Send Reset Link →"}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link 
              href="/auth/login" 
              className="text-zinc-500 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors underline decoration-emerald-500/50 underline-offset-4"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
