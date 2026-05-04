/**
 * @file page.tsx
 * @description Company Dashboard. The main operational interface for tour operators.
 * Allows tour companies to view their performance metrics, manage their tours, and track bookings.
 * @author Smart Tour Team
 * @dependencies react, next/link, @/components/AuthProvider, @/lib/db
 */

// ==========================================
// Imports
// ==========================================
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPKR, getStatusColor } from "@/lib/data";
import { fetchTours, fetchBookings, fetchReviews, fetchRevenueStats, fetchCompanyByOwner } from "@/lib/db";
import { useAuth } from "@/components/AuthProvider";

// ==========================================
// Constants & Mock Data
// ==========================================

// TODO: Replace with dynamic sentiment data derived from actual company reviews
const SENTIMENT_DATA = [
  { label: "Positive", value: 78, color: "var(--emerald)" },
  { label: "Neutral", value: 15, color: "var(--gold)" },
  { label: "Negative", value: 7, color: "var(--rose)" },
];

// ==========================================
// Component: CompanyDashboard
// ==========================================

/**
 * CompanyDashboard Component
 * Renders the tour operator's performance dashboard.
 * 
 * @returns {JSX.Element} The rendered company dashboard
 */
export default function CompanyDashboard() {
  // ==========================================
  // Hooks & Context
  // ==========================================
  const { profile } = useAuth();
  
  // ==========================================
  // State Management
  // ==========================================
  const [loading, setLoading] = useState(true);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tours, setTours] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [revenueStats, setRevenueStats] = useState<any[]>([]);
  
  // ==========================================
  // Effects
  // ==========================================

  /**
   * Initializes company-specific data after the user profile is loaded.
   */
  useEffect(() => {
    async function loadData() {
      if (!authLoading && !profile) {
        setLoading(false);
        return;
      }

      if (profile?.id) {
        setLoading(true);
        try {
          const companyProfile = await fetchCompanyByOwner(profile.id);
          if (companyProfile) {
            const [fetchedTours, fetchedBookings, fetchedReviews, fetchedRevenue] = await Promise.all([
              fetchTours({ companyId: companyProfile.id }),
              fetchBookings({ companyId: companyProfile.id }),
              fetchReviews(),
              fetchRevenueStats()
            ]);
            setTours(fetchedTours);
            setBookings(fetchedBookings);
            setReviews(fetchedReviews.slice(0, 3));
            setRevenueStats(fetchedRevenue);
          }
        } catch (err) {
          console.error("Dashboard load error:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [profile, authLoading]);

  // ==========================================
  // Computed Properties
  // ==========================================

  // Performance metrics calculations
  const activeTours = tours.filter(t => t.available).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || b.totalPrice || 0), 0);
  const avgRating = tours.length ? (tours.reduce((sum, t) => sum + (t.rating || 0), 0) / tours.length).toFixed(1) : "0.0";

  const COMPANY_STATS = [
    { value: activeTours.toString(), label: "Active Tours", color: "var(--teal)", icon: "🏔️" },
    { value: bookings.length.toString(), label: "Total Bookings", color: "var(--purple-light)", icon: "📋" },
    { value: formatPKR(totalRevenue), label: "Total Revenue", color: "var(--gold)", icon: "💰" },
    { value: `${avgRating}★`, label: "Avg. Rating", color: "var(--emerald)", icon: "⭐" },
  ];

  const maxRevenue = revenueStats.length ? Math.max(...revenueStats.map(m => m.revenue)) : 1;
  
  // Provide fallback name if profile details are missing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companyName = profile?.full_name || (profile as any)?.company_name || "Company Profile";
  const initials = companyName.substring(0, 2).toUpperCase();

  // ==========================================
  // JSX Return
  // ==========================================

  // Loading indicator
  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><span className="loading-spinner" /></div>;

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
        {/* Background Overlays */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sunset-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.75)", zIndex: 0 }}></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)", zIndex: 1 }}></div>
        
        {/* Header Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Tour Company Panel</div>
            <h1 className="topbar-title" style={{ color: "#fff", margin: 0 }}>{companyName}</h1>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-emerald" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)" }}>✅ Verified</span>
            <Link href="/company/tours/new" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #a1c4fd 0%, #ff9a9e 100%)", color: "#111", border: "none" }}>+ Add New Tour</Link>
            <div className="avatar" style={{ background: "linear-gradient(135deg, #a1c4fd 0%, #ff9a9e 100%)", color: "#111", border: "none", textShadow: "none" }}>{initials}</div>
          </div>
        </div>
      </div>

      {/* 
        ================================================================
        Summary Stats Widget
        ================================================================
      */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {COMPANY_STATS.map(s => (
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
          Revenue Chart Widget
          ================================================================
        */}
        <div className="card-glass">
          <div className="section-header">
            <h2 className="section-title">📈 Monthly Revenue</h2>
            <span className="badge badge-teal">2024</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, paddingBottom: 8 }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {revenueStats.map((m: any) => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {/* Dynamic bar graph representing revenue relative to the maximum month */}
                <div
                  style={{ width: "100%", borderRadius: "4px 4px 0 0", background: "var(--gradient-main)", opacity: 0.85,
                    height: `${(m.revenue / maxRevenue) * 140}px`, transition: "height 0.5s ease", minHeight: 4 }}
                  title={formatPKR(m.revenue)}
                />
                <div style={{ fontSize: 9, color: "var(--text-muted)", transform: "rotate(-45deg)" }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          ================================================================
          Review Sentiment Widget
          ================================================================
        */}
        <div className="card-glass">
          <div className="section-header">
            <h2 className="section-title">💬 Review Sentiment</h2>
            <Link href="/company/reviews" className="btn btn-ghost btn-sm">All Reviews</Link>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24 }}>
            {/* SVG Donut Chart */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {(() => {
                  let offset = 0;
                  const circumference = 2 * Math.PI * 45;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return SENTIMENT_DATA.map((s: any) => {
                    const dashLen = (s.value / 100) * circumference;
                    const el = (
                      <circle key={s.label} cx="60" cy="60" r="45" fill="none" stroke={s.color} strokeWidth="18"
                        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                        strokeDashoffset={-offset} transform="rotate(-90 60 60)" opacity="0.85"/>
                    );
                    offset += dashLen;
                    return el;
                  });
                })()}
                {/* Center Chart Labels */}
                <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--teal)">78%</text>
                <text x="60" y="72" textAnchor="middle" fontSize="9" fill="var(--text-muted)">Positive</text>
              </svg>
            </div>
            
            {/* Legend / Detailed Breakdown */}
            <div style={{ flex: 1 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {SENTIMENT_DATA.map((s: any) => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.value}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }}/></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Reviews Snapshot */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.profiles?.full_name || r.userName || "User"}</span>
                  <span className={`badge ${getStatusColor(r.sentiment)}`} style={{ fontSize: 10 }}>{r.sentiment || 'neutral'}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>&quot;{(r.comment || "").slice(0, 80)}...&quot;</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        ================================================================
        My Tours Table
        ================================================================
      */}
      <div className="card-glass" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 className="section-title">🏔️ My Tour Packages</h2>
          <Link href="/company/tours" className="btn btn-ghost btn-sm">Manage All</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Tour</th><th>Destination</th><th>Price</th><th>Duration</th><th>Rating</th><th>Safety</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tours.slice(0, 4).map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{t.destination}</td>
                  <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(t.price)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{t.duration}d</td>
                  <td><span style={{ color: "var(--gold)", fontWeight: 700 }}>⭐ {t.rating}</span></td>
                  <td><span style={{ color: "var(--emerald)", fontWeight: 700 }}>{t.safety_score || t.safetyScore || 85}%</span></td>
                  <td><span className={`badge ${t.available ? "badge-emerald" : "badge-rose"}`}>{t.available ? "Active" : "Inactive"}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <Link href={`/company/tours/new?id=${t.id}`} className="btn btn-secondary btn-sm">✏️</Link>
                  </td>
                </tr>
              ))}
              {tours.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                    No tours found. Create your first tour package!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        ================================================================
        Recent Bookings Table
        ================================================================
      */}
      <div className="card-glass">
        <div className="section-header">
          <h2 className="section-title">📋 Recent Bookings</h2>
          <Link href="/company/bookings" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Customer</th><th>Tour</th><th>Date</th><th>Group</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.slice(0, 4).map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.profiles?.full_name || b.userName || "User"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{b.tours?.title || b.tourTitle || "Tour"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{b.travel_date || b.date}</td>
                  <td>{b.group_size || b.groupSize} pax</td>
                  <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(b.total_price || b.totalPrice)}</td>
                  <td><span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span></td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                    No recent bookings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
