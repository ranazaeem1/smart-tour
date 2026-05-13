"use client";

import Link from "next/link";
import { ClipboardList, User, Calendar, ArrowRight } from "lucide-react";
import { formatPKR, getStatusColor } from "@/lib/data";

interface Booking {
  id: string;
  travel_date: string;
  group_size: number;
  total_price: number;
  status: string;
  profiles: {
    full_name: string;
  };
  tours: {
    title: string;
  };
}

interface RecentExpeditionsProps {
  bookings: Booking[];
}

export function RecentExpeditions({ bookings }: RecentExpeditionsProps) {
  return (
    <div className="card-premium !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <ClipboardList size={20} />
          </div>
          <h2 className="text-xl font-black text-[var(--foreground)] m-0">Recent Reservations</h2>
        </div>
        <Link 
          href="/company/bookings" 
          className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors flex items-center gap-2 group px-4 py-2"
          aria-label="View all customer reservations"
        >
          Global Ledger <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Traveler</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Package</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Deployment</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Revenue</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {bookings.slice(0, 5).map((b) => (
              <tr key={b.id} className="hover:bg-[var(--muted)] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] border border-[var(--border)]" aria-hidden="true">
                      <User size={14} />
                    </div>
                    <p className="text-[13px] font-black text-[var(--foreground)] leading-none">{b.profiles?.full_name || "Guest Traveler"}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[12px] font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors leading-tight">{b.tours?.title || "Custom Expedition"}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-emerald-500" />
                    <p className="text-[12px] font-bold text-[var(--muted-foreground)] uppercase tracking-tighter">
                      {new Date(b.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[13px] font-black text-emerald-500">{formatPKR(b.total_price)}</p>
                  <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase mt-1">{b.group_size} Personnel</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`badge ${getStatusColor(b.status)}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
