"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fetchCompanyByOwner, updateBookingStatus } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Check, 
  X, 
  Activity,
  ArrowRight
} from "lucide-react";

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
      const company = await fetchCompanyByOwner(profile.id);
      if (company) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:user_id (full_name, phone),
            tours:tour_id (title, destination)
          `)
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      }
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
      const result = await updateBookingStatus(id, status as any);
      if (result) load();
    } catch (err) {
      console.error("Status update error:", err);
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
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Accessing Operations Ledger...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Operations Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-emerald inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border">
              <Activity size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Command</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Bookings Ledger
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Manage traveler reservations and mission deployments.</p>
          </div>

          <div className="flex gap-12">
            <div className="text-right">
              <p className="panel-hero-stat-label text-[10px] font-black uppercase tracking-widest mb-2">Pending Action</p>
              <p className="panel-hero-stat-value-amber text-3xl font-black tracking-tighter">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="text-right">
              <p className="panel-hero-stat-label text-[10px] font-black uppercase tracking-widest mb-2">Active Trips</p>
              <p className="panel-hero-stat-value-emerald text-3xl font-black tracking-tighter">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Controls ── */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex bg-[var(--muted)] p-1.5 rounded-[var(--radius-lg)] border border-[var(--border)] w-full lg:w-auto overflow-x-auto">
          {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 lg:flex-none px-6 py-3 rounded-[var(--radius-md)] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f ? "bg-[var(--card)] text-[var(--foreground)] shadow-lg" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-md group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search traveler or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-12 !py-4 font-black"
          />
        </div>
      </div>

      {/* ── Bookings List ── */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <section className="card-premium py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--muted)] rounded-[32px] flex items-center justify-center text-[var(--muted-foreground)] mb-8 shadow-inner border border-[var(--border)]">
              <ClipboardList size={40} />
            </div>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight">Zero Records</h2>
            <p className="text-[var(--muted-foreground)] font-medium max-w-xs mx-auto leading-relaxed uppercase text-[10px] tracking-widest">
              No reservations matched your current filter parameters.
            </p>
          </section>
        ) : (
          filtered.map((booking, idx) => (
            <article 
              key={booking.id} 
              className="card-premium !p-0 overflow-hidden flex border border-[var(--border)] group hover:shadow-2xl transition-all duration-500 animate-fade"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`w-2 shrink-0 ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'pending' ? 'bg-amber-500' : 'bg-[var(--muted)]'}`} />
              
              <div className="flex-1 p-8 md:p-10 flex flex-col lg:flex-row items-center gap-10">
                {/* ID & Status */}
                <div className="w-full lg:w-32 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className={`badge ${getStatusColor(booking.status)} !px-4 !py-1.5 !rounded-lg !text-[9px] !font-black !uppercase !tracking-widest mb-3 w-full text-center`}>
                    {booking.status}
                  </span>
                  <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest font-mono">#{booking.id.slice(0,8)}</p>
                </div>

                {/* Traveler */}
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Traveler</p>
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] border border-[var(--border)]">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-black text-[var(--foreground)] truncate m-0 leading-tight">{booking.profiles?.full_name}</h4>
                      <p className="text-xs font-bold text-emerald-500 mt-1">{booking.profiles?.phone || "Private Contact"}</p>
                    </div>
                  </div>
                </div>

                {/* Expedition */}
                <div className="flex-[1.5] min-w-0 text-center lg:text-left">
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Mission</p>
                  <h4 className="text-base font-black text-[var(--foreground)] truncate m-0 mb-3">{booking.tours?.title}</h4>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Calendar size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{new Date(booking.travel_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Users size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{booking.group_size} Personnel</span>
                    </div>
                  </div>
                </div>

                {/* Financials */}
                <div className="w-full lg:w-44 text-center lg:text-right">
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Revenue</p>
                  <p className="text-2xl font-black text-emerald-500 tracking-tighter">{formatPKR(booking.total_price)}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${booking.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {booking.payment_status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        aria-label="Confirm Booking"
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        className="w-12 h-12 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        aria-label="Reject Booking"
                      >
                        <X size={20} />
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
            </article>
          ))
        )}
      </div>
    </div>
  );
}
