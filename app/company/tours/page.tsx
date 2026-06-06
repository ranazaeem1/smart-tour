"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchCompanyByOwner, fetchTours, updateTour } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { getTourImage } from "@/lib/tourImages";
import { useAuth } from "@/components/AuthProvider";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  MapPin,
  Mountain,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Shield,
  Star,
  Wallet,
} from "lucide-react";

interface Tour {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  rating: number;
  safety_score?: number;
  safetyScore?: number;
  available: boolean;
  category: string;
  difficulty: string;
  image_url?: string | null;
  image?: string;
  tags?: string[];
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : tone.includes("rose") ? "bg-rose-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <Icon size={15} className="text-emerald-500 mb-3" />
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800 truncate">{value}</p>
    </div>
  );
}

export default function CompanyToursPage() {
  const { profile } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [companyStatus, setCompanyStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        setCompanyStatus(typeof company?.status === "string" ? company.status : null);
        if (company?.id) setTours((await fetchTours({ companyId: company.id })) as Tour[]);
      } catch (err) {
        console.error("Failed to load tours:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const handleToggle = async (id: string, current: boolean) => {
    setNotice(null);
    if (!current && companyStatus !== "approved") {
      setNotice("Your company must be approved by admin before publishing tours.");
      return;
    }

    setUpdatingId(id);
    try {
      const updated = await updateTour(id, { available: !current });
      if (!updated) {
        setNotice("Tour could not be published because this company is not approved.");
        return;
      }
      setTours(prev => prev.map(t => (t.id === id ? { ...t, available: !current } : t)));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      tours
        .filter(t => filterStatus === "all" || (filterStatus === "active" ? t.available : !t.available))
        .filter(t => `${t.title} ${t.destination}`.toLowerCase().includes(search.toLowerCase())),
    [tours, filterStatus, search]
  );

  const avgRating = tours.length ? (tours.reduce((sum, tour) => sum + (tour.rating || 0), 0) / tours.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading tours...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Mountain size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Package Inventory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">My Tours</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-80">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search tour or destination..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {companyStatus === "approved" ? (
            <Link href="/company/tours/new" className="btn btn-emerald !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2">
              <Plus size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Add Tour</span>
            </Link>
          ) : (
            <button type="button" className="btn btn-secondary !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2 opacity-70 cursor-not-allowed" onClick={() => setNotice("Your company must be approved by admin before adding tours.")}>
              <Plus size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Add Tour</span>
            </button>
          )}
        </div>
      </div>

      {(companyStatus !== "approved" || notice) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
          {notice || "Your company is not approved right now. Tour publishing is disabled until admin approves the company."}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Packages" value={tours.length} icon={Mountain} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Active Tours" value={tours.filter(t => t.available).length} icon={Activity} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Inactive Tours" value={tours.filter(t => !t.available).length} icon={Pause} tone="bg-rose-50 text-rose-500" />
        <StatCard label="Average Rating" value={avgRating} icon={Star} tone="bg-amber-50 text-amber-500" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex w-full overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
          {["all", "active", "inactive"].map(item => (
            <button key={item} onClick={() => setFilterStatus(item)} className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === item ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"}`}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Mountain size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No tours found</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Try another search or add a new package.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(tour => (
              <article key={tour.id} className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 hover:shadow-xl transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_auto] gap-5 items-center">
                  <img src={getTourImage(tour)} alt={tour.title} className="h-40 lg:h-32 w-full rounded-2xl object-cover border border-slate-100" />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${tour.available ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-500 border-rose-200"}`}>
                        {tour.available ? "Active" : "Inactive"}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                        {tour.category || "Tour"}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 truncate">{tour.title}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 capitalize">{tour.difficulty || "Standard"} grade package</p>

                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
                      <InfoTile icon={MapPin} label="Destination" value={tour.destination} />
                      <InfoTile icon={CalendarDays} label="Duration" value={`${tour.duration} days`} />
                      <InfoTile icon={Wallet} label="Price" value={formatPKR(tour.price || 0)} />
                      <InfoTile icon={Shield} label="Safety" value={`${tour.safety_score ?? tour.safetyScore ?? 85}%`} />
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 justify-end">
                    <button onClick={() => handleToggle(tour.id, tour.available)} disabled={updatingId === tour.id || (!tour.available && companyStatus !== "approved")} className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all ${tour.available ? "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white" : companyStatus === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`} aria-label={tour.available ? "Deactivate tour" : "Activate tour"}>
                      {updatingId === tour.id ? <span className="loading-spinner h-5 w-5" /> : tour.available ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <Link href={`/company/tours/new?edit=${tour.id}`} className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-950 hover:text-white transition-all" aria-label="Edit tour">
                      <Settings2 size={18} />
                    </Link>
                    <Link href="/company/bookings" className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-950 hover:text-white transition-all" aria-label="View bookings">
                      <ClipboardList size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
