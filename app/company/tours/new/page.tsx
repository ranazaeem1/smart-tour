"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createTour, fetchCompanyByOwner } from "@/lib/db";
import { DESTINATIONS } from "@/lib/data";
import { 
  ArrowLeft, 
  Rocket, 
  ClipboardList, 
  Mountain, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar,
  Users
} from "lucide-react";

const INITIAL_HIGHLIGHTS = ["", "", ""];

export default function AddTourPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [highlights, setHighlights] = useState(INITIAL_HIGHLIGHTS);
  const [included, setIncluded] = useState([true, true, true, true, false, false]);
  const INCLUSIONS = ["Transport (AC Vehicle)", "Hotel Accommodation", "All Meals", "Professional Guide", "Permits & Fees", "Travel Insurance"];

  const [form, setForm] = useState({
    title: "", destination: DESTINATIONS[0] || "Hunza Valley", category: "Adventure",
    duration: "", max_group: "", price: "", difficulty: "Moderate",
    description: "", region: "Northern Pakistan",
  });

  const setField = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) return;
    
    setSubmitting(true);
    try {
      if (!profile) throw new Error("Authentication required");
      
      const companyProfile = await fetchCompanyByOwner(profile.id);
      if (!companyProfile) throw new Error("Company profile required");
      
      const tour = await createTour({
        company_id: companyProfile.id,
        title: form.title,
        destination: form.destination,
        region: form.region,
        price: Number(form.price),
        duration: Number(form.duration),
        category: form.category,
        max_group: Number(form.max_group) || 12,
        difficulty: form.difficulty,
        highlights: highlights.filter(Boolean),
        included: INCLUSIONS.filter((_, i) => included[i]),
      });

      if (tour) {
        setSuccess(true);
        setTimeout(() => router.push("/company/tours"), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-[40px] flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 animate-bounce">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-4xl font-black text-[var(--foreground)] mb-4 tracking-tight">Expedition Published!</h2>
      <p className="text-[var(--muted-foreground)] font-medium mb-10 max-w-sm">
        Your package has been successfully integrated into the catalog. Synchronizing with the global ledger...
      </p>
      <div className="loading-spinner h-8 w-8" />
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20">
      {/* ── Sub-Navigation Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link 
            href="/company/tours" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors mb-4"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter m-0">Create Expedition</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Draft Mode Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Left Infrastructure (2 Columns) ── */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Core Configuration */}
          <section className="card-premium space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <ClipboardList size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Core Specifications</h2>
            </div>

            <div className="space-y-6">
              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Package Identity</label>
                <input 
                  className="input !text-lg !font-bold" 
                  placeholder="e.g. Karakoram Wilderness Expedition" 
                  value={form.title} 
                  onChange={e => setField("title", e.target.value)} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Operational Sector</label>
                  <select className="input font-bold" value={form.destination} onChange={e => setField("destination", e.target.value)}>
                    {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Classification</label>
                  <select className="input font-bold" value={form.category} onChange={e => setField("category", e.target.value)}>
                    {["Adventure", "Trekking", "Cultural", "Family", "Sports"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Deployment Span (Days)</label>
                  <input className="input font-bold" type="number" placeholder="7" min={1} value={form.duration} onChange={e => setField("duration", e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Group Capacity</label>
                  <input className="input font-bold" type="number" placeholder="12" min={1} value={form.max_group} onChange={e => setField("max_group", e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Complexity Grade</label>
                  <select className="input font-bold" value={form.difficulty} onChange={e => setField("difficulty", e.target.value)}>
                    {["Easy", "Moderate", "Challenging", "Expert"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Expedition Brief</label>
                <textarea className="input font-medium min-h-[120px]" rows={4} placeholder="Detailed mission parameters, ecological impact, and traveler expectations..." value={form.description} onChange={e => setField("description", e.target.value)} />
              </div>
            </div>
          </section>

          {/* Operational Highlights */}
          <section className="card-premium space-y-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Mountain size={20} />
                </div>
                <h2 className="text-xl font-black text-[var(--foreground)] m-0">Mission Highlights</h2>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary !py-2 !px-4 !text-[10px] !font-black !uppercase !tracking-widest"
                onClick={() => setHighlights(prev => [...prev, ""])}
              >
                <Plus size={14} className="mr-2" /> Add Point
              </button>
            </div>

            <div className="space-y-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex-1">
                    <input 
                      className="input font-bold !bg-[var(--muted)] focus:!bg-[var(--card)]" 
                      placeholder={`Strategic Highlight #${i + 1}`} 
                      value={h} 
                      onChange={e => setHighlights(prev => prev.map((v, j) => j === i ? e.target.value : v))} 
                    />
                  </div>
                  {i > 0 && (
                    <button 
                      type="button" 
                      className="w-12 h-12 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                      onClick={() => setHighlights(prev => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Asset Management */}
          <section className="card-premium space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Visual Assets</h2>
            </div>

            <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] p-12 text-center bg-[var(--muted)]/50 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group">
              <div className="w-20 h-20 bg-[var(--card)] rounded-[24px] flex items-center justify-center text-[var(--muted-foreground)] mx-auto mb-6 shadow-xl border border-[var(--border)] group-hover:scale-110 transition-transform">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-lg font-black text-[var(--foreground)] mb-2 tracking-tight">Synchronize Media</h3>
              <p className="text-[var(--muted-foreground)] text-xs font-medium max-w-[240px] mx-auto uppercase tracking-widest leading-loose">
                Drop high-resolution assets here or tap to interface with file system
              </p>
              <p className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.2em] mt-8 opacity-40">JPG, PNG, WEBP • Max 10MB per payload</p>
              <input type="file" accept="image/*" multiple className="hidden" />
            </div>
          </section>
        </div>

        {/* ── Right Intelligence Sidebar ── */}
        <div className="space-y-10">
          
          {/* Revenue Configuration */}
          <section className="card-premium space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Rocket size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Financials</h2>
            </div>
            
            <div className="input-group">
              <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Price per Personnel (PKR)</label>
              <div className="relative">
                <input 
                  className="input !pl-10 !text-xl !font-black text-emerald-500" 
                  type="number" 
                  placeholder="45000" 
                  min={0} 
                  value={form.price} 
                  onChange={e => setField("price", e.target.value)} 
                  required 
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">₨</span>
              </div>
            </div>

            <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 space-y-4">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pricing Strategy Insight</p>
              <p className="text-xs font-medium text-[var(--muted-foreground)] leading-relaxed italic">
                Competitive analysis suggests a price point between ₨38,000 - ₨52,000 for {form.destination} expeditions.
              </p>
            </div>
          </section>

          {/* Service Inclusions */}
          <section className="card-premium space-y-6">
            <h3 className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Service Protocol</h3>
            <div className="space-y-2">
              {INCLUSIONS.map((item, i) => (
                <label key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group">
                  <div className="relative w-5 h-5">
                    <input 
                      type="checkbox" 
                      checked={included[i]} 
                      onChange={e => setIncluded(prev => prev.map((v, j) => j === i ? e.target.checked : v))} 
                      className="peer appearance-none w-5 h-5 border-2 border-[var(--border)] rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                    />
                    <CheckCircle2 size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Deployment Schedule */}
          <section className="card-premium space-y-6">
             <div className="flex items-center gap-3 mb-2">
              <Calendar size={16} className="text-emerald-500" />
              <h3 className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Availability</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="input-group">
                <label className="input-label !text-[10px] !font-black">Active From</label>
                <input className="input font-bold" type="date" min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="input-group">
                <label className="input-label !text-[10px] !font-black">Decommission On</label>
                <input className="input font-bold" type="date" />
              </div>
            </div>
          </section>

          {/* Execution Button */}
          <button 
            type="submit" 
            className="btn btn-emerald w-full !py-6 !rounded-[24px] shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 group active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? <div className="loading-spinner w-5 h-5 border-current" /> : <Rocket size={20} className="group-hover:-translate-y-1 transition-transform" />}
            <span className="text-base font-black uppercase tracking-widest">{submitting ? "Initiating Protocol..." : "Publish Expedition"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
