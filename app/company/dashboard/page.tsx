"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  fetchTours, 
  fetchBookings, 
  fetchReviews, 
  fetchRevenueStats, 
  fetchCompanyByOwner 
} from "@/lib/db";
import { formatPKR } from "@/lib/data";
import Link from "next/link";
import { 
  Mountain, 
  ClipboardList, 
  Wallet, 
  Star, 
  Plus, 
  Building2,
  Activity,
  ChevronRight
} from "lucide-react";

// Modular Company Components
import { StatCard } from "@/components/dashboard/StatCard";
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
      if (profile?.id) {
        setLoading(true);
        try {
          const companyProfile = await fetchCompanyByOwner(profile.id);
          if (companyProfile) {
            const [fetchedTours, fetchedBookings, fetchedReviews, fetchedRevenue] = await Promise.all([
              fetchTours({ companyId: companyProfile.id }),
              fetchBookings({ companyId: companyProfile.id }),
              fetchReviews(),
              fetchRevenueStats()
            ]);
            setTours(fetchedTours || []);
            setBookings(fetchedBookings || []);
            setReviews(fetchedReviews.slice(0, 3) || []);
            setRevenueStats(fetchedRevenue || []);
          }
        } catch (err) {
          console.error("Dashboard load error:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [profile]);

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4" role="status" aria-live="polite">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Initializing Operational Hub...</p>
    </div>
  );

  // Performance calculations
  const activeTours = tours.filter(t => t.available).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgRating = tours.length ? (tours.reduce((sum, t) => sum + (t.rating || 0), 0) / tours.length).toFixed(1) : "0.0";

  const stats = [
    { label: "Active Packages", value: activeTours, icon: Mountain, color: "bg-emerald-500", aria: "Total active tour packages" },
    { label: "Total Reservations", value: bookings.length, icon: ClipboardList, color: "bg-slate-900", aria: "Total customer bookings" },
    { label: "Net Revenue", value: formatPKR(totalRevenue), icon: Wallet, color: "bg-slate-900", aria: "Total revenue earned" },
    { label: "Average Rating", value: `${avgRating} ★`, icon: Star, color: "bg-amber-500", aria: "Average customer rating" },
  ];

  // Sentiment data computation
  const totalReviews = reviews.length;
  const posCount = reviews.filter((r: any) => r.sentiment === 'positive').length;
  const neutralCount = reviews.filter((r: any) => r.sentiment === 'neutral').length;
  const negCount = reviews.filter((r: any) => r.sentiment === 'negative').length;
  const sentimentData = [
    { label: 'Positive', value: totalReviews ? Math.round((posCount / totalReviews) * 100) : 0, color: '#10B981' },
    { label: 'Neutral', value: totalReviews ? Math.round((neutralCount / totalReviews) * 100) : 0, color: '#F59E0B' },
    { label: 'Negative', value: totalReviews ? Math.round((negCount / totalReviews) * 100) : 0, color: '#EF4444' },
  ];

  return (
    <div className="animate-fade space-y-10" role="main">
      {/* ── Operator Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-emerald inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border">
              <Activity size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Excellence</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              {profile?.full_name || "Enterprise Hub"}
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Verified Expedition Operator • Northern Pakistan Sector</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="text-right hidden md:block">
              <span className="panel-hero-badge badge badge-emerald flex items-center gap-2">
                <Building2 size={12} />
                Corporate Access
              </span>
              <p className="panel-hero-network text-[10px] font-bold mt-2 uppercase tracking-widest">Network Synchronized</p>
            </div>

            <Link
              href="/company/tours/new"
              className="btn btn-emerald min-h-[56px] px-10 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-all"
              aria-label="Add a new expedition package"
            >
              <Plus size={20} />
              <span className="text-sm font-black tracking-widest uppercase">Add New Tour</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4-Column Stats Grid ── */}
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

      {/* ── Analytics & Insights Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <PerformanceOverview data={revenueStats} />
        <SentimentAnalysis data={sentimentData} recentReviews={reviews} />
      </div>

      {/* ── Operations Management ── */}
      <section className="space-y-10">
        <TourCatalog tours={tours} />
        <RecentExpeditions bookings={bookings} />
      </section>

      {/* ── Footer Action ── */}
      <div className="flex justify-center pt-10">
        <Link 
          href="/company/settings" 
          className="btn btn-secondary flex items-center gap-2 group"
          aria-label="Access company profile settings"
        >
          Company Profile Management <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
