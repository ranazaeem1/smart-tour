"use client";

import Link from "next/link";
import { MapPin, Mountain, Settings2, Star, Wallet } from "lucide-react";
import { formatPKR } from "@/lib/data";

interface Tour {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  rating: number;
  available: boolean;
}

interface TourCatalogProps {
  tours: Tour[];
}

export function TourCatalog({ tours }: TourCatalogProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mountain size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tour Catalog</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Expedition Catalog</h2>
        </div>
        <Link href="/company/tours" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all">
          Manage Catalog
        </Link>
      </div>

      <div className="space-y-5">
        {tours.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 font-bold">No tour packages yet.</p>
          </div>
        ) : (
          tours.slice(0, 5).map(tour => (
            <article key={tour.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr_auto] gap-6 xl:items-center">
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-950 truncate m-0">{tour.title}</h3>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{tour.duration} days</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoTile icon={<MapPin size={16} />} label="Destination" value={tour.destination} />
                  <InfoTile icon={<Wallet size={16} />} label="Price" value={formatPKR(tour.price)} />
                  <InfoTile icon={<Star size={16} />} label="Rating" value={tour.rating ? tour.rating.toString() : "N/A"} />
                </div>
                <div className="flex xl:flex-col items-center xl:items-end gap-3">
                  <span className={`badge ${tour.available ? "badge-emerald" : "badge-rose"} !rounded-full !px-4 !py-1.5 !text-[9px]`}>
                    {tour.available ? "Active" : "Inactive"}
                  </span>
                  <Link href={`/company/tours/new?edit=${tour.id}`} className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 inline-flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all" aria-label={`Edit ${tour.title}`}>
                    <Settings2 size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <div className="text-emerald-500 mb-2">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
