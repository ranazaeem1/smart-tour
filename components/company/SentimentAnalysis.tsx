"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { getStatusColor } from "@/lib/data";

interface Review {
  id: string;
  sentiment: string;
  comment: string;
  profiles: {
    full_name: string;
  };
}

interface SentimentData {
  label: string;
  value: number;
  color: string;
}

interface SentimentAnalysisProps {
  data: SentimentData[];
  recentReviews: Review[];
}

export function SentimentAnalysis({ data, recentReviews }: SentimentAnalysisProps) {
  const positivePercent = data.find(d => d.label === 'Positive')?.value || 0;

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Sentiment Intelligence</h2>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Global Traveler Feedback</p>
          </div>
        </div>
        <Link href="/company/reviews" className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2">
          Insights <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
        {/* Ring Chart */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--muted)" strokeWidth="12" />
            {(() => {
              let offset = 0;
              const circumference = 2 * Math.PI * 42;
              return data.map((s) => {
                const dashLen = (s.value / 100) * circumference;
                const el = (
                  <circle 
                    key={s.label} 
                    cx="50" cy="50" r="42" 
                    fill="transparent" 
                    stroke={s.color} 
                    strokeWidth="12"
                    strokeDasharray={`${dashLen} ${circumference}`}
                    strokeDashoffset={-offset}
                    className="transition-all duration-1000 ease-in-out"
                  />
                );
                offset += dashLen;
                return el;
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[var(--foreground)] leading-none tracking-tighter">{positivePercent}%</span>
            <span className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Positive</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-6">
          {data.map((s) => (
            <div key={s.label} className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{s.label}</span>
                <span className="text-sm font-black tracking-tighter" style={{ color: s.color }}>{s.value}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${s.value}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Snippets */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-4">Latest Intel</p>
        {recentReviews.map(r => (
          <div key={r.id} className="p-5 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:bg-[var(--card)] transition-all group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[13px] font-black text-[var(--foreground)]">{r.profiles?.full_name || "Verified Traveler"}</p>
              <span className={`badge ${getStatusColor(r.sentiment)} !text-[8px] !px-2 !py-0.5`}>{r.sentiment}</span>
            </div>
            <p className="text-[12px] font-medium text-[var(--muted-foreground)] leading-relaxed italic group-hover:text-[var(--foreground)] transition-colors">
              &quot;{(r.comment || "").slice(0, 75)}...&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
