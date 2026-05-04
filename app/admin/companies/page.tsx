"use client";
import { useEffect, useState } from "react";
import { fetchCompanies, updateCompanyStatus } from "@/lib/db";
import { COMPANIES, formatPKR, getStatusColor } from "@/lib/data";

interface Company {
  id: string; name: string; email: string; phone?: string | null;
  city?: string | null; logo?: string | null; status: string;
  verified: boolean; rating: number; total_tours: number;
  total_bookings: number; total_revenue: number; created_at: string;
  joinDate?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchCompanies();
      if (data.length > 0) {
        setCompanies(data as Company[]);
      } else {
        setCompanies(COMPANIES.map(c => ({
          id: c.id, name: c.name, email: c.email, phone: c.phone,
          city: c.city, logo: c.logo, status: c.status, verified: c.verified,
          rating: c.rating, total_tours: c.totalTours, total_bookings: c.totalBookings,
          total_revenue: c.totalRevenue, created_at: c.joinDate,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    const updated = await updateCompanyStatus(id, "approved");
    if (updated) setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "approved", verified: true } : c));
    setActionId(null);
  };

  const handleSuspend = async (id: string) => {
    if (!confirm("Suspend this company? They won't be able to accept new bookings.")) return;
    setActionId(id);
    const updated = await updateCompanyStatus(id, "suspended");
    if (updated) setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "suspended" } : c));
    setActionId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this company application?")) return;
    setActionId(id);
    const updated = await updateCompanyStatus(id, "suspended");
    if (updated) setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: "suspended" } : c));
    setActionId(null);
  };

  const filtered = companies
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const pendingCount = companies.filter(c => c.status === "pending").length;

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
          <h1 className="topbar-title">🏢 Company Management</h1>
        </div>
        <div className="topbar-actions">
          {pendingCount > 0 && <span className="badge badge-gold">⏳ {pendingCount} Pending Approval</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Companies", value: companies.length, color: "var(--teal)", icon: "🏢" },
          { label: "Approved", value: companies.filter(c => c.status === "approved").length, color: "var(--emerald)", icon: "✅" },
          { label: "Pending", value: pendingCount, color: "var(--gold)", icon: "⏳" },
          { label: "Suspended", value: companies.filter(c => c.status === "suspended").length, color: "var(--rose)", icon: "🚫" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="input-group">
          <label className="input-label">🔍 Search Companies</label>
          <input className="input" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 20, width: "fit-content" }}>
        {["all", "approved", "pending", "suspended"].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: "var(--rose)", color: "white", borderRadius: "50%", padding: "0 5px", fontSize: 10 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--text-muted)" }}>No companies found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gradient-main)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {c.logo || c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.email} {c.phone ? `· ${c.phone}` : ""}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      📍 {c.city || "—"} · Joined {c.created_at ? new Date(c.created_at).toLocaleDateString("en-PK") : "—"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {c.verified && <span className="badge badge-teal">✅ Verified</span>}
                  <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    { label: "Tours", value: c.total_tours },
                    { label: "Bookings", value: c.total_bookings },
                    { label: "Revenue", value: c.total_revenue > 0 ? formatPKR(c.total_revenue) : "—" },
                    { label: "Rating", value: c.rating > 0 ? `⭐ ${c.rating}` : "—" },
                  ].map(r => (
                    <div key={r.label}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.label}</div>
                      <div style={{ fontWeight: 700, color: "var(--teal)" }}>{r.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm">View Details</button>
                  {c.status === "pending" && <>
                    <button
                      className="btn btn-sm"
                      style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" }}
                      onClick={() => handleApprove(c.id)}
                      disabled={actionId === c.id}
                    >
                      {actionId === c.id ? "..." : "✅ Approve"}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(c.id)} disabled={actionId === c.id}>❌ Reject</button>
                  </>}
                  {c.status === "approved" && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(c.id)} disabled={actionId === c.id}>
                      {actionId === c.id ? "..." : "🚫 Suspend"}
                    </button>
                  )}
                  {c.status === "suspended" && (
                    <button
                      className="btn btn-sm"
                      style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" }}
                      onClick={() => handleApprove(c.id)}
                      disabled={actionId === c.id}
                    >
                      {actionId === c.id ? "..." : "✅ Restore"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
