"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchReviews, deleteReview } from "@/lib/db";
import { getStatusColor } from "@/lib/data";

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
      const data = await fetchReviews(profile ? { userId: profile.id } : undefined);
      setReviews(data as Review[]);
      setLoading(false);
    }
    load();
  }, [profile]);

  const handleDelete = async (id: string) => {
    if (!profile) return;
    if (!confirm("Delete this review?")) return;
    setDeleting(id);
    const ok = await deleteReview(id, profile.id);
    if (ok) setReviews(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>My Account</div>
          <h1 className="topbar-title">⭐ My Reviews</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{reviews.length} Reviews Written</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <h3 style={{ marginBottom: 8 }}>No reviews yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>After completing a tour, share your experience to help other travelers.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.tours?.title || "Unknown Tour"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {r.tours?.destination && <span>{r.tours.destination} · </span>}
                    {new Date(r.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", fontSize: 16 }}>{"⭐".repeat(r.rating)}</span>
                  <span className={`badge ${getStatusColor(r.sentiment)}`}>{r.sentiment}</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>&quot;{r.comment}&quot;</p>
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => alert('Edit feature coming soon. Thank you for your patience!')}>✏️ Edit</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                >
                  {deleting === r.id ? "Deleting..." : "🗑️ Delete"}
                </button>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                  👍 {r.helpful_count} found helpful
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
