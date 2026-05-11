"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatPKR, getStatusColor } from "@/lib/data";
import { StartChatButton } from "@/components/shared/StartChatButton";
import Link from "next/link";

interface CompanyBooking {
  id: string;
  tour_id: string;
  user_id: string;
  travel_date: string;
  group_size: number;
  total_price: number;
  status: string;
  payment_status: string;
  profiles?: { full_name: string; phone: string } | null;
  tours?: { title: string; destination: string } | null;
}

export default function CompanyBookingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<CompanyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  async function load() {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const targetId = profile.company_id || profile.id;
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (full_name, phone),
          tours:tour_id (title, destination)
        `)
        .eq('company_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load company bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) load();
  }, [profile, authLoading]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      // Refresh list
      load();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update booking status.");
    }
  };

  const filtered = bookings.filter(b => {
    const matchesFilter = filter === "all" ? true : b.status === filter;
    const matchesSearch = search === "" ? true : 
      b.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.tours?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading || authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade" style={{ padding: "0 20px 60px" }}>
      {/* Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>Operations</p>
          <h1 className="topbar-title" style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>Bookings Management</h1>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pending Action</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--gold)", margin: 0 }}>
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Active Trips</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "var(--emerald)", margin: 0 }}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginBottom: 32, gap: 20, flexWrap: "wrap" 
      }}>
        <div style={{ display: "flex", gap: 8, padding: 4, borderRadius: 16, background: "rgba(255,255,255,0.03)", width: "fit-content" }}>
          {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.3s", textTransform: "capitalize",
                background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-secondary)"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <input 
            type="text" 
            placeholder="Search by customer or tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 14, outline: "none"
            }}
          />
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: 80, borderRadius: 24 }}>
            <p style={{ color: "var(--text-secondary)" }}>No bookings found matching your criteria.</p>
          </div>
        ) : (
          filtered.map(booking => (
            <div key={booking.id} className="glass-card" style={{ 
              padding: "24px 32px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", gap: 40
            }}>
              {/* Status & ID */}
              <div style={{ width: 120 }}>
                <span className={`badge ${getStatusColor(booking.status)}`} style={{ fontSize: 10, display: "block", textAlign: "center", marginBottom: 8 }}>
                  {booking.status}
                </span>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", fontFamily: "monospace" }}>#{booking.id.slice(0,8)}</p>
              </div>

              {/* Customer Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>Customer</p>
                <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{booking.profiles?.full_name}</h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{booking.profiles?.phone || "No phone provided"}</p>
              </div>

              {/* Tour Details */}
              <div style={{ flex: 1.5 }}>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>Trip Details</p>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{booking.tours?.title}</h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {new Date(booking.travel_date).toLocaleDateString()} • {booking.group_size} Person
                </p>
              </div>

              {/* Financials */}
              <div style={{ width: 150, textAlign: "right" }}>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>Revenue</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)", margin: 0 }}>{formatPKR(booking.total_price)}</p>
                <p style={{ fontSize: 11, color: booking.payment_status === 'paid' ? 'var(--emerald)' : 'var(--gold)', fontWeight: 600, marginTop: 2 }}>
                  {booking.payment_status.toUpperCase()}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {booking.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ background: "var(--emerald)", border: "none" }}
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                    >
                      Confirm
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: "var(--rose)" }}
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                    >
                      Reject
                    </button>
                  </>
                )}
                {profile && (
                  <StartChatButton 
                    bookingId={booking.id}
                    userId={booking.user_id}
                    companyId={profile.id}
                    otherPartyName={booking.profiles?.full_name || "Traveler"}
                    currentRole="company"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
