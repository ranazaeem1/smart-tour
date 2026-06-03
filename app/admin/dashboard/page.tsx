/**
 * @file page.tsx
 * @description Admin Dashboard. Centralized command center for platform administrators.
 * Manages company approvals, monitors platform revenue, system alerts, and global metrics.
 * @author Smart Tour Team
 * @dependencies react, next/link, @/lib/db
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { useEffect, useState } from "react";
import { useState as useStateFilter } from "react";
import Link from "next/link";
import { fetchCompanies, fetchBookings, fetchReviews, fetchRevenueStats, fetchPlatformStats, updateCompanyStatus } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";
import { AlertTriangle, BarChart3, Building2, Check, ClipboardList, MessageSquare, Mountain, Star, Users, Wallet, X } from "lucide-react";

// ==========================================
// Constants & Mock Data
// ==========================================


// ==========================================
// Component: AdminDashboard
// ==========================================

/**
 * AdminDashboard Component
 * Provides comprehensive platform management capabilities for Super Admins.
 * 
 * @returns {JSX.Element} The rendered admin dashboard
 */
export default function AdminDashboard() {
  // ==========================================
  // State Management
  // ==========================================
  
  const [companyFilter, setCompanyFilter] = useStateFilter<"all" | "pending" | "approved">("all");
  
  // Platform entity states
  const [companies, setCompanies] = useState<{
    id: string; name: string; email: string; city: string | null;
    logo: string | null; status: string; verified: boolean;
    rating: number; total_tours: number; total_bookings: number;
    total_revenue: number; created_at: string;
  }[]>([]);
  
  const [bookings, setBookings] = useState<{
    id: string; travel_date: string; total_price: number;
    status: string; payment_status: string;
    tours: { title: string; destination: string } | null;
    profiles: { full_name: string | null; email: string } | null;
    companies?: { name: string } | null;
  }[]>([]);
  
  const [reviews, setReviews] = useState<{
    id: string; rating: number; comment: string; sentiment: string;
    created_at: string;
    tours: { title: string } | null;
    profiles: { full_name: string | null } | null;
  }[]>([]);
  
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; bookings: number }[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCompanies: 0, activeTours: 0, platformRevenue: 0 });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // ==========================================
  // Effects
  // ==========================================

  /**
   * Initializes platform data asynchronously.
   * Catches errors individually to ensure partial data loads even if one service fails.
   */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // 1. Session Warmup: Fire one request first to ensure the auth lock is acquired 
        // and the token is refreshed before hitting the DB with parallel calls.
        await fetchPlatformStats().catch(() => null); 

        // 2. Parallel data fetching for performance optimization
        const [companiesData, bookingsData, reviewsData, revenueData, statsData] = await Promise.all([
          fetchCompanies().catch(() => []),
          fetchBookings().catch(() => []),
          fetchReviews().catch(() => []),
          fetchRevenueStats().catch(() => []),
          fetchPlatformStats().catch(() => ({ totalUsers: 0, totalCompanies: 0, activeTours: 0, platformRevenue: 0 })),
        ]);
        
        setCompanies(companiesData as typeof companies);
        setBookings(bookingsData.slice(0, 6) as typeof bookings);
        setReviews(reviewsData.slice(0, 4) as typeof reviews);
        setMonthlyRevenue(revenueData);
        setStats(statsData);
      } catch (err) {
        console.error("[AdminDashboard] load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Approves a pending company registration.
   * @param {string} id - The company ID to approve
   */
  const handleApprove = async (id: string) => {
    setApprovingId(id);
    const updated = await updateCompanyStatus(id, "approved");
    if (updated) {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "approved" } : c));
    }
    setApprovingId(null);
  };

  /**
   * Suspends an active or pending company.
   * @param {string} id - The company ID to suspend
   */
  const handleSuspend = async (id: string) => {
    if (!confirm("Suspend this company?")) return;
    setApprovingId(id);
    const updated = await updateCompanyStatus(id, "suspended");
    if (updated) {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "suspended" } : c));
    }
    setApprovingId(null);
  };

  // ==========================================
  // Computed Properties
  // ==========================================
  
  const filteredCompanies = companyFilter === "all"
    ? companies
    : companies.filter(c => c.status === companyFilter);

  // Determine max revenue for dynamic chart scaling
  const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const pendingCount = companies.filter(c => c.status === "pending").length;
  const ADMIN_STATS = [
    { value: stats.totalUsers.toLocaleString(), label: "Total Users", color: "var(--teal)", icon: <Users size={24} />, change: `${stats.totalUsers} registered` },
    { value: stats.totalCompanies.toString(), label: "Tour Companies", color: "var(--purple-light)", icon: <Building2 size={24} />, change: `${pendingCount} pending` },
    { value: formatPKR(stats.platformRevenue), label: "Platform Revenue", color: "var(--gold)", icon: <Wallet size={24} />, change: "Live total" },
    { value: stats.activeTours.toString(), label: "Active Tours", color: "var(--emerald)", icon: <Mountain size={24} />, change: "Approved only" },
  ];

  // ==========================================
  // JSX Return
  // ==========================================

  // Loading indicator
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Dashboard Metrics */}

      {/* 
        ================================================================
        Summary Stats Widget
        ================================================================
      */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {ADMIN_STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="badge badge-emerald" style={{ fontSize: 10 }}>{s.change}</span>
            </div>
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
        <div className="card">
          <div className="section-header">
            <h2 className="section-title inline-flex items-center gap-2"><BarChart3 size={20} /> Platform Revenue 2024</h2>
            <span className="badge badge-gold">{formatPKR(stats.platformRevenue)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 160, paddingBottom: 8 }}>
            {monthlyRevenue.map(m => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {/* Dynamic bar height based on relative monthly revenue */}
                <div
                  style={{ width: "100%", borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg, var(--emerald), var(--teal))", height: `${(m.revenue / maxRev) * 140}px`, transition: "height 0.5s ease", minHeight: 4 }}
                  title={formatPKR(m.revenue)}
                />
                <div style={{ fontSize: 9, color: "var(--text-muted)", transform: "rotate(-45deg)" }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          ================================================================
          System Alerts Widget
          ================================================================
        */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-title inline-flex items-center gap-2"><AlertTriangle size={20} /> System Alerts</h2>
            <span className="badge badge-teal">{pendingCount > 0 ? `${pendingCount} Pending` : 'All Clear'}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingCount > 0 && (
              <div className="alert alert-warning" style={{ fontSize: 13 }}>
                <div style={{ flex: 1 }}>⏳ {pendingCount} company registration{pendingCount > 1 ? 's' : ''} pending approval</div>
              </div>
            )}
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <div className="alert alert-info" style={{ fontSize: 13 }}>
                <div className="inline-flex items-center gap-2" style={{ flex: 1 }}><ClipboardList size={16} /> {bookings.filter(b => b.status === 'pending').length} bookings awaiting confirmation</div>
              </div>
            )}
            {pendingCount === 0 && bookings.filter(b => b.status === 'pending').length === 0 && (
              <div className="alert alert-success" style={{ fontSize: 13 }}>
                <div className="inline-flex items-center gap-2" style={{ flex: 1 }}><Check size={16} /> All systems operational. No pending actions.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        ================================================================
        Company Approvals / Management Table
        ================================================================
      */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 className="section-title inline-flex items-center gap-2"><Building2 size={20} /> Tour Companies</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "approved"] as const).map(f => (
              <button key={f} className={`tab-btn ${companyFilter === f ? "active" : ""}`}
                style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer", background: companyFilter === f ? "var(--gradient-main)" : "var(--bg-secondary)", color: companyFilter === f ? "white" : "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}
                onClick={() => setCompanyFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {/* Show notification bubble for pending approvals */}
                {f === "pending" && companies.filter(c => c.status === "pending").length > 0 && (
                  <span style={{ marginLeft: 4, background: "var(--rose)", color: "white", borderRadius: "50%", padding: "0 5px", fontSize: 10 }}>
                    {companies.filter(c => c.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {filteredCompanies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>No companies found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Company</th><th>City</th><th>Tours</th><th>Bookings</th><th>Revenue</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredCompanies.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--gradient-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {c.logo || c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.city || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.total_tours}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.total_bookings}</td>
                    <td style={{ color: "var(--teal)", fontWeight: 700 }}>{c.total_revenue > 0 ? formatPKR(c.total_revenue) : "—"}</td>
                    <td style={{ color: "var(--gold)", fontWeight: 700 }}>{c.rating > 0 ? <span className="inline-flex items-center gap-1"><Star size={13} fill="currentColor" /> {c.rating}</span> : "—"}</td>
                    <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* Status-specific action buttons */}
                        {c.status === "pending" && <>
                          <button
                            className="btn btn-sm"
                            style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" }}
                            onClick={() => handleApprove(c.id)}
                            disabled={approvingId === c.id}
                          ><Check size={14} /> Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(c.id)} disabled={approvingId === c.id} aria-label="Reject company"><X size={14} /></button>
                        </>}
                        {c.status === "suspended" && (
                          <button className="btn btn-sm" style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald)" }} onClick={() => handleApprove(c.id)}>Restore</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 
        ================================================================
        Recent Bookings Table
        ================================================================
      */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 className="section-title inline-flex items-center gap-2"><ClipboardList size={20} /> Recent Bookings</h2>
          <Link href="/admin/bookings" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>No bookings yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Customer</th><th>Tour</th><th>Date</th><th>Amount</th><th>Booking</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.profiles?.full_name || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{b.tours?.title || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{b.travel_date}</td>
                    <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(b.total_price)}</td>
                    <td><span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span></td>
                    <td><span className={`badge ${getStatusColor(b.payment_status)}`}>{b.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 
        ================================================================
        Platform Reviews
        ================================================================
      */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title inline-flex items-center gap-2"><MessageSquare size={20} /> Reviews & Sentiment</h2>
          <Link href="/admin/reviews" className="btn btn-ghost btn-sm">All Reviews</Link>
        </div>
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>No reviews yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>
                  {(r.profiles?.full_name || "U").charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{r.profiles?.full_name || "Anonymous"}</span>
                      <span className="inline-flex items-center gap-0.5" style={{ color: "var(--gold)", fontSize: 13 }}>
                        {Array.from({ length: r.rating }).map((_, index) => <Star key={index} size={13} fill="currentColor" />)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge ${getStatusColor(r.sentiment)}`}>{r.sentiment}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {new Date(r.created_at).toLocaleDateString("en-PK")}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{r.tours?.title || "Unknown Tour"}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.comment}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
