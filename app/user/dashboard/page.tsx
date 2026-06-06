"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookingsByUser, fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { getTourImage } from "@/lib/tourImages";
import { Bookmark, Calendar, CheckCircle2, Compass, MapPin, Search, Star, Wallet } from "lucide-react";

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "confirmed" || status === "completed") return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-600 border-amber-200";
  if (status === "cancelled") return "bg-rose-50 text-rose-500 border-rose-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function UserDashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return;
      try {
        const [userBookings, allTours] = await Promise.all([fetchBookingsByUser(profile.id), fetchTours()]);
        setBookings(userBookings || []);
        setTours(allTours?.slice(0, 3) || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  const totalSpent = bookings.reduce((acc, booking) => acc + (booking.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4" role="status" aria-live="polite">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Compass size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Traveler Overview</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Dashboard</h1>
        </div>

        <Link href="/user/tours" className="btn btn-emerald !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2">
          <Search size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Browse Tours</span>
        </Link>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" aria-label="Key metrics">
        <StatCard label="Upcoming Trips" value={bookings.filter(b => b.status === "confirmed").length} icon={Calendar} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Total Spent" value={formatPKR(totalSpent)} icon={Wallet} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Completed" value={bookings.filter(b => b.status === "completed").length} icon={CheckCircle2} tone="bg-amber-50 text-amber-500" />
        <StatCard label="All Bookings" value={bookings.length} icon={Bookmark} tone="bg-slate-100 text-slate-900" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-950">Recent Bookings</h2>
              <p className="text-xs font-bold text-slate-500">Your latest reservations and trip status</p>
            </div>
            <Link href="/user/bookings" className="text-[10px] font-black uppercase tracking-widest text-emerald-600">View All</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar size={42} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-950">No bookings yet</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Start with a tour reservation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                      <Calendar size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-slate-950 truncate">{booking.tours?.title || booking.tourTitle || "Tour package"}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{booking.travel_date ? new Date(booking.travel_date).toLocaleDateString() : "Date pending"}</p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusClass(booking.status)}`}>{booking.status}</span>
                      <span className="text-sm font-black text-emerald-600">{formatPKR(booking.total_price || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <h2 className="text-xl font-black text-slate-950">Recommended</h2>
          </div>

          <div className="space-y-4">
            {tours.map(tour => (
              <Link key={tour.id} href="/user/tours" className="block rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                <img src={getTourImage(tour)} alt={tour.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-sm font-black text-slate-950 truncate">{tour.title}</h3>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-500" />
                      {tour.destination}
                    </span>
                    <span className="text-xs font-black text-emerald-600">{formatPKR(tour.price || 0)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
