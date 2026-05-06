"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";
import { CancelBookingButton } from "@/components/user/CancelBookingButton";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { ReviewModal } from "@/components/user/ReviewModal";

interface Booking {
  id: string;
  tour_id: string;
  user_id: string;
  company_id: string;
  travel_date: string;
  group_size: number;
  total_price: number;
  status: string;
  payment_status: string;
  tours?: {
    title: string;
    destination: string;
    image_url?: string | null;
    company_id?: string;
    companies?: { name: string }
  } | null;
}

export default function BookingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [reviewBooking, setReviewBooking] = useState<{ id: string; tourId: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      // Safety timeout: stop loading after 8 seconds no matter what
      const timer = setTimeout(() => {
        if (mounted) setLoading(false);
      }, 8000);

      try {
        if (profile?.id) {
          console.log("[Bookings] Fetching for user:", profile.id);
          const data = await fetchBookings({ userId: profile.id });
          if (mounted) setBookings(data as unknown as Booking[]);
        } else {
          console.log("[Bookings] Waiting for profile...");
        }
      } catch (err) {
        console.error("[Bookings] Load failed:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    if (!profile && !authLoading) {
      setLoading(false); // Stop if definitely no user
    } else {
      load();
    }

    return () => { mounted = false; };
  }, [profile, authLoading]);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  const getCompanyName = (b: Booking) => b.tours?.companies?.name || "Tour Company";

  return (
    <div className="animate-fade" style={{ padding: "0 20px 60px" }}>
      {/* Premium Stats Header */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginBottom: 40, marginTop: 10, padding: "0 10px" 
      }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>My Journey</p>
          <h1 className="topbar-title" style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>My Bookings</h1>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total trips</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>{bookings.length}</p>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)", alignSelf: "center" }} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Confirmed</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)", margin: 0 }}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40, padding: 4, borderRadius: 16, background: "rgba(255,255,255,0.03)", width: "fit-content" }}>
        {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "10px 20px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.3s", textTransform: "capitalize",
              background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
              color: filter === f ? "#fff" : "var(--text-secondary)",
              boxShadow: filter === f ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '100px 40px', borderRadius: 32 }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🧭</div>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>No bookings found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {filter === 'all' 
              ? "You haven't planned any adventures yet. Explore our curated tours to start your journey."
              : `You don't have any ${filter} bookings at the moment.`}
          </p>
          <Link href="/user/tours" className="btn btn-primary" style={{ padding: "14px 32px" }}>Explore Destinations</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {filtered.map((booking) => (
            <div key={booking.id} className="glass-card" style={{ 
              padding: 0, overflow: "hidden", borderRadius: 32, 
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", minHeight: 280, position: "relative"
            }}>
              {/* IMAGE SECTION (Fixed Side) */}
              <div style={{ width: 380, minWidth: 380, position: "relative", overflow: "hidden" }}>
                <img 
                  src={booking.tours?.image_url || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80"} 
                  alt={booking.tours?.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,17,23,0), rgba(13,17,23,0.4))" }} />
                {/* Destination Badge */}
                <div style={{ 
                  position: "absolute", top: 20, left: 20,
                  padding: "8px 16px", borderRadius: 14, fontSize: 11, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: 1.5,
                  background: "rgba(0,0,0,0.8)", color: "#fff",
                  backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)"
                }}>
                  {booking.tours?.destination || "Adventure"}
                </div>
              </div>

              {/* INFO SECTION */}
              <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#fff" }}>{booking.tours?.title}</h3>
                    <span className={`badge ${getStatusColor(booking.status)}`} style={{ padding: "6px 14px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", gap: 48, marginTop: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>📅</span>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Date</p>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{new Date(booking.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>👥</span>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Travelers</p>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{booking.group_size} Person</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>🛡️</span>
                      <div>
                        <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>Payment</p>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: booking.payment_status === 'paid' ? 'var(--emerald)' : 'var(--gold)' }}>
                          {booking.payment_status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Paid</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: "var(--accent)", margin: 0 }}>{formatPKR(booking.total_price)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {profile && (booking.company_id || booking.tours?.company_id) && (
                      <StartChatButton
                        bookingId={booking.id}
                        userId={profile.id}
                        companyId={booking.company_id || booking.tours?.company_id || ""}
                        otherPartyName={getCompanyName(booking)}
                        currentRole="user"
                      />
                    )}
                    
                    {(booking.status === "completed" || booking.status === "confirmed") && (
                      <button 
                        onClick={() => setReviewBooking({ id: booking.id, tourId: booking.tour_id })} 
                        className="btn btn-ghost" 
                        style={{ color: "var(--accent)", fontWeight: 700, border: "1px solid rgba(161,196,253,0.2)" }}
                      >
                        ⭐ Review
                      </button>
                    )}
                    
                    {booking.status === "pending" && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal 
          bookingId={reviewBooking.id} 
          tourId={reviewBooking.tourId} 
          onClose={() => setReviewBooking(null)} 
        />
      )}
    </div>
  );
}
