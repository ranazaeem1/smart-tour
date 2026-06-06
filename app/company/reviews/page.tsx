"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchCompanyByOwner, fetchReviews } from "@/lib/db";
import { Calendar, Frown, Meh, MessageSquare, Quote, Reply, Search, Smile, Star, User } from "lucide-react";

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

function sentimentClass(sentiment: string) {
  if (sentiment === "positive") return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (sentiment === "negative") return "bg-rose-50 text-rose-500 border-rose-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
}

export default function CompanyReviewsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        if (company) setReviews(await fetchReviews({ companyId: company.id }));
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment === "positive").length;
  const neutral = reviews.filter(r => r.sentiment === "neutral").length;
  const negative = reviews.filter(r => r.sentiment === "negative").length;
  const filtered = reviews.filter(r => {
    const matchesFilter = filter === "all" || r.sentiment === filter;
    const text = `${r.profiles?.full_name || ""} ${r.tours?.title || ""} ${r.comment || ""}`.toLowerCase();
    return matchesFilter && text.includes(search.toLowerCase());
  });

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <MessageSquare size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sentiment Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Reviews</h1>
        </div>

        <div className="relative w-full xl:w-96">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search review, traveler, tour..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Reviews" value={total} icon={MessageSquare} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Positive" value={positive} icon={Smile} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Neutral" value={neutral} icon={Meh} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Negative" value={negative} icon={Frown} tone="bg-rose-50 text-rose-500" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex w-full overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
          {["all", "positive", "neutral", "negative"].map(item => (
            <button key={item} onClick={() => setFilter(item)} className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === item ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"}`}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <MessageSquare size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No reviews found</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">No traveler feedback matches this view.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-900">
                      {review.profiles?.full_name?.charAt(0) || <User size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-950 truncate">{review.profiles?.full_name || "Guest Traveler"}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{review.tours?.title || "Tour package"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={15} className={index < (review.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${sentimentClass(review.sentiment)}`}>
                      {review.sentiment || "neutral"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5 relative">
                  <Quote size={20} className="text-emerald-500 mb-3" />
                  <p className="text-sm font-bold leading-relaxed text-slate-700">{review.comment || "No written comment."}</p>
                </div>

                <div className="mt-5 flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{review.created_at ? new Date(review.created_at).toLocaleDateString() : "No date"}</span>
                  </div>
                  <button className="btn btn-secondary !py-3 !px-5 !rounded-2xl flex items-center gap-2 justify-center">
                    <Reply size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Respond</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
