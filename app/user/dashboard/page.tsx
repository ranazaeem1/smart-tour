"use client";

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
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { 
  fetchTours, 
  fetchBookings, 
  fetchSafetyZones, 
  fetchUserExpenses 
} from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { NotificationBell } from "@/components/shared/NotificationBell";

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
  const [expenses, setExpenses] = useState<{ category: string, amount: number }[]>([]);
  const [totalBudget, setTotalBudget] = useState(100000);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Effects
  // ==========================================

  /**
   * Initializes dashboard data by fetching user bookings, featured tours, 
   * and safety zones concurrently to minimize load time.
   */
  const isFirstLoad = useRef(true);

  useEffect(() => {
    async function load() {
      // Prevent double-firing in Strict Mode
      if (!isFirstLoad.current) return;
      
      if (!authLoading && !profile) {
        setLoading(false);
        return;
      }
      
      if (profile?.id) {
        setLoading(true);
        try {
          // 1. Session Warmup: Fire one request first to ensure the auth lock is acquired 
          // and the token is refreshed before hitting the DB with parallel calls.
          await fetchSafetyZones().catch(() => []); 

          // 2. Data Fetching: Now that the session is "warm", fire parallel requests.
          const [booksData, toursData, zonesData] = await Promise.all([
            fetchBookings({ userId: profile.id }),
            fetchTours({ featured: true }),
            fetchSafetyZones(),
          ]);

          setBookings(booksData.filter((b: { status: string }) => b.status !== "completed").slice(0, 3) as typeof bookings);
          if (toursData.length > 0) setFeaturedTour(toursData[0] as typeof featuredTour);
          setSafetyZones(zonesData.slice(0, 6) as typeof safetyZones);

          // 3. Sequential load for user-specific data to prevent lock contention
          const expensesData = await fetchUserExpenses(profile.id);
          setExpenses(expensesData as any[]);
          
          if ((profile as any).total_budget) {
            setTotalBudget((profile as any).total_budget);
          }
          
          isFirstLoad.current = false;
        } catch (err: any) {
          // Ignore AbortErrors that are already being handled by retries in db.ts
          if (err.name !== 'AbortError') {
            console.error("UserDashboard load error:", err);
          }
        } finally {
          setLoading(false);
        }
      }
    }
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
        margin: "-32px -40px 32px", 
        padding: "40px", 
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        {/* Background Image and Overlays */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sunset-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.75)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)", zIndex: 1 }}></div>
        
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
            <NotificationBell role="user" userId={profile?.id} />
            
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
          { value: formatPKR(expenses.reduce((s, e) => s + e.amount, 0)), label: "Total Spent", color: "var(--purple-light)", icon: "💰" },
          { value: bookings.filter(b => b.status === "completed").length.toString(), label: "Tours Completed", color: "var(--gold)", icon: "✅" },
          { value: bookings.length.toString(), label: "Total Bookings", color: "var(--emerald)", icon: "📋" },
        ].map(s => (
          <div key={s.label} className="card-glass" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
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
          <div className="card-glass" style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(13, 148, 136, 0.3)" }}>
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
        <div className="card-glass">
          <div className="section-header">
            <h2 className="section-title">📊 Quick Stats</h2>
            <Link href="/user/budget" className="btn btn-ghost btn-sm">Manage Budget</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Confirmed Bookings</span>
              <span style={{ fontWeight: 700, color: "var(--emerald)" }}>{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Pending Bookings</span>
              <span style={{ fontWeight: 700, color: "var(--gold)" }}>{bookings.filter(b => b.status === 'pending').length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Completed Tours</span>
              <span style={{ fontWeight: 700, color: "var(--teal)" }}>{bookings.filter(b => b.status === 'completed').length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Total Spent</span>
              <span style={{ fontWeight: 700, color: "var(--purple-light)" }}>{formatPKR(expenses.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
            <Link href="/user/tours" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>Browse All Tours →</Link>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* 
          ================================================================
          Budget Breakdown Widget
          ================================================================
        */}
        <div className="card-glass">
          <div className="section-header">
            <h2 className="section-title">💰 Budget Breakdown</h2>
            <Link href="/user/budget" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {expenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No expenses logged yet. <Link href="/user/budget" style={{ color: "var(--teal)" }}>Track budget →</Link>
            </div>
          ) : (
            ["Transport", "Accommodation", "Food", "Activities"].map(catName => {
              const amount = expenses.filter(e => e.category === catName).reduce((sum, e) => sum + e.amount, 0);
              const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
              const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
              const color = catName === "Transport" ? "#14D2BE" : catName === "Accommodation" ? "#7C3AED" : catName === "Food" ? "#F59E0B" : "#10B981";
              
              return (
                <div key={catName} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{catName}</span>
                    <span style={{ fontWeight: 600, color }}>{percent}% · {formatPKR(amount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 
          ================================================================
          Safety Zones Widget
          ================================================================
        */}
        <div className="card-glass">
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
      <div className="card-glass" style={{ marginBottom: 28 }}>
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

      {/* 
        ================================================================
        Register Company CTA Card
        ================================================================
      */}
      <div className="card-glass" style={{ 
        background: "linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)", 
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "32px 40px",
        flexWrap: "wrap",
        gap: "24px"
      }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#fff" }}>Do you own a Tour Company? 🏔️</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6 }}>
            Join our platform as a verified partner. Create tours, manage bookings, and reach thousands of travelers across Pakistan.
          </p>
        </div>
        <Link href="/user/register-company" className="btn btn-primary" style={{ 
          padding: "16px 32px", 
          fontSize: 16, 
          fontWeight: 700,
          background: "var(--gradient-main)",
          border: "none",
          color: "#fff",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
        }}>
          Register Your Company →
        </Link>
      </div>
    </div>
  );
}
