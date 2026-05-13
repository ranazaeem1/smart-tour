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
  const maxRevenue = data.length ? Math.max(...data.map(m => m.revenue)) : 1;

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Performance Overview</h2>
          </div>
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Monthly Revenue Analytics — {new Date().getFullYear()}</p>
        </div>
        <span className="badge badge-emerald">Live Stream</span>
      </div>

      <div className="flex items-end gap-3 h-[240px] px-2" aria-label="Revenue performance chart">
        {data.map((m, i) => (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="relative w-full flex flex-col items-center">
              {/* Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900 text-white text-[10px] font-black py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                {formatPKR(m.revenue)}
              </div>
              
              {/* Bar */}
              <div
                className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:to-emerald-300 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) shadow-lg"
                style={{ 
                  height: `${(m.revenue / maxRevenue) * 200}px`,
                  animationDelay: `${i * 50}ms`
                }}
                role="img"
                aria-label={`${m.month}: ${formatPKR(m.revenue)}`}
              />
            </div>
            <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
