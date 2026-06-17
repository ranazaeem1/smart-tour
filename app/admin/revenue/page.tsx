"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Download, Landmark, Search, TrendingUp, Wallet } from "lucide-react";
import { fetchPlatformStats, fetchRevenueStats } from "@/lib/db";
import { formatPKR } from "@/lib/data";

type RevenueMonth = { month: string; revenue: number; bookings: number };

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [stats, platform] = await Promise.all([
          fetchRevenueStats(),
          fetchPlatformStats(),
        ]);
        setRevenueData(stats);
        setPlatformRevenue(platform.platformRevenue);
      } catch (err) {
        console.error("Error fetching revenue:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalBookings = revenueData.reduce((sum, month) => sum + month.bookings, 0);
  const platformCut = Math.round(platformRevenue * 0.1);
  const partnerPayout = Math.round(totalRevenue * 0.9);
  const maxRevenue = Math.max(...revenueData.map(month => month.revenue), 1);
  const bestMonth = revenueData.reduce((best, month) => (month.revenue > best.revenue ? month : best), { month: "-", revenue: 0, bookings: 0 });

  const stats = [
    { label: "Gross Revenue", value: formatPKR(totalRevenue), icon: <Wallet size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Platform Cut", value: formatPKR(platformCut), icon: <Landmark size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Bookings", value: totalBookings, icon: <TrendingUp size={20} />, color: "#3B82F6", bg: "bg-blue-50" },
    { label: "Best Month", value: bestMonth.month, icon: <ArrowUpRight size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Ledger</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Financial Analytics</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search revenue..." readOnly />
          </div>
          <button className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all inline-flex items-center justify-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform Growth</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">{new Date().getFullYear()} Revenue Trend</h2>
          </div>
          <span className="badge badge-emerald !rounded-full !px-4 !py-1.5 !text-[9px]">Live Updates</span>
        </div>

        {revenueData.every(month => month.revenue === 0) ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Wallet size={28} className="mx-auto mb-3 text-slate-400" />
            <p className="font-black text-slate-950">No revenue data yet</p>
            <p className="text-sm font-bold text-slate-500 mt-1">Revenue will appear when bookings are created.</p>
          </div>
        ) : (
          <div className="dashboard-revenue-frame">
            {revenueData.map(month => (
              <div key={month.month} className="dashboard-revenue-column">
                <span className="dashboard-revenue-chip">{month.revenue > 0 ? formatPKR(month.revenue) : ""}</span>
                <div
                  className="dashboard-revenue-bar"
                  style={{ height: `${Math.max((month.revenue / maxRevenue) * 150, month.revenue > 0 ? 10 : 3)}px`, opacity: month.revenue > 0 ? 1 : 0.2 }}
                  title={`${formatPKR(month.revenue)} - ${month.bookings} bookings`}
                />
                <span className="dashboard-revenue-month">{month.month}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Landmark size={16} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Monthly Performance</span>
        </div>

        <div className="space-y-5">
          {revenueData.map(month => (
            <article key={month.month} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr_auto] gap-6 xl:items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-950 m-0">{month.month} {new Date().getFullYear()}</h3>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Period</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetricTile label="Gross Earnings" value={formatPKR(month.revenue)} />
                  <MetricTile label="Platform Fee" value={formatPKR(Math.round(month.revenue * 0.1))} />
                  <MetricTile label="Partner Payouts" value={formatPKR(Math.round(month.revenue * 0.9))} />
                </div>
                <span className="badge badge-emerald !rounded-full !px-4 !py-1.5 !text-[9px] justify-self-start xl:justify-self-end">
                  {month.bookings} trips
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SummaryCard title="Revenue Health" rows={[
          ["Gross Revenue", formatPKR(totalRevenue)],
          ["Platform Cut", formatPKR(platformCut)],
          ["Partner Payout", formatPKR(partnerPayout)],
        ]} />
        <SummaryCard title="Booking Economics" rows={[
          ["Total Bookings", totalBookings.toString()],
          ["Avg Booking", formatPKR(totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0)],
          ["Best Month", bestMonth.month],
        ]} />
        <SummaryCard title="Distribution" rows={[
          ["Platform Share", "10%"],
          ["Partner Share", "90%"],
          ["Revenue Months", revenueData.filter(month => month.revenue > 0).length.toString()],
        ]} />
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-black text-slate-700 truncate mt-1">{value}</p>
    </div>
  );
}

function SummaryCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <h3 className="text-lg font-black text-slate-950 m-0 mb-5">{title}</h3>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-black text-slate-950 text-right truncate">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
