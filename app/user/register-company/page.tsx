"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, CheckCircle2, Hash, Mail, Phone, ShieldCheck } from "lucide-react";

export default function RegisterCompanyPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ companyName: "", phone: "", ntnNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading company registration...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-5">
        <Building2 size={42} className="text-slate-300" />
        <h1 className="text-2xl font-black text-slate-950">Login Required</h1>
        <p className="text-sm font-bold text-slate-500">Please log in before registering a company.</p>
        <button className="btn btn-emerald !rounded-2xl !px-7 !py-4" onClick={() => router.push("/auth/login")}>Go to Login</button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const ntnNumber = onlyDigits(form.ntnNumber);
    if (ntnNumber.length !== 7) {
      setError("NTN/license number must be exactly 7 digits.");
      setLoading(false);
      return;
    }

    const companyPhone = onlyDigits(form.phone || profile.phone || "");
    if (companyPhone.length < 9 || companyPhone.length > 15) {
      setError("Company contact phone is required and must be 9 to 15 digits.");
      setLoading(false);
      return;
    }

    const applicantName = profile.full_name?.trim() || profile.email.split("@")[0] || "Applicant";
    const applicantPhone = onlyDigits(profile.phone || form.phone || "");

    try {
      const { data: existingApplication, error: existingError } = await (supabase.from("companies") as any)
        .select("id, status")
        .eq("owner_id", profile.id)
        .in("status", ["pending", "approved"])
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingApplication?.status === "pending") {
        setError("Your company registration request is already pending. Please wait for admin approval.");
        setLoading(false);
        return;
      }

      if (existingApplication?.status === "approved") {
        setError("Your company is already approved. Please use the company dashboard.");
        setLoading(false);
        return;
      }

      const { error: companyError } = await (supabase.from("companies") as any).insert({
        owner_id: profile.id,
        name: form.companyName.trim(),
        email: profile.email,
        phone: companyPhone,
        ntn_number: ntnNumber,
        applicant_name: applicantName,
        applicant_email: profile.email,
        applicant_phone: applicantPhone || null,
        status: "pending",
      });

      if (companyError) throw companyError;

      router.push("/user/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Company registration failed.";
      setError(message.includes("ntn_number") || message.includes("applicant_") ? "Database columns for licensed company registration are missing. Please apply the latest company registration migrations." : message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade space-y-8 pb-20 max-w-4xl mx-auto">
      <div>
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors mb-4">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <Building2 size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Licensed Operator Application</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950">Register Your Company</h1>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Company Name *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  className="input !pl-12 !rounded-2xl !bg-white font-black"
                  placeholder="e.g. Karakoram Adventures"
                  required
                  pattern={textOnlyPattern}
                  title="Use letters only."
                  value={form.companyName}
                  onChange={event => setForm(prev => ({ ...prev, companyName: stripNumbers(event.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NTN / License Number *</label>
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  className="input !pl-12 !rounded-2xl !bg-white font-black"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{7}"
                  maxLength={7}
                  placeholder="1234567"
                  required
                  value={form.ntnNumber}
                  onChange={event => setForm(prev => ({ ...prev, ntnNumber: onlyDigits(event.target.value).slice(0, 7) }))}
                />
              </div>
              <p className="text-xs font-bold text-slate-500">Required 7-digit licensed company NTN number.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Company Contact Phone *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  className="input !pl-12 !rounded-2xl !bg-white font-black"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9,15}"
                  maxLength={15}
                  placeholder="03XXXXXXXXX"
                  value={form.phone}
                  onChange={event => setForm(prev => ({ ...prev, phone: onlyDigits(event.target.value) }))}
                />
              </div>
              <p className="text-xs font-bold text-slate-500">Required for the company application. If left blank, we will use your profile phone: {profile.phone || "Not provided"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
              <Mail size={17} className="text-emerald-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Email</p>
                <p className="text-sm font-black text-slate-800">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant Name</p>
                <p className="text-sm font-black text-slate-800">{profile.full_name || profile.email.split("@")[0]}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant Phone</p>
                <p className="text-sm font-black text-slate-800">{profile.phone || form.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button type="button" className="btn btn-secondary flex-1 !rounded-2xl !py-4" onClick={() => router.back()}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald flex-[2] !rounded-2xl !py-4 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <span className="loading-spinner w-5 h-5 border-white" /> : <><span className="text-xs font-black uppercase tracking-widest">Submit Licensed Company</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </form>

          <aside className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 h-fit">
            <ShieldCheck size={28} className="text-emerald-600 mb-4" />
            <h2 className="text-xl font-black text-slate-950">Licensed Companies Only</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">
              NTN number is required so SmartTour can keep only registered and licensed tour operators on the platform.
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin approval required</span>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
