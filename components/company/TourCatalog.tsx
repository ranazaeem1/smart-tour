"use client";

import Link from "next/link";
import { Mountain, MapPin, Star, Settings2 } from "lucide-react";
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
    <div className="card-premium !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <Mountain size={20} />
          </div>
          <h2 className="text-xl font-black text-[var(--foreground)] m-0">Expedition Catalog</h2>
        </div>
        <Link 
          href="/company/tours" 
          className="btn btn-secondary !py-2 !px-5 !text-[10px]"
          aria-label="View full expedition catalog"
        >
          Manage Catalog
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Package</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Locale</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Investment</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Health</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {tours.slice(0, 5).map((t) => (
              <tr key={t.id} className="hover:bg-[var(--muted)] transition-colors group">
                <td className="px-8 py-5">
                  <p className="text-[13px] font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">{t.title}</p>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-1">{t.duration} Days</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[12px] font-bold text-[var(--foreground)] flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-500" /> {t.destination}
                  </p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[12px] font-black text-emerald-500">{formatPKR(t.price)}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-black text-[var(--foreground)]">{t.rating}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`badge ${t.available ? "badge-emerald" : "badge-rose"}`}>
                    {t.available ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <Link 
                    href={`/company/tours/new?edit=${t.id}`} 
                    className="w-9 h-9 inline-flex items-center justify-center bg-[var(--muted)] hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                    aria-label={`Edit ${t.title}`}
                  >
                    <Settings2 size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
