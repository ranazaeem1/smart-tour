"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

interface QuickAnalysisPanelProps {
  stats: QuickStat[];
}

export function QuickAnalysisPanel({ stats }: QuickAnalysisPanelProps) {
  return (
    <aside className="space-y-8" aria-label="Dashboard Sidebar">
      <div className="card-premium p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg" aria-hidden="true">
            <TrendingUp size={20} />
          </div>
          <h2 className="text-xl font-black text-[var(--foreground)] m-0">Quick Analysis</h2>
        </div>

        <div className="space-y-4">
          {stats.map((qs, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-5 ${qs.bg} rounded-[24px] hover:shadow-[var(--shadow-md)] transition-all group cursor-default`}
              role="listitem"
            >
              <p className="text-[12px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.1em]">{qs.label}</p>
              <p className={`text-[18px] font-black ${qs.color} group-hover:scale-110 transition-transform`}>{qs.value}</p>
            </div>
          ))}
        </div>

        <div className="panel-hero-mini p-8 rounded-[32px] relative overflow-hidden group mt-4 border shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true">
            <Zap size={60} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="panel-hero-card-kicker text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> AI Intelligence
            </p>
            <h4 className="panel-hero-card-title text-lg font-black mb-2 leading-tight">Ready for a new adventure?</h4>
            <p className="panel-hero-card-text text-xs font-medium mb-6 leading-relaxed">Our algorithms suggest Hunza region based on your preferences. Unlock exclusive group discounts.</p>
            <Link
              href="/user/planner"
              className="btn btn-emerald w-full !rounded-[16px]"
              aria-label="Access AI Trip Planner"
            >
              Start Planning <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
