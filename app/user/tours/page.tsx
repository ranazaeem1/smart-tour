"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchTours, createBooking } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { BookingSuccessModal } from "@/components/BookingSuccessModal";

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

  // ── Booking state ──
  const [bookingTourId, setBookingTourId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingGroup, setBookingGroup] = useState(2);
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedTourTitle, setBookedTourTitle] = useState("");

  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTours();
        setAllTours(data as Tour[]);
      } catch (err) {
        console.error("[ToursPage] Load error:", err);
        setAllTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getImg = (t: Tour) =>
    t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
  const getSafety = (t: Tour) => t.safety_score || t.safetyScore || 80;
  const getGroup = (t: Tour) => t.max_group || t.maxGroup || 10;
  const getReviews = (t: Tour) => t.review_count || t.reviews || 0;
  const getCompany = (t: Tour) => t.companies?.name || t.company || "—";

  const filtered = allTours
    .filter(t => {
      const matchSearch =
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.destination?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      const matchDiff = difficulty === "All" || t.difficulty === difficulty;
      return matchSearch && matchCat && matchDiff;
    })
    .sort((a, b) =>
      sortBy === "price"
        ? a.price - b.price
        : sortBy === "rating"
        ? b.rating - a.rating
        : getReviews(b) - getReviews(a)
    );

  // Phone validation helper
  const isPhoneValid = (phone: string) => /^\+?[\d\s\-(]{9,16}$/.test(phone.trim());

  const handleOpenBooking = (tourId: string) => {
    setBookingTourId(tourId);
    setBookingDate("");
    setBookingGroup(2);
    setBookingPhone(profile?.phone || "");
    setBookingNotes("");
    setBookingError(null);
  };

  const handleCloseBooking = useCallback(() => {
    setBookingTourId(null);
    setBookingError(null);
  }, []);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const handleConfirmBooking = async () => {
    if (!profile) {
      setBookingError("Please login first.");
      return;
    }
    if (!bookingDate) {
      setBookingError("Please select a travel date.");
      return;
    }
    if (!bookingPhone || !isPhoneValid(bookingPhone)) {
      setBookingError("Please enter a valid phone number (e.g. 03XX-XXXXXXX).");
      return;
    }

    const tour = filtered.find(t => t.id === bookingTourId);
    if (!tour) return;

    if (!tour.company_id) {
      setBookingError("This tour is not linked to a company yet. Please contact support.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const result = await createBooking({
        tour_id: tour.id,
        user_id: profile.id,
        company_id: tour.company_id,
        group_size: bookingGroup,
        total_price: tour.price * bookingGroup,
        travel_date: bookingDate,
        notes: bookingNotes || undefined,
      });

      if (result) {
        setBookedTourTitle(tour.title);
        setBookingTourId(null);
        setShowSuccess(true);
      } else {
        setBookingError("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("[Booking] Error:", err);
      setBookingError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );

  const bookingTour = filtered.find(t => t.id === bookingTourId) ?? null;

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
            {filtered.length} tours found
          </div>
          <h1 className="topbar-title">🏔️ Browse Tours</h1>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flex: 2, minWidth: 200 }}>
            <label className="input-label">🔍 Search</label>
            <input
              className="input"
              placeholder="Search tours, destinations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="btn btn-sm"
            style={{
              background: category === c ? "var(--gradient-main)" : "var(--bg-glass)",
              color: category === c ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tour Cards */}
      <div className="grid-3">
        {filtered.map(tour => (
          <div
            key={tour.id}
            className="card"
            style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={getImg(tour)}
                alt={tour.title}
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
                }}
              />
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                <span
                  className="badge badge-teal"
                  style={{ backdropFilter: "blur(8px)", background: "rgba(20,210,190,0.85)" }}
                >
                  {tour.category}
                </span>
                <span
                  className="badge badge-purple"
                  style={{ backdropFilter: "blur(8px)", background: "rgba(124,58,237,0.85)" }}
                >
                  {tour.difficulty}
                </span>
              </div>
              <div
                style={{
                  position: "absolute", top: 12, right: 12,
                  background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
                  borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 600,
                }}
              >
                ⭐ {tour.rating} ({getReviews(tour)})
              </div>
              <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                <span className="badge" style={{ background: "rgba(16,185,129,0.9)", color: "white", border: "none" }}>
                  🛡️ {getSafety(tour)}%
                </span>
              </div>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                🏢 {getCompany(tour)}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{tour.title}</h3>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                📍 {tour.destination} · {tour.duration} days · Max {getGroup(tour)} pax
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {(tour.highlights || []).slice(0, 3).map(h => (
                  <span key={h} className="tag" style={{ fontSize: 11 }}>
                    ✓ {h}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 14,
                  borderTop: "1px solid var(--border)",
                  marginTop: "auto",
                }}
              >
                <div>
                  <div className="price">{formatPKR(tour.price)}</div>
                  <div className="price-sub">per person</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenBooking(tour.id)}
                >
                  Book Now
                </button>
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

      {/* ── UPGRADED Booking Modal — with phone number (Issue #5, #6, #8) ── */}
      {bookingTourId && bookingTour && (
        <div className="modal-backdrop" onClick={handleCloseBooking}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 520,
              background: "rgba(13,17,23,0.97)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 36,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  Book Your Tour
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  {bookingTour.title} · {bookingTour.destination}
                </p>
              </div>
              <button
                onClick={handleCloseBooking}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  width: 32, height: 32,
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── PHONE NUMBER — REQUIRED (Issue #6, #8) ── */}
              <div className="input-group">
                <label
                  className="input-label"
                  style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}
                >
                  📞 Phone Number <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  className="input"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  required
                  value={bookingPhone}
                  onChange={e => setBookingPhone(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                  }}
                />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  The company will contact you on this number to confirm your booking.
                </p>
              </div>

              {/* Travel Date */}
              <div className="input-group">
                <label className="input-label" style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  📅 Travel Date <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  className="input"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                  }}
                />
              </div>

              {/* Group Size */}
              <div className="input-group">
                <label className="input-label" style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  👥 Group Size (Max {getGroup(bookingTour)})
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setBookingGroup(g => Math.max(1, g - 1))}
                    style={{
                      width: 38, height: 38, borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 18,
                    }}
                  >
                    −
                  </button>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: "center" }}>
                    {bookingGroup}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBookingGroup(g => Math.min(getGroup(bookingTour), g + 1))}
                    style={{
                      width: 38, height: 38, borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 18,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Requests */}
              <div className="input-group">
                <label className="input-label" style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  📝 Special Requests (Optional)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Any dietary needs, accessibility requirements..."
                  style={{
                    resize: "vertical",
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                  }}
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                />
              </div>

              {/* Price Summary */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Per Person</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                    {formatPKR(bookingTour.price)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>
                    {formatPKR(bookingTour.price * bookingGroup)}
                  </div>
                </div>
              </div>

              {/* Error display */}
              {bookingError && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#FCA5A5",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  ⚠️ {bookingError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={bookingLoading}
                  onClick={handleCloseBooking}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    border: "none",
                    color: "#fff",
                    opacity: bookingLoading || !bookingDate || !bookingPhone ? 0.6 : 1,
                  }}
                  disabled={bookingLoading || !bookingDate || !bookingPhone}
                  onClick={handleConfirmBooking}
                >
                  {bookingLoading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="loading-spinner" style={{ width: 16, height: 16, borderTopColor: "#fff" }} />
                      Processing...
                    </span>
                  ) : (
                    "Confirm Booking →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ISSUE #7 — Booking Success Modal ── */}
      {showSuccess && (
        <BookingSuccessModal tourTitle={bookedTourTitle} onClose={handleCloseSuccess} />
      )}
    </div>
  );
}
