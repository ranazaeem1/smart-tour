"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchReviews, fetchCompanyByOwner } from "@/lib/db";
import { getStatusColor } from "@/lib/data";
import { 
  Star, 
  MessageSquare, 
  Smile, 
  Meh, 
  Frown, 
  User, 
  Quote, 
  Activity,
  ArrowRight,
  Reply,
  Calendar
} from "lucide-react";

export default function CompanyReviewsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        setLoading(true);
        try {
          const company = await fetchCompanyByOwner(profile.id);
          if (company) {
            const data = await fetchReviews({ companyId: company.id });
            setReviews(data);
          }
        } catch (err) {
          console.error("Failed to load reviews:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.sentiment === filter);

  // Sentiment stats
  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;

  const SENTIMENT_STATS = [
    { label: "Positive", value: total ? Math.round((positive / total) * 100) : 0, color: "text-emerald-500", barColor: "bg-emerald-500", icon: Smile, bgColor: "bg-emerald-500/10" },
    { label: "Neutral", value: total ? Math.round((neutral / total) * 100) : 0, color: "text-amber-500", barColor: "bg-amber-500", icon: Meh, bgColor: "bg-amber-500/10" },
    { label: "Negative", value: total ? Math.round((negative / total) * 100) : 0, color: "text-rose-500", barColor: "bg-rose-500", icon: Frown, bgColor: "bg-rose-500/10" },
  ];

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Analyzing Traveler Sentiments...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Sentiment Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-emerald inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border">
              <Activity size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reputation Management</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Reviews & Sentiment
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Listen to your travelers and refine your expedition protocol.</p>
          </div>

          <div className="text-right hidden md:block">
            <span className="panel-hero-badge badge badge-emerald font-black">
              {total} TOTAL SIGNALS
            </span>
          </div>
        </div>
      </section>

      {/* ── Sentiment Analysis Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {SENTIMENT_STATS.map(s => (
          <div key={s.label} className="card-premium flex flex-col space-y-4 group">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${s.bgColor} flex items-center justify-center ${s.color} shadow-lg transition-transform group-hover:scale-110`}>
                <s.icon size={24} />
              </div>
              <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}%</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{s.label} Feedback</p>
              <div className="w-full h-1.5 bg-[var(--muted)] rounded-full mt-3 overflow-hidden border border-[var(--border)]">
                <div className={`h-full ${s.barColor} transition-all duration-1000 ease-out`} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex bg-[var(--muted)] p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] w-fit overflow-x-auto">
        {["all", "positive", "neutral", "negative"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-3 rounded-[var(--radius-md)] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f ? "bg-[var(--card)] text-[var(--foreground)] shadow-lg" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Reviews List ── */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <section className="card-premium py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--muted)] rounded-[32px] flex items-center justify-center text-[var(--muted-foreground)] mb-8 shadow-inner border border-[var(--border)]">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight m-0">Zero Sentiment Detected</h2>
            <p className="text-[var(--muted-foreground)] font-medium max-w-xs mx-auto leading-relaxed uppercase text-[10px] tracking-widest mt-2">
              No reviews matched your current filter parameters.
            </p>
          </section>
        ) : (
          filtered.map((r, idx) => (
            <article 
              key={r.id} 
              className="card-premium space-y-6 animate-fade"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-[var(--border)] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] font-black shadow-lg">
                    {r.profiles?.full_name?.charAt(0) || <User size={20} />}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[var(--foreground)] m-0 leading-tight">{r.profiles?.full_name || "Guest Traveler"}</h4>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">
                      {r.tours?.title} <span className="text-[var(--muted-foreground)] mx-2">•</span> {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-[var(--muted)]"} />
                    ))}
                  </div>
                  <span className={`badge ${getStatusColor(r.sentiment)} !px-4 !py-1.5 !rounded-lg !text-[9px] !font-black !uppercase !tracking-widest`}>
                    {r.sentiment || "NEUTRAL"}
                  </span>
                </div>
              </div>

              <div className="relative">
                <Quote size={40} className="absolute -top-2 -left-2 text-emerald-500/10 -z-10" />
                <p className="text-base font-medium text-[var(--foreground)] leading-relaxed italic m-0">
                  &quot;{r.comment}&quot;
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Travel Deployment: {r.travel_date || "UNDEFINED"}</p>
                </div>
                <button className="btn btn-secondary !py-3 !px-6 !rounded-xl flex items-center gap-2 group">
                  <Reply size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Transmit Response</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
