"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { fetchTourById, createBooking } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const { profile } = useAuth();
  
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [bookingDate, setBookingDate] = useState("");
  const [bookingGroup, setBookingGroup] = useState(2);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchTourById(id);
      setTour(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><span className="loading-spinner" /></div>;
  if (!tour) return <div style={{ textAlign: "center", padding: 60 }}><h2>Tour not found</h2><br/><Link href="/user/tours" className="btn btn-primary" style={{display:"inline-flex"}}>Back to Tours</Link></div>;

  const getImg = (t: any) => t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200";
  const getSafety = (t: any) => t.safety_score || t.safetyScore || 80;
  const getGroup = (t: any) => t.max_group || t.maxGroup || 10;
  const getReviews = (t: any) => t.review_count || t.reviews || 0;
  const getCompany = (t: any) => t.companies?.name || t.company || "—";

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <Link href="/user/tours" style={{ color: "var(--teal)", textDecoration: "none", fontSize: 14 }}>← Back to Tours</Link>
          <h1 className="topbar-title">{tour.title}</h1>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left Column: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <img src={getImg(tour)} alt={tour.title} style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 16 }} />
          
          <div className="card">
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>Tour Overview</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <span className="badge badge-teal">📍 {tour.destination}</span>
              <span className="badge badge-purple">⏱️ {tour.duration} days</span>
              <span className="badge badge-emerald">🛡️ {getSafety(tour)}% Safe</span>
              <span className="badge badge-gold">⭐ {tour.rating} ({getReviews(tour)} reviews)</span>
            </div>
            
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              Experience the best of {tour.destination} with {getCompany(tour)}. This {tour.category?.toLowerCase() || 'adventure'} tour offers a {tour.difficulty?.toLowerCase() || 'moderate'} difficulty level and includes guided exploration of the region's top highlights.
            </p>

            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Highlights</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 20, color: "var(--text-secondary)" }}>
              {(tour.highlights || ["Scenic views", "Guided tours", "Local cuisine"]).map((h: string) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        </div>

        {/* Right Column: Booking */}
        <div className="card" style={{ position: "sticky", top: 24 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Book this Tour</h2>
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
              <label className="input-label">Special Requests</label>
              <textarea className="input" rows={2} placeholder="Optional..." style={{ resize: "vertical" }} value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} />
            </div>
            
            <div style={{ padding: "14px", background: "var(--bg-primary)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-secondary)" }}>
                <span>Price per person</span>
                <span>{formatPKR(tour.price)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <span>Total</span>
                <span style={{ color: "var(--teal)" }}>{formatPKR(tour.price * bookingGroup)}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ justifyContent: "center", padding: 14 }} disabled={bookingLoading} onClick={async () => {
              if (!profile) { alert("Please login first"); return; }
              if (!bookingDate) { alert("Please select a date"); return; }
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
                router.push("/user/bookings");
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
}
