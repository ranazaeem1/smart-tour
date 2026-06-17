"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { formatPKR } from "@/lib/data";

interface Tour {
  id: string;
  title: string;
  image_url: string;
  category: string;
  duration: number;
  destination: string;
  price: number;
}

interface RecommendedTourCardProps {
  tour: Tour;
}

export function RecommendedTourCard({ tour }: RecommendedTourCardProps) {
  return (
    <article className="card p-0 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={tour.image_url} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={tour.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" aria-hidden="true" />
        <div className="absolute bottom-4 left-4">
          <span className="badge badge-emerald !bg-white/90 backdrop-blur-md shadow-lg border-none text-[10px] text-slate-900">{tour.category}</span>
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-lg font-black text-[var(--foreground)] mb-2 leading-tight">{tour.title}</h3>
        <div className="flex items-center gap-4 text-[var(--muted-foreground)] text-[11px] font-bold uppercase tracking-widest mb-6">
          <span className="flex items-center gap-1"><Clock size={14} className="text-emerald-500" aria-hidden="true" /> {tour.duration} Days</span>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-emerald-500" aria-hidden="true" /> {tour.destination}</span>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
          <p className="text-lg font-black text-emerald-500">{formatPKR(tour.price)}</p>
          <Link 
            href={`/user/tours/${tour.id}`} 
            className="w-11 h-11 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-emerald-500 transition-all active:scale-90 flex items-center justify-center shadow-lg"
            aria-label={`View details for ${tour.title}`}
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
