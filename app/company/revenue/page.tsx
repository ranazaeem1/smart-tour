"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchRevenueStats, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { 
  Wallet, 
  ClipboardList, 
  BarChart3, 
  TrendingUp, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Calendar,
  PieChart
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

export default function CompanyRevenuePage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; bookings: number }[]>([]);

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        setLoading(true);
        try {
          const company = await fetchCompanyByOwner(profile.id);
          if (company) {
            const stats = await fetchRevenueStats(company.id);
            setRevenueData(stats);
          }
        } catch (err) {
          console.error("Failed to load revenue stats:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const totalRevenue = revenueData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = revenueData.reduce((s, m) => s + m.bookings, 0);
  const maxRev = Math.max(...revenueData.map(m => m.revenue), 1);
  
  const currentMonthIdx = new Date().getMonth();
  const currentMonthStats = revenueData[currentMonthIdx] || { revenue: 0 };

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Analyzing Financial Integrity...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Revenue Hero Header ── */}
      <section className="bg-slate-950 rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full mb-4 border border-amber-500/20">
              <Wallet size={12} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Financial Oversight</span>
            </div>
            <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Revenue Analytics
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">Track growth trajectories and optimize package profitability.</p>
          </div>

          <button 
            onClick={() => window.print()}
            className="btn btn-secondary min-h-[56px] px-8 rounded-2xl flex items-center gap-3 hover:bg-slate-900 transition-all border border-white/10"
          >
            <Download size={20} />
            <span className="text-sm font-black tracking-widest uppercase">Export Financials</span>
          </button>
        </div>
      </section>

      {/* ── High-Level Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
        <StatCard 
          label="Total Revenue"
          value={formatPKR(totalRevenue)}
          icon={Wallet}
          color="bg-emerald-500"
        />
        <StatCard 
          label="Total Bookings"
          value={totalBookings}
          icon={ClipboardList}
          color="bg-slate-900"
        />
        <StatCard 
          label="Avg Per Package"
          value={totalBookings > 0 ? formatPKR(Math.round(totalRevenue/totalBookings)) : "PKR 0"}
          icon={PieChart}
          color="bg-amber-500"
        />
        <StatCard 
          label="Current Month"
          value={formatPKR(currentMonthStats.revenue)}
          icon={Activity}
          color="bg-slate-800"
        />
      </div>

      {/* ── Revenue Projection Chart ── */}
      <section className="card-premium space-y-10">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Monthly Revenue Projections</h2>
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Fiscal Year {new Date().getFullYear()}</p>
            </div>
          </div>
          <span className="badge badge-emerald !bg-emerald-500/10 !text-emerald-500 !px-4 !py-2 !rounded-xl border border-emerald-500/20 font-black">
            {formatPKR(totalRevenue)} GLOBAL TOTAL
          </span>
        </div>

        <div className="flex items-end gap-3 md:gap-6 h-[300px] pt-10 pb-12 px-2 md:px-8">
          {revenueData.map((m, i) => {
            const height = (m.revenue / maxRev) * 100;
            const isCurrent = i === currentMonthIdx;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                  <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap">
                    {formatPKR(m.revenue)}
                  </span>
                </div>
                <div 
                  className={`w-full max-w-[48px] rounded-t-xl transition-all duration-700 ease-out relative ${isCurrent ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-gradient-to-t from-slate-800 to-slate-700 group-hover:from-emerald-900/40 group-hover:to-emerald-700/40'}`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-4 ${isCurrent ? 'text-emerald-500' : 'text-[var(--muted-foreground)]'}`}>{m.month}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Transactional Detail ── */}
      <section className="card-premium !p-0 overflow-hidden">
        <div className="p-8 border-b border-[var(--border)]">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Monthly Breakdown</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Temporal Cycle</th>
                <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Reserving Count</th>
                <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Net Revenue</th>
                <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Ticket Avg</th>
                <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">Growth Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {revenueData.filter(m => m.revenue > 0 || m.bookings > 0).map((m, i, arr) => {
                const prev = i > 0 ? arr[i-1].revenue : m.revenue;
                const growth = i === 0 ? 0 : Math.round(((m.revenue-prev)/prev)*100);
                return (
                  <tr key={m.month} className="hover:bg-[var(--muted)]/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-[var(--foreground)] m-0">{m.month} {new Date().getFullYear()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[var(--muted-foreground)] m-0">{m.bookings} Units</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-emerald-500 m-0">{formatPKR(m.revenue)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[var(--muted-foreground)] m-0">{m.bookings > 0 ? formatPKR(Math.round(m.revenue/m.bookings)) : "—"}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className={`inline-flex items-center gap-1 font-black text-[11px] ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(growth)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
