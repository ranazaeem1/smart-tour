"use client";

import Link from "next/link";
import { ArrowRight, Calendar, ClipboardList, Mountain, Users, Wallet } from "lucide-react";
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
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Reservation Ledger</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Recent Reservations</h2>
        </div>
        <Link href="/company/bookings" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all inline-flex items-center gap-2">
          Global Ledger <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-5">
        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 font-bold">No reservations yet.</p>
          </div>
        ) : (
          bookings.slice(0, 5).map(booking => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr_auto] gap-6 xl:items-center">
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-950 truncate m-0">{booking.profiles?.full_name || "Guest Traveler"}</h3>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#{booking.id.slice(0, 8)}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoTile icon={<Mountain size={16} />} label="Package" value={booking.tours?.title || "Custom Expedition"} />
                  <InfoTile icon={<Calendar size={16} />} label="Date" value={new Date(booking.travel_date).toLocaleDateString("en-PK")} />
                  <InfoTile icon={<Wallet size={16} />} label="Revenue" value={formatPKR(booking.total_price)} />
                </div>
                <div className="flex xl:flex-col items-center xl:items-end gap-3">
                  <span className={`badge ${getStatusColor(booking.status)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>{booking.status}</span>
                  <div className="inline-flex items-center gap-1 text-xs font-black text-slate-500">
                    <Users size={14} />
                    {booking.group_size}
                  </div>
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
