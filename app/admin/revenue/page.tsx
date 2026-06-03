"use client";
import { useEffect, useState } from "react";
import { fetchRevenueStats, fetchPlatformStats } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { DollarSign, Landmark, TrendingUp, BarChart3, ArrowUpRight, Download, Wallet } from "lucide-react";

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; bookings: number }[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [stats, platform] = await Promise.all([
          fetchRevenueStats(),
          fetchPlatformStats()
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

  const totalRevenue = revenueData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = revenueData.reduce((s, m) => s + m.bookings, 0);
  const platformCut = Math.round(platformRevenue * 0.1); 
  const maxRev = Math.max(...revenueData.map(m => m.revenue), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight inline-flex items-center gap-2"><Wallet size={24} /> Financial Analytics</h1>
          <p className="text-sm text-zinc-500 font-medium">Real-time platform revenue and performance monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary !px-5 !py-2.5 !text-[10px] flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4">
        {[
          { label: "Gross Revenue", value: formatPKR(totalRevenue), color: "var(--emerald)", icon: <DollarSign size={20} /> },
          { label: "Platform Cut (10%)", value: formatPKR(platformCut), color: "var(--gold)", icon: <Landmark size={20} /> },
          { label: "Total Bookings", value: totalBookings, color: "#8B5CF6", icon: <TrendingUp size={20} /> },
          { label: "Best Performing Month", value: revenueData.length > 0 ? revenueData.sort((a,b) => b.revenue - a.revenue)[0]?.month : "—", color: "var(--emerald)", icon: <ArrowUpRight size={20} /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white/5" style={{ color: s.color }}>{s.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Metric</span>
            </div>
            <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><BarChart3 size={20} /></div>
            <h2 className="text-lg font-black text-white">Platform Growth {new Date().getFullYear()}</h2>
          </div>
          <span className="badge badge-emerald">Live Updates</span>
        </div>
        <div className="flex items-end gap-5 h-[220px] pb-10 pt-5">
          {revenueData.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-4 group relative">
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] px-2 py-1 rounded font-bold">{formatPKR(m.revenue)}</div>
              <div 
                style={{ height: `${(m.revenue / maxRev) * 160}px` }} 
                className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-700 min-h-[6px]"
              />
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter rotate-[-45deg] origin-left whitespace-nowrap mt-2">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Monthly Performance Breakdown</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Volume</th>
                <th>Gross Earnings</th>
                <th>Net Platform Fee</th>
                <th>Partner Payouts</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map(m => (
                <tr key={m.month}>
                  <td className="font-black text-sm text-white">{m.month} {new Date().getFullYear()}</td>
                  <td className="font-bold text-zinc-400">{m.bookings} Trips</td>
                  <td className="text-emerald-500 font-black text-sm">{formatPKR(m.revenue)}</td>
                  <td className="text-gold font-bold text-xs">{formatPKR(Math.round(m.revenue * 0.1))}</td>
                  <td className="text-white/40 font-medium text-xs">{formatPKR(Math.round(m.revenue * 0.9))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
