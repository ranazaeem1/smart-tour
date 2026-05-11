"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchReviews, fetchCompanyByOwner } from "@/lib/db";
import { getStatusColor } from "@/lib/data";

export default function CompanyReviewsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
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
    if (!authLoading) load();
  }, [profile, authLoading]);

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.sentiment === filter);

  // Sentiment stats
  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;

  const SENTIMENT_STATS = [
    { label: "Positive", value: total ? Math.round((positive / total) * 100) : 0, color: "var(--emerald)", icon: "😊" },
    { label: "Neutral", value: total ? Math.round((neutral / total) * 100) : 0, color: "var(--gold)", icon: "😐" },
    { label: "Negative", value: total ? Math.round((negative / total) * 100) : 0, color: "var(--rose)", icon: "😞" },
  ];

  if (loading || authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Company Panel</div>
          <h1 className="topbar-title">⭐ Reviews & Sentiment</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{total} Total Reviews</span>
        </div>
      </div>

      {/* Sentiment overview */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {SENTIMENT_STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}%</div>
            <div className="stat-label">{s.label} Reviews</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="tabs" style={{ marginBottom: 20, width: "fit-content" }}>
        {["all", "positive", "neutral", "negative"].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            No reviews found.
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                    {r.profiles?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.profiles?.full_name || "Anonymous"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {r.tours?.title} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ color: "var(--gold)", fontSize: 16 }}>{"⭐".repeat(r.rating)}</div>
                  <span className={`badge ${getStatusColor(r.sentiment)}`}>{r.sentiment || "neutral"}</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>&quot;{r.comment}&quot;</p>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Travel date: {r.travel_date || "N/A"}
                </span>
                <button className="btn btn-secondary btn-sm">↩️ Reply</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
