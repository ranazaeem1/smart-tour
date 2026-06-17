"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchCompanyByOwner, fetchRevenueStats } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, ClipboardList, Download, PieChart, Wallet } from "lucide-react";

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : tone.includes("rose") ? "bg-rose-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

export default function CompanyRevenuePage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; bookings: number }[]>([]);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        if (company) setRevenueData(await fetchRevenueStats(company.id));
      } catch (err) {
        console.error("Failed to load revenue stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalBookings = revenueData.reduce((sum, month) => sum + month.bookings, 0);
  const maxRevenue = Math.max(...revenueData.map(month => month.revenue), 1);
  const currentMonthStats = revenueData[new Date().getMonth()] || { revenue: 0, bookings: 0 };
  const activeMonths = revenueData.filter(month => month.revenue > 0 || month.bookings > 0);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading revenue...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Wallet size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Financial Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Revenue</h1>
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2">
          <Download size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Revenue" value={formatPKR(totalRevenue)} icon={Wallet} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Total Bookings" value={totalBookings} icon={ClipboardList} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Avg Booking" value={totalBookings ? formatPKR(Math.round(totalRevenue / totalBookings)) : "PKR 0"} icon={PieChart} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Current Month" value={formatPKR(currentMonthStats.revenue)} icon={Calendar} tone="bg-rose-50 text-rose-500" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-900" />
              <h2 className="text-xl font-black text-slate-950">Monthly Revenue</h2>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500">Gross booking value by month</p>
          </div>
          <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            Total<br />
            <span className="text-sm">{formatPKR(totalRevenue)}</span>
          </span>
        </div>

        <div className="dashboard-revenue-frame">
          {revenueData.map(month => {
            const height = Math.max((month.revenue / maxRevenue) * 100, month.revenue > 0 ? 8 : 2);
            return (
              <div className="dashboard-revenue-column" key={month.month}>
                <span className="dashboard-revenue-chip">{formatPKR(month.revenue)}</span>
                <div className="dashboard-revenue-bar" style={{ height: `${height}%` }} />
                <span className="dashboard-revenue-month">{month.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={18} className="text-slate-900" />
          <h2 className="text-xl font-black text-slate-950">Monthly Breakdown</h2>
        </div>

        {activeMonths.length === 0 ? (
          <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-slate-400">No paid booking data yet.</div>
        ) : (
          <div className="space-y-3">
            {activeMonths.map((month, index) => {
              const previous = activeMonths[index - 1]?.revenue ?? month.revenue;
              const growth = index === 0 || previous === 0 ? 0 : Math.round(((month.revenue - previous) / previous) * 100);
              return (
                <div key={month.month} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Month</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{month.month} {new Date().getFullYear()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bookings</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{month.bookings}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Revenue</p>
                      <p className="mt-1 text-sm font-black text-emerald-600">{formatPKR(month.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg Ticket</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{month.bookings ? formatPKR(Math.round(month.revenue / month.bookings)) : "PKR 0"}</p>
                    </div>
                    <div className={`flex items-center gap-1 md:justify-end text-sm font-black ${growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {growth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(growth)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
