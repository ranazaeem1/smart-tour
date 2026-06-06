"use client";

import { formatPKR } from "@/lib/data";
import { TrendingUp } from "lucide-react";

interface RevenueMonth {
  month: string;
  revenue: number;
}

interface PerformanceOverviewProps {
  data: RevenueMonth[];
}

export function PerformanceOverview({ data }: PerformanceOverviewProps) {
  const maxRevenue = Math.max(...data.map(month => month.revenue), 1);

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={16} className="text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Stream</span>
      </div>
      <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950 mb-6">Performance Overview</h2>

      {data.length === 0 || data.every(month => month.revenue === 0) ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <TrendingUp size={28} className="mx-auto mb-3 text-slate-400" />
          <p className="font-black text-slate-950">No revenue data yet</p>
          <p className="text-sm font-bold text-slate-500 mt-1">Confirmed reservations will appear here.</p>
        </div>
      ) : (
        <div className="dashboard-revenue-frame">
          {data.map(month => (
            <div key={month.month} className="dashboard-revenue-column">
              <span className="dashboard-revenue-chip">{month.revenue > 0 ? formatPKR(month.revenue) : ""}</span>
              <div
                className="dashboard-revenue-bar"
                style={{ height: `${Math.max((month.revenue / maxRevenue) * 150, month.revenue > 0 ? 10 : 3)}px`, opacity: month.revenue > 0 ? 1 : 0.2 }}
                title={`${month.month}: ${formatPKR(month.revenue)}`}
              />
              <span className="dashboard-revenue-month">{month.month}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
