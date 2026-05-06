"use client";
import { useEffect, useState } from "react";
import { fetchBookings, updateBookingStatus, fetchCompanyByOwner } from "@/lib/db";
import { BOOKINGS, formatPKR, getStatusColor } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { StartChatButton } from "@/components/shared/StartChatButton";

interface Booking {
  id: string;
  tour_id: string;
  user_id: string;
  company_id: string;
  travel_date?: string;
  date?: string;
  group_size?: number;
  groupSize?: number;
  total_price?: number;
  totalPrice?: number;
  status: string;
  payment_status?: string;
  paymentStatus?: string;
  user_phone?: string;
  tours?: { title: string; destination: string } | null;
  tourTitle?: string;
  profiles?: { full_name: string | null; phone?: string | null; email?: string | null } | null;
  userName?: string;
}

export default function CompanyBookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (profile?.id) {
          const company = await fetchCompanyByOwner(profile.id);
          let data: Booking[] = [];
          if (company?.id) {
            setCompanyId(company.id);
            const raw = await fetchBookings({ companyId: company.id });
            data = raw as unknown as Booking[];
          }
          setBookings(data.length > 0 ? data : (BOOKINGS as unknown as Booking[]));
        }
      } catch (err) {
        console.error("[CompanyBookings] Load error:", err);
        setError("Failed to load bookings. Showing sample data.");
        setBookings(BOOKINGS as unknown as Booking[]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  // Helper getters
  const getTitle = (b: Booking) => b.tours?.title || b.tourTitle || "—";
  const getDate = (b: Booking) => b.travel_date || b.date || "—";
  const getGroup = (b: Booking) => b.group_size || b.groupSize || 0;
  const getPrice = (b: Booking) => b.total_price || b.totalPrice || 0;
  const getPayment = (b: Booking) => b.payment_status || b.paymentStatus || "pending";
  const getName = (b: Booking) => b.profiles?.full_name || b.userName || "—";
  const getPhone = (b: Booking) => b.user_phone || b.profiles?.phone || null;
  const getEmail = (b: Booking) => b.profiles?.email || null;

  const handleConfirm = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, "confirmed");
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: "confirmed", payment_status: "paid" } : b)
      );
    } catch (err) {
      console.error("[handleConfirm]", err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, "cancelled");
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b)
      );
    } catch (err) {
      console.error("[handleCancel]", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings
    .filter(b => {
      if (filter === "all") return b.status !== "cancelled";
      if (filter === "cancelled") return b.status === "cancelled";
      return b.status === filter;
    })
    .filter(b => {
      if (!search) return true;
      return (
        getName(b).toLowerCase().includes(search.toLowerCase()) ||
        getTitle(b).toLowerCase().includes(search.toLowerCase()) ||
        (getPhone(b) || "").includes(search)
      );
    });

  const activeBookingsCount = bookings.filter(b => b.status !== 'cancelled').length;
  const cancelledBookingsCount = bookings.filter(b => b.status === 'cancelled').length;

  const stats = [
    { label: "Active", value: activeBookingsCount, color: "var(--teal)", icon: "📋" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "var(--emerald)", icon: "✅" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "var(--gold)", icon: "⏳" },
    { label: "Cancelled", value: cancelledBookingsCount, color: "var(--rose)", icon: "❌" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div className="text-[13px] text-white/50 mb-1">Company Panel</div>
          <h1 className="text-2xl font-bold text-white">📋 Bookings Management</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{bookings.length} Total Bookings</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning mb-5">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/50">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-5 items-start md:items-end">
        <div className="w-full md:w-auto flex-1">
          <label className="block text-xs text-white/50 mb-1">🔍 Search by customer, tour, or phone</label>
          <input
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Name, tour, or phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
            <button
              key={f}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white" : "bg-white/[0.06] border border-white/10 text-white/50 hover:text-white"}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Active' : f}
              {f === 'cancelled' && <span className="ml-2 text-xs opacity-70">({cancelledBookingsCount})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-white/50 bg-white/5 rounded-xl border border-white/10">
            📭 No bookings found
          </div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold text-white">{getName(b)}</div>
                  {getPhone(b) && (
                    <a href={`tel:${getPhone(b)}`} className="text-blue-400 text-xs font-mono block mt-1">📞 {getPhone(b)}</a>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-md inline-block ${b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.status}</div>
                </div>
              </div>
              <div className="text-sm text-white/70">
                <div>{getTitle(b)}</div>
                <div className="text-xs text-white/50">{getDate(b)} • {getGroup(b)} pax</div>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <div className="font-bold text-teal-400">{formatPKR(getPrice(b))}</div>
                <div className="flex gap-2">
                  {companyId && (
                    <StartChatButton bookingId={b.id} userId={b.user_id} companyId={companyId} otherPartyName={getName(b)} currentRole="company" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">📞 Phone</th>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">Date & Group</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-white/50">
                  📭 No bookings found
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-teal-400 text-xs">
                    #{b.id.substring(0, 6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{getName(b)}</div>
                    {getEmail(b) && <div className="text-xs text-white/50">{getEmail(b)}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {getPhone(b) ? (
                      <a href={`tel:${getPhone(b)}`} className="text-blue-400 font-mono text-xs hover:text-blue-300">
                        {getPhone(b)}
                      </a>
                    ) : (
                      <span className="text-white/30 text-xs italic">No phone</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{getTitle(b)}</td>
                  <td className="px-4 py-3 text-white/70 text-xs">
                    {getDate(b)} <br />
                    <span className="text-white/50">{getGroup(b)} pax</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-teal-400">{formatPKR(getPrice(b))}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold text-center ${b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{b.status}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold text-center ${getPayment(b) === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{getPayment(b)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap items-center">
                      {companyId && (
                        <StartChatButton bookingId={b.id} userId={b.user_id} companyId={companyId} otherPartyName={getName(b)} currentRole="company" />
                      )}
                      {b.status === "pending" && (
                        <>
                          <button className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => handleConfirm(b.id)} disabled={updatingId === b.id}>
                            {updatingId === b.id ? "..." : "✅ Confirm"}
                          </button>
                          <button className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 border border-red-500/20" onClick={() => handleCancel(b.id)} disabled={updatingId === b.id}>
                            {updatingId === b.id ? "..." : "❌ Cancel"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
