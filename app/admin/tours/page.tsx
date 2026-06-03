"use client";

import { useEffect, useState } from "react";
import { fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { Building2, Clock, MapPin, Mountain, Search, ShieldCheck, Star, Wallet } from "lucide-react";

interface Tour {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  rating: number;
  safety_score: number;
  available: boolean;
  companies?: { name: string } | null;
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTours({ admin: true });
        if (data) setTours(data as unknown as Tour[]);
      } catch (err) {
        console.error("Error loading admin tours:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = tours.filter(t => {
    const term = search.toLowerCase();
    return t.title.toLowerCase().includes(term) || t.destination.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mountain size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tour Inventory</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">All Tours</h1>
        </div>

        <span className="badge badge-teal !rounded-full !px-4 !py-2">{tours.length} Tours Listed</span>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search by title or destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-500 font-bold">No tours found.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(tour => (
              <article key={tour.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-7">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`badge ${tour.available ? "badge-emerald" : "badge-rose"} !rounded-full !px-4 !py-1.5`}>
                        {tour.available ? "Active" : "Inactive"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{tour.id.slice(0, 8)}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-950 truncate m-0">{tour.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span className="inline-flex items-center gap-2"><Building2 size={14} className="text-emerald-500" />{tour.companies?.name || "Unassigned"}</span>
                      <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-emerald-500" />{tour.destination}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Wallet size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</p>
                      <p className="text-base font-black text-emerald-500">{formatPKR(tour.price)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Clock size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                      <p className="text-base font-black text-slate-950">{tour.duration}d</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Star size={16} className="text-amber-400 mb-2" fill="currentColor" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</p>
                      <p className="text-base font-black text-slate-950">{tour.rating}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <ShieldCheck size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety</p>
                      <p className={`text-base font-black ${tour.safety_score >= 90 ? "text-emerald-500" : tour.safety_score >= 80 ? "text-amber-500" : "text-rose-500"}`}>
                        {tour.safety_score}%
                      </p>
                    </div>
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
