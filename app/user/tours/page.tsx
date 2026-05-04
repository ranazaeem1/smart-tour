"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchTours, createBooking } from "@/lib/db";
import { TOURS, formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

const CATEGORIES = ["All", "Adventure", "Trekking", "Cultural", "Family", "Sports"];
const DIFFICULTIES = ["All", "Easy", "Moderate", "Challenging"];

interface Tour {
  id: string;
  company_id?: string;
  title: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  rating: number;
  review_count?: number;
  reviews?: number;
  image_url?: string | null;
  image?: string;
  category: string;
  tags: string[];
  max_group?: number;
  maxGroup?: number;
  difficulty: string;
  highlights: string[];
  safety_score?: number;
  safetyScore?: number;
  featured: boolean;
  available: boolean;
  companies?: { name: string } | null;
  company?: string;
}

export default function ToursPage() {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [bookingTourId, setBookingTourId] = useState<string | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingGroup, setBookingGroup] = useState(2);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchTours();
      setAllTours(data.length > 0 ? data as Tour[] : TOURS.map(t => ({
        ...t,
        review_count: t.reviews,
        image_url: t.image,
        safety_score: t.safetyScore,
        max_group: t.maxGroup,
        companies: { name: t.company },
      })));
      setLoading(false);
    }
    load();
  }, []);

  const getImg = (t: Tour) => t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
  const getSafety = (t: Tour) => t.safety_score || t.safetyScore || 80;
  const getGroup = (t: Tour) => t.max_group || t.maxGroup || 10;
  const getReviews = (t: Tour) => t.review_count || t.reviews || 0;
  const getCompany = (t: Tour) => t.companies?.name || t.company || "—";

  const filtered = allTours
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      const matchDiff = difficulty === "All" || t.difficulty === difficulty;
      return matchSearch && matchCat && matchDiff;
    })
    .sort((a, b) => sortBy === "price" ? a.price - b.price : sortBy === "rating" ? b.rating - a.rating : getReviews(b) - getReviews(a));

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{filtered.length} tours found</div>
          <h1 className="topbar-title">🏔️ Browse Tours</h1>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flex: 2, minWidth: 200 }}>
            <label className="input-label">🔍 Search</label>
            <input className="input" placeholder="Search tours, destinations..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Difficulty</label>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Sort By</label>
            <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className="btn btn-sm"
            style={{ background: category === c ? "var(--gradient-main)" : "var(--bg-glass)", color: category === c ? "white" : "var(--text-secondary)", border: "1px solid var(--border)" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Tour Cards */}
      <div className="grid-3">
        {filtered.map(tour => (
          <div key={tour.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative" }}>
              <img
                src={getImg(tour)}
                alt={tour.title}
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"; }}
              />
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                <span className="badge badge-teal" style={{ backdropFilter: "blur(8px)", background: "rgba(20,210,190,0.85)" }}>{tour.category}</span>
                <span className="badge badge-purple" style={{ backdropFilter: "blur(8px)", background: "rgba(124,58,237,0.85)" }}>{tour.difficulty}</span>
              </div>
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 600 }}>
                ⭐ {tour.rating} ({getReviews(tour)})
              </div>
              <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                <span className="badge" style={{ background: "rgba(16,185,129,0.9)", color: "white", border: "none" }}>🛡️ {getSafety(tour)}%</span>
              </div>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>🏢 {getCompany(tour)}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{tour.title}</h3>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                📍 {tour.destination} · {tour.duration} days · Max {getGroup(tour)} pax
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {(tour.highlights || []).slice(0, 3).map(h => <span key={h} className="tag" style={{ fontSize: 11 }}>✓ {h}</span>)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                <div>
                  <div className="price">{formatPKR(tour.price)}</div>
                  <div className="price-sub">per person</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setBookingTourId(tour.id)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏔️</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No tours found</div>
          <div style={{ fontSize: 14 }}>Try adjusting your filters</div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {bookingTourId && (() => {
        const tour = filtered.find(t => t.id === bookingTourId);
        if (!tour) return null;
        return (
          <div className="modal-backdrop" onClick={() => setBookingTourId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <button className="modal-close" onClick={() => setBookingTourId(null)}>✕</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Book Tour</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>{tour.title} — {tour.destination}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Travel Date</label>
                  <input className="input" type="date" min={new Date().toISOString().split("T")[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Group Size (Max {getGroup(tour)})</label>
                  <input className="input" type="number" min={1} max={getGroup(tour)} value={bookingGroup} onChange={e => setBookingGroup(Number(e.target.value))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Special Requests (Optional)</label>
                  <textarea className="input" rows={2} placeholder="Any dietary needs, accessibility requirements..." style={{ resize: "vertical" }} value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} />
                </div>
                <div style={{ padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Total Price</span>
                  <span style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(tour.price * bookingGroup)}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} disabled={bookingLoading} onClick={() => setBookingTourId(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={bookingLoading} onClick={async () => {
                    if (!profile) { alert("Please login first"); return; }
                    if (!bookingDate) { alert("Please select a travel date"); return; }
                    if (!tour.company_id) { alert("This tour is not linked to a company yet. Please contact support."); return; }
                    setBookingLoading(true);
                    const result = await createBooking({
                      tour_id: tour.id,
                      user_id: profile.id,
                      company_id: tour.company_id,
                      group_size: bookingGroup,
                      total_price: tour.price * bookingGroup,
                      travel_date: bookingDate,
                      notes: bookingNotes || undefined,
                    });
                    setBookingLoading(false);
                    if (result) {
                      alert("✅ Booking confirmed!");
                      setBookingTourId(null);
                    } else {
                      alert("❌ Booking failed. Please try again.");
                    }
                  }}>
                    {bookingLoading ? <span className="loading-spinner" /> : "Confirm Booking →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
