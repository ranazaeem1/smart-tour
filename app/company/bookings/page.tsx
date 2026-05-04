"use client";
import { useEffect, useState } from "react";
import { fetchBookings, updateBookingStatus } from "@/lib/db";
import { BOOKINGS, formatPKR, getStatusColor } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

interface Booking {
  id: string;
  travel_date?: string;
  date?: string;
  group_size?: number;
  groupSize?: number;
  total_price?: number;
  totalPrice?: number;
  status: string;
  payment_status?: string;
  paymentStatus?: string;
  tours?: { title: string; destination: string } | null;
  tourTitle?: string;
  profiles?: { full_name: string | null; phone?: string | null } | null;
  userName?: string;
}

export default function CompanyBookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchBookings(profile?.id ? { companyId: profile.id } : undefined);
      if (data.length > 0) {
        setBookings(data as Booking[]);
      } else {
        setBookings(BOOKINGS as unknown as Booking[]);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  const getTitle = (b: Booking) => b.tours?.title || (b as { tourTitle?: string }).tourTitle || "—";
  const getDate = (b: Booking) => b.travel_date || (b as { date?: string }).date || "—";
  const getGroup = (b: Booking) => b.group_size || (b as { groupSize?: number }).groupSize || 0;
  const getPrice = (b: Booking) => b.total_price || (b as { totalPrice?: number }).totalPrice || 0;
  const getPayment = (b: Booking) => b.payment_status || (b as { paymentStatus?: string }).paymentStatus || "pending";
  const getName = (b: Booking) => b.profiles?.full_name || (b as { userName?: string }).userName || "—";

  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    await updateBookingStatus(id, "confirmed");
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed", payment_status: "paid" } : b));
    setConfirmingId(null);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    await updateBookingStatus(id, "cancelled");
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  };

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!search) return true;
      return getName(b).toLowerCase().includes(search.toLowerCase()) ||
        getTitle(b).toLowerCase().includes(search.toLowerCase());
    });

  const stats = [
    { label: "Total", value: bookings.length, color: "var(--teal)", icon: "📋" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "var(--emerald)", icon: "✅" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "var(--gold)", icon: "⏳" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "var(--purple-light)", icon: "🏁" },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Company Panel</div>
          <h1 className="topbar-title">📋 Bookings Management</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{bookings.length} Total</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label className="input-label">🔍 Search Bookings</label>
          <input className="input" placeholder="Search by customer or tour..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ alignSelf: "flex-end" }}>
          {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th><th>Customer</th><th>Tour</th><th>Date</th>
                <th>Group</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600, color: "var(--teal)" }}>#{b.id.substring(0, 6).toUpperCase()}</td>
                  <td style={{ fontWeight: 600 }}>{getName(b)}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{getTitle(b)}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{getDate(b)}</td>
                  <td>{getGroup(b)} pax</td>
                  <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(getPrice(b))}</td>
                  <td><span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span></td>
                  <td><span className={`badge ${getStatusColor(getPayment(b))}`}>{getPayment(b)}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {b.status === "pending" && (
                        <button
                          className="btn btn-sm"
                          style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald)", border: "1px solid rgba(16,185,129,0.3)" }}
                          onClick={() => handleConfirm(b.id)}
                          disabled={confirmingId === b.id}
                        >
                          {confirmingId === b.id ? "..." : "✅"}
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => alert("Booking details coming soon!")}>View</button>
                      {b.status === "pending" && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>❌</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
