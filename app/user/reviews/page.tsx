"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { deleteReview, fetchReviews } from "@/lib/db";
import { Calendar, Edit3, MapPin, MessageSquare, Quote, Sparkles, Star, ThumbsUp, Trash2 } from "lucide-react";

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
  if (sentiment?.toLowerCase() === "positive") return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (sentiment?.toLowerCase() === "negative") return "bg-rose-50 text-rose-500 border-rose-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
}

export default function UserReviewsPage() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchReviews(profile ? { userId: profile.id } : undefined);
        setReviews(data as Review[]);
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const handleDelete = async (id: string) => {
    if (!profile) return;
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeleting(id);
    const ok = await deleteReview(id, profile.id);
    if (ok) setReviews(prev => prev.filter(review => review.id !== id));
    setDeleting(null);
  };

  const helpful = reviews.reduce((sum, review) => sum + (review.helpful_count || 0), 0);
  const avgRating = reviews.length ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <MessageSquare size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Member Feedback</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950">My Reviews</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Shared" value={reviews.length} icon={MessageSquare} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Average Rating" value={avgRating} icon={Star} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Helpful Votes" value={helpful} icon={ThumbsUp} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Positive" value={reviews.filter(r => r.sentiment === "positive").length} icon={Sparkles} tone="bg-emerald-50 text-emerald-500" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        {reviews.length === 0 ? (
          <div className="py-24 text-center">
            <Sparkles size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No reviews shared yet</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">After a trip, share feedback from your bookings.</p>
            <Link href="/user/bookings" className="mt-8 inline-flex btn btn-emerald !rounded-2xl !py-4 !px-7">View Bookings</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${sentimentClass(review.sentiment)}`}>{review.sentiment || "neutral"}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star key={index} size={15} className={index < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 truncate">{review.tours?.title || "Anonymous Expedition"}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={13} className="text-emerald-500" />{review.tours?.destination || "Destination"}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-emerald-500" />{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-2 text-slate-700">
                    <ThumbsUp size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{review.helpful_count || 0} Helpful</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                  <Quote size={20} className="text-emerald-500 mb-3" />
                  <p className="text-sm font-bold leading-relaxed text-slate-700">{review.comment}</p>
                </div>

                <div className="mt-5 flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contribution #{review.id.slice(0, 8)}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary !px-5 !py-3 !rounded-2xl flex items-center gap-2" onClick={() => alert("Review editing is temporarily unavailable.")}>
                      <Edit3 size={15} /> Modify
                    </button>
                    <button className="btn btn-rose !px-5 !py-3 !rounded-2xl flex items-center gap-2" onClick={() => handleDelete(review.id)} disabled={deleting === review.id}>
                      <Trash2 size={15} /> {deleting === review.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
