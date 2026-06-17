"use client";

import { useEffect, useState } from "react";
import { fetchReviews } from "@/lib/db";
import { getStatusColor } from "@/lib/data";
import { Filter, Frown, Meh, MessageSquare, Search, Smile, Star, ThumbsUp, Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  sentiment: string;
  created_at: string;
  helpful_count: number;
  tours: { title: string; destination: string } | null;
  profiles: { full_name: string | null } | null;
}

const filters = ["all", "positive", "neutral", "negative"];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchReviews();
      if (data) setReviews(data as Review[]);
      setLoading(false);
    }

    load();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this review? This cannot be undone.")) return;
    setRemovingId(id);
    setReviews(prev => prev.filter(r => r.id !== id));
    setRemovingId(null);
  };

  const filtered = reviews
    .filter(r => filter === "all" || r.sentiment === filter)
    .filter(r => {
      if (!search) return true;
      const term = search.toLowerCase();
      const name = (r.profiles?.full_name || "").toLowerCase();
      const tour = (r.tours?.title || "").toLowerCase();
      const comment = r.comment.toLowerCase();
      return name.includes(term) || tour.includes(term) || comment.includes(term);
    });

  const positive = reviews.filter(r => r.sentiment === "positive").length;
  const neutral = reviews.filter(r => r.sentiment === "neutral").length;
  const negative = reviews.filter(r => r.sentiment === "negative").length;
  const total = reviews.length || 1;

  const stats = [
    { label: "Positive Reviews", value: `${Math.round((positive / total) * 100)}%`, count: positive, icon: <Smile size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Neutral Reviews", value: `${Math.round((neutral / total) * 100)}%`, count: neutral, icon: <Meh size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Negative Reviews", value: `${Math.round((negative / total) * 100)}%`, count: negative, icon: <Frown size={20} />, color: "#EF4444", bg: "bg-rose-50" },
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
            <MessageSquare size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Community Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Review Management</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search by user, tour, or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${s.bg}`} style={{ color: s.color }}>{s.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.count} total</span>
            </div>
            <div className="text-4xl font-black tracking-tighter mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
            <div className="mt-5 h-2 overflow-hidden rounded-md bg-slate-100">
              <div className="h-full rounded-md" style={{ width: s.value, background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sentiment Filters</span>
          </div>

          <div className="flex w-full lg:w-auto overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {filters.map(f => (
              <button
                key={f}
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 font-bold">No reviews found.</p>
            </div>
          ) : (
            filtered.map(r => {
              const name = r.profiles?.full_name || "Anonymous";
              return (
                <article key={r.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-slate-950 m-0 truncate">{name}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {r.tours?.title || "Unknown Tour"} · {new Date(r.created_at).toLocaleDateString("en-PK")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-400" aria-label={`${r.rating} star rating`}>
                        {Array.from({ length: Math.max(0, Math.min(5, r.rating)) }).map((_, index) => (
                          <Star key={index} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className={`badge ${getStatusColor(r.sentiment)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>
                        {r.sentiment}
                      </span>
                      <button
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                        onClick={() => handleRemove(r.id)}
                        disabled={removingId === r.id}
                      >
                        <Trash2 size={14} />
                        {removingId === r.id ? "Removing" : "Remove"}
                      </button>
                    </div>
                  </div>

                  <p className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm font-medium leading-relaxed text-slate-600">
                    &quot;{r.comment}&quot;
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <ThumbsUp size={14} className="text-emerald-500" />
                    {r.helpful_count} found helpful
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
