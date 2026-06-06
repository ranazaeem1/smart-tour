"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { fetchCompanyByOwner, updateBookingStatus } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { formatPKR } from "@/lib/data";
import { Calendar, Check, ClipboardList, CreditCard, MapPin, Search, User, Users, Wallet, X } from "lucide-react";

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

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : tone.includes("rose") ? "bg-rose-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <Icon size={15} className="text-emerald-500 mb-3" />
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800 truncate">{value}</p>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "confirmed" || status === "completed") return "bg-emerald-50 text-emerald-600 border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-600 border-amber-200";
  if (status === "cancelled") return "bg-rose-50 text-rose-500 border-rose-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
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
      if (!company) return;
      const { data, error } = await supabase
        .from("bookings")
        .select("*, profiles:user_id (full_name, phone), tours:tour_id (title, destination)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
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
      const result = await updateBookingStatus(id, status as any);
      if (result) {
        load();
      } else {
        alert("Booking status could not be changed. It may already have been updated.");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const filtered = useMemo(
    () =>
      bookings.filter(booking => {
        const text = `${booking.profiles?.full_name || ""} ${booking.tours?.title || ""} ${booking.tours?.destination || ""}`.toLowerCase();
        return (filter === "all" || booking.status === filter) && text.includes(search.toLowerCase());
      }),
    [bookings, filter, search]
  );

  const revenue = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <ClipboardList size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operations Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Bookings</h1>
        </div>

        <div className="relative w-full xl:w-96">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search traveler, tour, destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Bookings" value={bookings.length} icon={ClipboardList} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Pending" value={bookings.filter(b => b.status === "pending").length} icon={Calendar} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Confirmed" value={bookings.filter(b => b.status === "confirmed").length} icon={Check} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Booking Value" value={formatPKR(revenue)} icon={Wallet} tone="bg-rose-50 text-rose-500" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex w-full overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
          {["all", "confirmed", "pending", "completed", "cancelled"].map(item => (
            <button key={item} onClick={() => setFilter(item)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === item ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"}`}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <ClipboardList size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No bookings found</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Nothing matches the current filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                  <div className="flex items-center gap-4 min-w-0 xl:w-72">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-900">
                      {booking.profiles?.full_name?.charAt(0) || <User size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-950 truncate">{booking.profiles?.full_name || "Traveler"}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{booking.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <div className="min-w-0 xl:flex-1">
                    <h4 className="text-sm font-black text-slate-950 truncate">{booking.tours?.title || "Tour package"}</h4>
                    <p className="mt-1 text-xs font-bold text-slate-500 flex items-center gap-2">
                      <MapPin size={13} className="text-emerald-500" />
                      {booking.tours?.destination || "Destination"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:w-[560px]">
                    <DetailTile icon={Calendar} label="Travel Date" value={new Date(booking.travel_date).toLocaleDateString()} />
                    <DetailTile icon={Users} label="Group" value={`${booking.group_size} people`} />
                    <DetailTile icon={Wallet} label="Revenue" value={formatPKR(booking.total_price || 0)} />
                    <DetailTile icon={CreditCard} label="Payment" value={booking.payment_status || "pending"} />
                  </div>

                  <div className="flex items-center justify-between xl:justify-end gap-3 xl:w-60">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusClass(booking.status)}`}>{booking.status}</span>
                    <div className="flex items-center gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20" onClick={() => handleUpdateStatus(booking.id, "confirmed")} aria-label="Confirm booking">
                            <Check size={17} />
                          </button>
                          <button className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center" onClick={() => handleUpdateStatus(booking.id, "cancelled")} aria-label="Cancel booking">
                            <X size={17} />
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center" onClick={() => handleUpdateStatus(booking.id, "cancelled")} aria-label="Cancel confirmed booking">
                          <X size={17} />
                        </button>
                      )}
                      {profile && <StartChatButton bookingId={booking.id} userId={booking.user_id} companyId={profile.id} otherPartyName={booking.profiles?.full_name || "Traveler"} currentRole="company" />}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
