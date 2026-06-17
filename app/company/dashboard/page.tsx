"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Building2, ChevronRight, ClipboardList, Mountain, Plus, Search, Star, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, fetchCompanyByOwner, fetchRevenueStats, fetchReviews, fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { PerformanceOverview } from "@/components/company/PerformanceOverview";
import { SentimentAnalysis } from "@/components/company/SentimentAnalysis";
import { TourCatalog } from "@/components/company/TourCatalog";
import { RecentExpeditions } from "@/components/company/RecentExpeditions";

export default function CompanyDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const companyProfile = await fetchCompanyByOwner(profile.id);
        if (companyProfile) {
          const [fetchedTours, fetchedBookings, fetchedReviews, fetchedRevenue] = await Promise.all([
            fetchTours({ companyId: companyProfile.id }),
            fetchBookings({ companyId: companyProfile.id }),
            fetchReviews(),
            fetchRevenueStats(companyProfile.id),
          ]);
          setTours(fetchedTours || []);
          setBookings(fetchedBookings || []);
          setReviews((fetchedReviews || []).slice(0, 3));
          setRevenueStats(fetchedRevenue || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [profile]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4" role="status" aria-live="polite">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Initializing Operational Hub...</p>
      </div>
    );
  }

  const activeTours = tours.filter(tour => tour.available).length;
  const totalRevenue = revenueStats.reduce((sum, month) => sum + (month.revenue || 0), 0);
  const avgRating = tours.length ? (tours.reduce((sum, tour) => sum + (tour.rating || 0), 0) / tours.length).toFixed(1) : "0.0";

  const stats = [
    { label: "Active Packages", value: activeTours, icon: <Mountain size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Reservations", value: bookings.length, icon: <ClipboardList size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Net Revenue", value: formatPKR(totalRevenue), icon: <Wallet size={20} />, color: "#3B82F6", bg: "bg-blue-50" },
    { label: "Average Rating", value: avgRating, icon: <Star size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
  ];

  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((review: any) => review.sentiment === "positive").length;
  const neutralReviews = reviews.filter((review: any) => review.sentiment === "neutral").length;
  const negativeReviews = reviews.filter((review: any) => review.sentiment === "negative").length;
  const sentimentData = [
    { label: "Positive", value: totalReviews ? Math.round((positiveReviews / totalReviews) * 100) : 0, color: "#10B981" },
    { label: "Neutral", value: totalReviews ? Math.round((neutralReviews / totalReviews) * 100) : 0, color: "#F59E0B" },
    { label: "Negative", value: totalReviews ? Math.round((negativeReviews / totalReviews) * 100) : 0, color: "#EF4444" },
  ];

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operational Excellence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">{profile?.full_name || "Enterprise Hub"}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search operations..." readOnly />
          </div>
          <Link href="/company/tours/new" className="rounded-2xl bg-emerald-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all inline-flex items-center justify-center gap-2">
            <Plus size={16} />
            Add Tour
          </Link>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr_auto] gap-6 xl:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Building2 size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-slate-950 truncate m-0">Enterprise Hub</h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Expedition Operator</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <HeroTile icon={<Activity size={16} />} label="Network" value="Synchronized" />
            <HeroTile icon={<Mountain size={16} />} label="Sector" value="Northern Pakistan" />
            <HeroTile icon={<Building2 size={16} />} label="Access" value="Corporate" />
          </div>

          <span className="badge badge-emerald !rounded-full !px-4 !py-1.5 !text-[9px] justify-self-start xl:justify-self-end">Verified</span>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Key Performance Indicators">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${stat.bg}`} style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <div className="text-3xl font-black mb-1 text-slate-950">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PerformanceOverview data={revenueStats} />
        <SentimentAnalysis data={sentimentData} recentReviews={reviews} />
      </div>

      <section className="space-y-5">
        <TourCatalog tours={tours} />
        <RecentExpeditions bookings={bookings} />
      </section>

      <div className="flex justify-center pt-6">
        <Link href="/company/settings" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all inline-flex items-center gap-2 group">
          Company Profile Management <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

function HeroTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <div className="text-emerald-500 mb-2">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
