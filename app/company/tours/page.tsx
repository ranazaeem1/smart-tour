"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTours, updateTour, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { getTourImage } from "@/lib/tourImages";
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Mountain, 
  Star, 
  Shield, 
  Settings2, 
  ClipboardList, 
  Pause, 
  Play,
  Activity,
  ArrowRight,
  Info
} from "lucide-react";

interface Tour {
  id: string; title: string; destination: string; price: number;
  duration: number; rating: number; safety_score?: number; safetyScore?: number;
  available: boolean; category: string; difficulty: string;
  companies?: { name: string } | null; company?: string;
  image_url?: string | null; image?: string;
  tags?: string[]; review_count?: number; reviews?: number;
}

export default function CompanyToursPage() {
  const { profile } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        setLoading(true);
        try {
          const company = await fetchCompanyByOwner(profile.id);
          if (company && company.id) {
            const raw = await fetchTours({ companyId: company.id });
            setTours(raw as Tour[]);
          }
        } catch (err) {
          console.error("Failed to load tours:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [profile]);

  const handleToggle = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      await updateTour(id, { available: !current });
      setTours(prev => prev.map(t => t.id === id ? { ...t, available: !current } : t));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = tours
    .filter(t => filterStatus === "all" || (filterStatus === "active" ? t.available : !t.available))
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Syncing Expedition Ledger...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Expedition Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-emerald inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-4 border">
              <Mountain size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Package Inventory</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Expedition Catalog
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Manage your regional offerings and deployment status.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="text-right hidden md:block">
              <span className="panel-hero-badge badge badge-emerald">
                {tours.filter(t => t.available).length} Active Units
              </span>
            </div>
            <Link
              href="/company/tours/new"
              className="btn btn-emerald min-h-[56px] px-10 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-all"
            >
              <Plus size={20} />
              <span className="text-sm font-black tracking-widest uppercase">Add New Tour</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex bg-[var(--muted)] p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] w-full lg:w-auto overflow-x-auto">
          {["all", "active", "inactive"].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-[var(--radius-md)] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${filterStatus === f ? "bg-[var(--card)] text-[var(--foreground)] shadow-lg" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-md group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by title or locale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-12 !py-4 font-black"
          />
        </div>
      </div>

      {/* ── Tour Grid ── */}
      {filtered.length === 0 ? (
        <section className="card-premium py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[var(--muted)] rounded-[32px] flex items-center justify-center text-[var(--muted-foreground)] mb-8 shadow-inner border border-[var(--border)]">
            <Mountain size={40} />
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight">No Expeditions Found</h2>
          <p className="text-[var(--muted-foreground)] font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            {search ? "Zero matches found for your current filter parameters." : "Start by adding your first tour package to the platform catalog."}
          </p>
          <Link href="/company/tours/new" className="btn btn-emerald px-10 py-5 !rounded-2xl shadow-xl shadow-emerald-500/20">
            Create First Package <ArrowRight size={20} className="ml-2" />
          </Link>
        </section>
      ) : (
        <div className="space-y-8">
          {filtered.map((tour, idx) => (
            <article 
              key={tour.id} 
              className="card-premium !p-0 overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-500 border border-[var(--border)] hover:border-emerald-500/30 animate-fade"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-full md:w-80 h-64 md:h-auto overflow-hidden relative">
                <img
                  src={getTourImage(tour)}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                  <span className={`badge ${tour.available ? "badge-emerald shadow-lg shadow-emerald-950/40" : "badge-rose shadow-lg shadow-rose-950/40"} !px-4 !py-2 !text-[10px] !font-black !rounded-xl border border-white/20 backdrop-blur-md`}>
                    {tour.available ? "ACTIVE UNIT" : "OFF-LINE"}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-[var(--foreground)] m-0 tracking-tight group-hover:text-emerald-500 transition-colors">{tour.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{tour.destination}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <Clock size={14} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{tour.duration} Days</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <Activity size={14} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest capitalize">{tour.difficulty} Grade</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {(tour.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[var(--border)] group-hover:bg-[var(--card)] transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-[var(--border)]">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Starting From</p>
                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">{formatPKR(tour.price)}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span className="text-base font-black text-[var(--foreground)]">{tour.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Safety Integrtiy</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield size={16} className="text-emerald-500" />
                      <span className="text-base font-black text-[var(--foreground)]">{tour.safety_score || 85}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 lg:col-span-1">
                    <button
                      onClick={() => handleToggle(tour.id, tour.available)}
                      disabled={updatingId === tour.id}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg ${tour.available ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"}`}
                      aria-label={tour.available ? "Deactivate package" : "Activate package"}
                    >
                      {updatingId === tour.id ? <div className="loading-spinner w-5 h-5 border-current" /> : (tour.available ? <Pause size={20} /> : <Play size={20} />)}
                    </button>
                    <Link 
                      href={`/company/tours/new?edit=${tour.id}`} 
                      className="w-12 h-12 flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-slate-900 hover:text-white rounded-2xl border border-[var(--border)] transition-all shadow-lg"
                      aria-label="Edit expedition details"
                    >
                      <Settings2 size={20} />
                    </Link>
                    <Link 
                      href="/company/bookings" 
                      className="w-12 h-12 flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-slate-900 hover:text-white rounded-2xl border border-[var(--border)] transition-all shadow-lg"
                      aria-label="View associated reservations"
                    >
                      <ClipboardList size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
      {/* ── Footer Stats ── */}
      <div className="flex items-center justify-center gap-6 pt-10 border-t border-[var(--border)] opacity-50 grayscale hover:grayscale-0 transition-all">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[var(--muted-foreground)]" />
          <p className="text-[10px] font-black uppercase tracking-widest">Operator Portal v2.0</p>
        </div>
        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
        <p className="text-[10px] font-black uppercase tracking-widest">Real-time ledger sync active</p>
      </div>
    </div>
  );
}
