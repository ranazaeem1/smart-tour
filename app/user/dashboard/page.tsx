/**
 * @file page.tsx
 * @description User Dashboard. Serves as the primary authenticated entry point for travelers.
 * Displays upcoming bookings, top AI tour recommendations, safety overviews, and budget stats.
 * @author Smart Tour Team
 * @dependencies react, next/link, @/components/AuthProvider, @/lib/db
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, fetchTours, fetchSafetyZones } from "@/lib/db";
import { formatPKR, ITINERARY_5DAY, BUDGET_BREAKDOWN } from "@/lib/data";

// ==========================================
// Component: UserDashboard
// ==========================================

/**
 * UserDashboard Component
 * Renders the traveler's personalized dashboard view.
 * 
 * @returns {JSX.Element} The rendered dashboard
 */
export default function UserDashboard() {
  // ==========================================
  // Hooks & Context
  // ==========================================
  const { profile, loading: authLoading } = useAuth();

  // ==========================================
  // State Management
  // ==========================================
  
  // Type definitions inline for brevity, though ideally they belong in a separate types file
  const [bookings, setBookings] = useState<{
    id: string; travel_date: string; group_size: number;
    total_price: number; status: string;
    tours: { title: string; destination: string } | null;
  }[]>([]);

  const [featuredTour, setFeaturedTour] = useState<{
    id: string; title: string; destination: string; duration: number;
    price: number; rating: number; review_count: number;
    tags: string[]; safety_score: number;
    companies: { name: string } | null;
  } | null>(null);

  const [safetyZones, setSafetyZones] = useState<{
    area: string; score: number; status: string;
  }[]>([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Effects
  // ==========================================

  /**
   * Initializes dashboard data by fetching user bookings, featured tours, 
   * and safety zones concurrently to minimize load time.
   */
  useEffect(() => {
    async function load() {
      setLoading(true);
      // Execute database queries in parallel
      const [booksData, toursData, zonesData] = await Promise.all([
        profile ? fetchBookings({ userId: profile.id }) : fetchBookings(),
        fetchTours({ featured: true }),
        fetchSafetyZones(),
      ]);

      // Filter out completed bookings for the "upcoming" preview section
      setBookings(booksData.filter((b: { status: string }) => b.status !== "completed").slice(0, 3) as typeof bookings);
      // Select the first featured tour as the AI recommendation
      if (toursData.length > 0) setFeaturedTour(toursData[0] as typeof featuredTour);
      // Slice top 6 safety zones to avoid overwhelming the UI widget
      setSafetyZones(zonesData.slice(0, 6) as typeof safetyZones);
      setLoading(false);
    }
    
    // Only load data after auth state has been resolved
    if (!authLoading) load();
  }, [authLoading, profile]);

  // ==========================================
  // Computed Properties
  // ==========================================
  const displayName = profile?.full_name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  // TODO: Add pagination for upcoming bookings instead of slicing hardcoded limits
  const upcoming = bookings.filter(b => b.status !== "completed").slice(0, 3);

  /**
   * Determines the UI color coding for safety scores.
   * @param {number} score - Safety score (0-100)
   * @returns {string} HEX color code
   */
  const zoneColor = (score: number) =>
    score >= 90 ? "#14D2BE" : score >= 80 ? "#10B981" : score >= 70 ? "#F59E0B" : "#EF4444";

  // ==========================================
  // JSX Return
  // ==========================================

  // Loading State
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="animate-fade">
      {/* 
        ================================================================
        Header Section
        ================================================================
      */}
      <div className="topbar" style={{ 
        position: "relative", 
        margin: "-28px -32px 28px", 
        padding: "32px", 
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        {/* Background Image and Overlays */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sunset-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.6)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(21, 34, 56, 0.9) 0%, rgba(21, 34, 56, 0.4) 100%)", zIndex: 1 }}></div>
        
        {/* Header Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Good morning 👋</div>
            <h1 className="topbar-title" style={{ color: "#fff", margin: 0 }}>{displayName}&apos;s Dashboard</h1>
          </div>
          
          <div className="topbar-actions">
            {/* Quick Actions */}
            <Link href="/user/register-company" className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>🏢 Register Company</Link>
            <Link href="/user/planner" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #a1c4fd 0%, #ff9a9e 100%)", color: "#111", border: "none" }}>+ Plan New Trip</Link>
            
            {/* Notification Bell */}
            {/* FIXME: Implement real notification system instead of alert */}
            <div style={{ position: "relative" }}>
              <button className="btn btn-secondary btn-icon" onClick={() => alert('No new notifications')} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>🔔</button>
              <span className="notif-dot" />
            </div>
            
            {/* User Avatar */}
            <div className="avatar" style={{ background: "linear-gradient(135deg, #a1c4fd 0%, #ff9a9e 100%)", color: "#111", border: "none", textShadow: "none" }}>{initials || "U"}</div>
          </div>
        </div>
      </div>

      {/* 
        ================================================================
        Summary Statistics
        ================================================================
      */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { value: upcoming.length.toString(), label: "Upcoming Trips", color: "var(--teal)", icon: "🗺️" },
          // Convert total spent to K notation for readability
          { value: `PKR ${Math.round(bookings.reduce((s, b) => s + b.total_price, 0) / 1000)}K`, label: "Total Spent", color: "var(--purple-light)", icon: "💰" },
          { value: bookings.filter(b => b.status === "completed").length.toString(), label: "Tours Completed", color: "var(--gold)", icon: "✅" },
          { value: "4.9★", label: "Avg. Rating Given", color: "var(--emerald)", icon: "⭐" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* 
          ================================================================
          AI Tour Recommendation Widget
          ================================================================
        */}
        {featuredTour ? (
          <div className="card" style={{ background: "linear-gradient(135deg,rgba(20,210,190,0.08),rgba(124,58,237,0.08))", border: "1px solid var(--border-active)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: 8, display: "inline-flex" }}>🤖 AI Recommendation</span>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{featuredTour.title}</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{featuredTour.destination} · {featuredTour.duration} days</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="price">{formatPKR(featuredTour.price)}</div>
                <div className="price-sub">per person</div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(featuredTour.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <span style={{ color: "var(--gold)" }}>⭐</span>
                <span style={{ fontWeight: 600 }}>{featuredTour.rating}</span>
                <span style={{ color: "var(--text-muted)" }}>({featuredTour.review_count} reviews)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <span style={{ color: "var(--emerald)" }}>🛡️</span>
                <span style={{ fontWeight: 600, color: "var(--emerald)" }}>{featuredTour.safety_score}% Safe</span>
              </div>
            </div>
            
            <Link href={`/user/tours/${featuredTour.id}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              View Tour Details →
            </Link>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <p style={{ color: "var(--text-muted)" }}>No tours available yet.</p>
          </div>
        )}

        {/* 
          ================================================================
          Quick Itinerary Widget
          ================================================================
        */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">📅 5-Day Hunza Itinerary</h2>
            <Link href="/user/planner" className="btn btn-ghost btn-sm">Edit</Link>
          </div>
          <div className="timeline">
            {ITINERARY_5DAY.slice(0, 4).map(day => (
              <div key={day.day} className="timeline-item">
                <div className="timeline-dot" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Day {day.day}: {day.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{day.places.slice(0, 2).join(" · ")}</div>
                  </div>
                  <span className="weather-chip">{day.weatherIcon} {day.weather.split(" ")[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* 
          ================================================================
          Budget Breakdown Widget
          ================================================================
        */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">💰 Budget Breakdown</h2>
            <Link href="/user/budget" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {BUDGET_BREAKDOWN.map(item => (
            <div key={item.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: item.color }}>{item.value}% · {formatPKR(item.amount)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* 
          ================================================================
          Safety Zones Widget
          ================================================================
        */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">🛡️ Safety Overview</h2>
            <Link href="/user/safety" className="btn btn-ghost btn-sm">Full Map</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {safetyZones.map(zone => (
              <div key={zone.area} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{zone.area}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${zone.score}%`, background: zoneColor(zone.score) }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: zoneColor(zone.score), width: 30 }}>{zone.score}</span>
                  <span className="badge" style={{ fontSize: 10, padding: "2px 8px", background: `${zoneColor(zone.score)}20`, color: zoneColor(zone.score), border: `1px solid ${zoneColor(zone.score)}40` }}>{zone.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        ================================================================
        Upcoming Bookings Table
        ================================================================
      */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">📋 Upcoming Bookings</h2>
          <Link href="/user/bookings" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <p>No upcoming bookings. <Link href="/user/tours" style={{ color: "var(--teal)" }}>Browse tours →</Link></p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tour</th><th>Destination</th><th>Date</th><th>Group</th><th>Total</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, fontSize: 14 }}>{b.tours?.title || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{b.tours?.destination || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{b.travel_date}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{b.group_size} pax</td>
                    <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(b.total_price)}</td>
                    <td><span className={`badge ${b.status === "confirmed" ? "badge-emerald" : "badge-gold"}`}>{b.status}</span></td>
                    <td><Link href="/user/bookings" className="btn btn-secondary btn-sm">Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
