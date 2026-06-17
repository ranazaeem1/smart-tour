"use client";

import Link from "next/link";
import { ArrowRight, History, MapPin } from "lucide-react";
import { formatPKR, getStatusColor } from "@/lib/data";

interface Booking {
  id: string;
  travel_date: string;
  total_price: number;
  status: string;
  tours: {
    title: string;
    destination: string;
  };
}

interface ExpeditionLedgerProps {
  bookings: Booking[];
}

export function ExpeditionLedger({ bookings }: ExpeditionLedgerProps) {
  return (
    <div className="card-premium overflow-hidden !p-0">
      <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <History className="text-emerald-500" size={20} aria-hidden="true" />
          <h2 className="text-xl font-black text-[var(--foreground)] m-0">Expedition Ledger</h2>
        </div>
        <Link 
          href="/user/bookings" 
          className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 flex items-center gap-2 group min-h-[44px] px-4 transition-colors"
          aria-label="View all booking records"
        >
          View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Expedition</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Investment</th>
              <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {bookings.slice(0, 5).map((booking) => (
              <tr key={booking.id} className="hover:bg-[var(--muted)] transition-colors group">
                <td className="px-8 py-5">
                  <p className="text-[13px] font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">{booking.tours?.title}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] font-medium flex items-center gap-1 mt-1">
                    <MapPin size={10} aria-hidden="true" /> {booking.tours?.destination}
                  </p>
                </td>
                <td className="px-8 py-5 text-[12px] font-bold text-[var(--muted-foreground)]">
                  {new Date(booking.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-8 py-5 text-[12px] font-black text-[var(--foreground)]">
                  {formatPKR(booking.total_price)}
                </td>
                <td className="px-8 py-5">
                  <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-10 text-center text-[var(--muted-foreground)] font-medium italic">No expeditions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
