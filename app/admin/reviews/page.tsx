"use client";
import { useEffect, useState } from "react";
import { fetchReviews } from "@/lib/db";
import { REVIEWS, getStatusColor } from "@/lib/data";

interface Review {
  id: string; rating: number; comment: string; sentiment: string;
  created_at: string; helpful_count: number;
  tours: { title: string; destination: string } | null;
  profiles: { full_name: string | null } | null;
}

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
      if (data.length > 0) {
        setReviews(data as Review[]);
      } else {
        setReviews(REVIEWS.map(r => ({
          id: r.id, rating: r.rating, comment: r.comment,
          sentiment: r.sentiment, created_at: r.date,
          helpful_count: r.helpful,
          tours: { title: r.tourTitle, destination: "" },
          profiles: { full_name: r.userName },
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this review? This cannot be undone.")) return;
    setRemovingId(id);
    // Admin can remove any review (pass admin ID or handle server-side)
    setReviews(prev => prev.filter(r => r.id !== id));
    setRemovingId(null);
  };

  const filtered = reviews
    .filter(r => filter === "all" || r.sentiment === filter)
    .filter(r => {
      if (!search) return true;
      const name = (r.profiles?.full_name || "").toLowerCase();
      const tour = (r.tours?.title || "").toLowerCase();
      const comment = r.comment.toLowerCase();
      return name.includes(search.toLowerCase()) || tour.includes(search.toLowerCase()) || comment.includes(search.toLowerCase());
    });

  const positive = reviews.filter(r => r.sentiment === "positive").length;
  const neutral = reviews.filter(r => r.sentiment === "neutral").length;
  const negative = reviews.filter(r => r.sentiment === "negative").length;
  const total = reviews.length || 1;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin Panel</div>
          <h1 className="topbar-title">⭐ Reviews & Sentiment</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{reviews.length} Total Reviews</span>
        </div>
      </div>

      {/* Sentiment stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Positive", value: `${Math.round((positive / total) * 100)}%`, count: positive, color: "var(--emerald)", icon: "😊" },
          { label: "Neutral", value: `${Math.round((neutral / total) * 100)}%`, count: neutral, color: "var(--gold)", icon: "😐" },
          { label: "Negative", value: `${Math.round((negative / total) * 100)}%`, count: negative, color: "var(--rose)", icon: "😞" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label} Reviews ({s.count})</div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div className="progress-fill" style={{ width: s.value, background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label className="input-label">🔍 Search Reviews</label>
          <input className="input" placeholder="Search by user, tour, or content..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ alignSelf: "flex-end" }}>
          {["all", "positive", "neutral", "negative"].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)" }}>No reviews found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                    {(r.profiles?.full_name || "?").charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.profiles?.full_name || "Anonymous"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {r.tours?.title || "Unknown Tour"} · {new Date(r.created_at).toLocaleDateString("en-PK")}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "var(--gold)", fontSize: 16 }}>{"⭐".repeat(r.rating)}</span>
                  <span className={`badge ${getStatusColor(r.sentiment)}`}>{r.sentiment}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={() => handleRemove(r.id)}
                    disabled={removingId === r.id}
                  >
                    {removingId === r.id ? "..." : "🗑️ Remove"}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                &quot;{r.comment}&quot;
              </p>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                👍 {r.helpful_count} found helpful
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
