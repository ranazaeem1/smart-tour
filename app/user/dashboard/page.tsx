"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookingsByUser, fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import Link from "next/link";
import { 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  Bookmark, 
  Compass,
} from "lucide-react";

// Modular Dashboard Components
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpeditionLedger } from "@/components/dashboard/ExpeditionLedger";
import { RecommendedTourCard } from "@/components/dashboard/RecommendedTourCard";
import { QuickAnalysisPanel } from "@/components/dashboard/QuickAnalysisPanel";

export default function UserDashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (profile?.id) {
        const [userBookings, allTours] = await Promise.all([
          fetchBookingsByUser(profile.id),
          fetchTours()
        ]);
        setBookings(userBookings || []);
        setTours(allTours?.slice(0, 3) || []);
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4" role="status" aria-live="polite">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Synchronizing Dashboard...</p>
    </div>
  );

  const stats = [
    { label: "Upcoming Trips", value: bookings.filter(b => b.status === 'confirmed').length, icon: Calendar, color: "bg-emerald-500", aria: "View upcoming trips" },
    { label: "Total Investment", value: formatPKR(bookings.reduce((acc, b) => acc + (b.total_price || 0), 0)), icon: Wallet, color: "bg-slate-900", aria: "Total amount invested in tours" },
    { label: "Tours Completed", value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle2, color: "bg-slate-800", aria: "Number of tours successfully completed" },
    { label: "Active Bookings", value: bookings.length, icon: Bookmark, color: "bg-amber-500", aria: "Total number of active and past bookings" },
  ];

  const quickStats = [
    { label: "Confirmed", value: bookings.filter(b => b.status === 'confirmed').length, color: "text-slate-900 dark:text-slate-100", bg: "bg-slate-50 dark:bg-slate-900/10" },
    { label: "Pending", value: bookings.filter(b => b.status === 'pending').length, color: "text-orange-600 dark:text-orange-400", bg: "bg-tint-orange" },
    { label: "Completed", value: bookings.filter(b => b.status === 'completed').length, color: "text-green-600 dark:text-green-400", bg: "bg-tint-green" },
    { label: "Total Spent", value: formatPKR(bookings.reduce((acc, b) => acc + (b.total_price || 0), 0)), color: "text-purple-600 dark:text-purple-400", bg: "bg-tint-purple" },
  ];

  return (
    <div className="animate-fade space-y-10" role="main">
      {/* 4-Column Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8" aria-label="Key Performance Indicators">
        {stats.map((stat, i) => (
          <StatCard 
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            ariaLabel={stat.aria}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Main Content (2 Columns) */}
        <section className="lg:col-span-2 space-y-10" aria-label="Recent Activities">
          {/* Recent Bookings Table */}
          <ExpeditionLedger bookings={bookings} />

          {/* Recommended Tours Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Recommended Expeditions</h2>
              <Link 
                href="/user/tours" 
                className="btn btn-emerald"
                aria-label="Browse all available tours"
              >
                Browse All Tours <Compass size={16} className="ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tours.slice(0, 2).map((tour) => (
                <RecommendedTourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>

        {/* Right: Quick Analysis & Insights (1 Column) */}
        <QuickAnalysisPanel stats={quickStats} />
      </div>
    </div>
  );
}
