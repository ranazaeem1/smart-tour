"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Star } from "lucide-react";
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
  const positivePercent = data.find(item => item.label === "Positive")?.value || 0;

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Traveler Feedback</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Sentiment Intelligence</h2>
        </div>
        <Link href="/company/reviews" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all inline-flex items-center gap-2">
          Insights <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center mb-8">
        <div className="w-36 h-36 rounded-full border-[14px] border-emerald-100 flex flex-col items-center justify-center mx-auto md:mx-0">
          <span className="text-3xl font-black text-slate-950 leading-none">{positivePercent}%</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Positive</span>
        </div>
        <div className="space-y-4">
          {data.map(item => (
            <div key={item.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                <span className="text-sm font-black" style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {recentReviews.length === 0 ? (
          <div className="py-10 text-center">
            <Star size={24} className="mx-auto mb-3 text-slate-400" />
            <p className="text-slate-500 font-bold">No recent reviews yet.</p>
          </div>
        ) : (
          recentReviews.map(review => (
            <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-black text-slate-950 m-0">{review.profiles?.full_name || "Verified Traveler"}</h3>
                <span className={`badge ${getStatusColor(review.sentiment)} !rounded-full !px-3 !py-1 !text-[8px]`}>{review.sentiment}</span>
              </div>
              <p className="text-sm font-bold leading-relaxed text-slate-600">&quot;{(review.comment || "").slice(0, 90)}...&quot;</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
