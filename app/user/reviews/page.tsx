"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchReviews, deleteReview } from "@/lib/db";
import { 
  Star, 
  Trash2, 
  Edit3, 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Calendar,
  Sparkles,
  Search,
  Quote
} from "lucide-react";

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
    if (!confirm("Are you sure you want to delete this memory? This action cannot be undone.")) return;
    setDeleting(id);
    const ok = await deleteReview(id, profile.id);
    if (ok) setReviews(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  };

  const getSentimentBadge = (sentiment: string) => {
    switch(sentiment.toLowerCase()) {
      case 'positive': return <span className="badge badge-emerald">Positive Sentiment</span>;
      case 'neutral': return <span className="badge badge-slate">Neutral Feedback</span>;
      case 'negative': return <span className="badge badge-rose">Constructive Feedback</span>;
      default: return <span className="badge badge-slate">{sentiment}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Retrieving Your Reviews...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">Member Feedback</p>
          <h1 className="m-0 tracking-tight">My Reviews</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Shared</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{reviews.length}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-right">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Impact Factor</p>
            <p className="text-3xl font-black text-emerald-600 leading-none">
              {reviews.reduce((acc, r) => acc + (r.helpful_count || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card-premium py-32 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 shadow-inner ring-1 ring-slate-100">
            <Sparkles size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No reviews shared yet</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            Your voice matters. After completing an expedition, share your experiences to help other members find the perfect journey.
          </p>
          <Link href="/user/bookings" className="mt-10 btn btn-emerald px-10 py-4">View Completed Bookings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((r, idx) => (
            <div key={r.id} className="card p-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group animate-fade" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Expedition Review</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-black text-slate-900">{r.rating}.0</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors m-0">
                    {r.tours?.title || "Anonymous Expedition"}
                  </h3>
                  <div className="flex items-center gap-4 mt-3 text-slate-500 font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-rose-400" />
                      {r.tours?.destination || "Global"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(r.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {getSentimentBadge(r.sentiment)}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <ThumbsUp size={14} className="text-slate-400" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{r.helpful_count} Helpful Votes</span>
                  </div>
                </div>
              </div>

              <div className="relative p-8 bg-slate-50 rounded-[28px] border border-slate-100 italic">
                <Quote size={32} className="absolute -top-4 -left-4 text-slate-200 fill-white" />
                <p className="text-slate-600 text-lg font-medium leading-relaxed m-0 relative z-10">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    className="btn btn-secondary !px-6 py-4 flex items-center gap-2 group/edit"
                    onClick={() => alert('Editing review protocol is temporarily offline for maintenance.')}
                  >
                    <Edit3 size={18} className="group-hover/edit:rotate-12 transition-transform" /> Modify
                  </button>
                  <button
                    className="btn btn-rose !px-6 py-4 flex items-center gap-2 group/del"
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                  >
                    <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" /> 
                    {deleting === r.id ? "Purging..." : "Delete Review"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Public Contribution #{r.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
