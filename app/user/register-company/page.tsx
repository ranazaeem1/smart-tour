"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { upsertProfile } from "@/lib/db";
import { onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function RegisterCompanyPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ companyName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>Please log in to register a company.</p>
        <button className="btn btn-primary mt-4" onClick={() => router.push("/auth/login")}>Go to Login</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Insert into companies table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: companyError } = await (supabase.from("companies") as any).insert({
        owner_id: profile.id,
        name: form.companyName,
        email: profile.email,
        phone: form.phone || profile.phone || null,
        status: "pending",
      });

      if (companyError) throw companyError;

      // 2. Update user profile to 'company' role
      const updated = await upsertProfile({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || undefined,
        phone: profile.phone || undefined,
        role: "company",
      });

      if (!updated) throw new Error("Failed to update profile role.");

      // 3. Redirect to company dashboard
      window.location.href = "/company/dashboard";
    } catch (err: unknown) {
              {loading ? <span className="loading-spinner" /> : <span className="inline-flex items-center gap-2">Register Company <ArrowRight size={14} /></span>}
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="topbar">
        <h1 className="topbar-title">Register Your Company</h1>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Join the Smart Tour platform as a tour company. Once registered, you will gain access to the Company Dashboard where you can create and manage tours, track bookings, and grow your business.
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="input-group">
            <label className="input-label">Company Name <span style={{ color: "var(--error)" }}>*</span></label>
            <input 
              className="input" 
              placeholder="e.g. Karakoram Adventures" 
              required 
              pattern={textOnlyPattern}
              title="Use letters only."
              value={form.companyName} 
              onChange={e => setForm(p => ({ ...p, companyName: stripNumbers(e.target.value) }))} 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Company Contact Phone (Optional)</label>
            <input 
              className="input" 
              type="tel" 
              inputMode="numeric"
              pattern="[0-9]{9,15}"
              maxLength={15}
              placeholder="03XXXXXXXXX" 
              value={form.phone} 
              onChange={e => setForm(p => ({ ...p, phone: onlyDigits(e.target.value) }))} 
            />
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              If left blank, we will use your personal phone number: {profile.phone || "Not provided"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()} style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : <span className="inline-flex items-center gap-2">Register Company <ArrowRight size={14} /></span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
