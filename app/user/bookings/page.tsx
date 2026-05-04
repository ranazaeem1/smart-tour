"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, updateBookingStatus } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";

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
  notes?: string | null;
  tours?: { title: string; destination: string; image_url?: string | null } | null;
  tourTitle?: string;
  destination?: string;
  companyName?: string;
}

export default function BookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (profile) {
        const data = await fetchBookings({ userId: profile.id });
        setBookings(data as Booking[]);
      } else {
        setBookings([]);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  const getTitle = (b: Booking) => b.tours?.title || (b as unknown as { tourTitle?: string }).tourTitle || "—";
  const getDest = (b: Booking) => b.tours?.destination || (b as unknown as { destination?: string }).destination || "—";
  const getDate = (b: Booking) => b.travel_date || (b as unknown as { date?: string }).date || "—";
  const getGroup = (b: Booking) => b.group_size || (b as unknown as { groupSize?: number }).groupSize || 0;
  const getPrice = (b: Booking) => b.total_price || (b as unknown as { totalPrice?: number }).totalPrice || 0;
  const getPayment = (b: Booking) => b.payment_status || (b as unknown as { paymentStatus?: string }).paymentStatus || "pending";

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelId(id);
    await updateBookingStatus(id, "cancelled");
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    setCancelId(null);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  const stats = [
    { label: "Total Bookings", value: bookings.length, color: "var(--teal)", icon: "📋" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "var(--emerald)", icon: "✅" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "var(--gold)", icon: "⏳" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "var(--purple-light)", icon: "🏁" },
  ];

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>My Travel</div>
          <h1 className="topbar-title">📋 My Bookings</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{bookings.length} Bookings</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 24, width: "fit-content" }}>
        {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No {filter !== "all" ? filter : ""} bookings found</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {filter === "all" ? "Start exploring tours to make your first booking!" : `No ${filter} bookings at the moment.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gradient-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏔️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{getTitle(b)}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>📍 {getDest(b)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span>
                  <span className={`badge ${getStatusColor(getPayment(b))}`}>{getPayment(b)}</span>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { label: "Travel Date", value: getDate(b) },
                  { label: "Group Size", value: `${getGroup(b)} people` },
                  { label: "Total Paid", value: formatPKR(getPrice(b)) },
                  { label: "Booking ID", value: `#${b.id.substring(0, 6).toUpperCase()}` },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.value}</div>
                  </div>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert("Invoice download coming soon!")}>📄 Invoice</button>
                  {b.status === "completed" && <Link href="/user/reviews" className="btn btn-secondary btn-sm">⭐ Review</Link>}
                  {b.status === "pending" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelId === b.id}
                    >
                      {cancelId === b.id ? "Cancelling..." : "❌ Cancel"}
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
