"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { CancelBookingButton } from "@/components/user/CancelBookingButton";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { ReviewModal } from "@/components/user/ReviewModal";
import { getTourImage } from "@/lib/tourImages";
import { AlertCircle, Calendar, CheckCircle2, Clock, Compass, CreditCard, MapPin, Search, Star, Users, Wallet } from "lucide-react";

interface Booking {
  id: string;
  tour_id: string;
  user_id: string;
  company_id: string;
  travel_date: string;
  group_size: number;
  total_price: number;
  status: string;
  payment_status: string;
  tours?: {
    title: string;
    destination: string;
    image_url?: string | null;
    company_id?: string;
    companies?: { name: string };
  } | null;
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

function InfoTile({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
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

export default function BookingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewBooking, setReviewBooking] = useState<{ id: string; tourId: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (profile?.id) {
          const data = await fetchBookings({ userId: profile.id });
          if (mounted) setBookings(data as unknown as Booking[]);
        }
      } catch (err) {
        console.error("[Bookings] Load failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (!profile && !authLoading) setLoading(false);
    else load();
    return () => {
      mounted = false;
    };
  }, [profile, authLoading]);

  const filtered = useMemo(
    () =>
      bookings.filter(booking => {
        const text = `${booking.tours?.title || ""} ${booking.tours?.destination || ""} ${booking.id}`.toLowerCase();
        return (filter === "all" || booking.status === filter) && text.includes(search.toLowerCase());
      }),
    [bookings, filter, search]
  );

  const getCompanyName = (booking: Booking) => booking.tours?.companies?.name || "Tour Company";
  const totalValue = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Calendar size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Adventure Archive</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">My Bookings</h1>
        </div>

        <div className="relative w-full xl:w-96">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search tour, destination, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Trips" value={bookings.length} icon={Compass} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Confirmed" value={bookings.filter(b => b.status === "confirmed").length} icon={CheckCircle2} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Pending" value={bookings.filter(b => b.status === "pending").length} icon={Clock} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Total Value" value={formatPKR(totalValue)} icon={Wallet} tone="bg-rose-50 text-rose-500" />
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
            <Compass size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No bookings found</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Your trips will appear here after booking.</p>
            <Link href="/user/tours" className="mt-8 inline-flex btn btn-emerald !rounded-2xl !py-4 !px-7">Browse Tours</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 hover:shadow-xl transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_auto] gap-5 items-center">
                  <img src={getTourImage(booking.tours || {})} alt={booking.tours?.title || "Tour"} className="h-40 lg:h-32 w-full rounded-2xl object-cover border border-slate-100" />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusClass(booking.status)}`}>{booking.status}</span>
                      <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">#{booking.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 truncate">{booking.tours?.title || "Tour package"}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      by <span className="text-emerald-600">{getCompanyName(booking)}</span>
                    </p>

                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
                      <InfoTile icon={MapPin} label="Destination" value={booking.tours?.destination || "Destination"} />
                      <InfoTile icon={Calendar} label="Departure" value={new Date(booking.travel_date).toLocaleDateString()} />
                      <InfoTile icon={Users} label="Group" value={`${booking.group_size} people`} />
                      <InfoTile icon={CreditCard} label="Payment" value={booking.payment_status || "pending"} />
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-3 justify-between lg:justify-center lg:items-end">
                    <div className="text-left lg:text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</p>
                      <p className="text-2xl font-black text-emerald-600">{formatPKR(booking.total_price)}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {profile && (booking.company_id || booking.tours?.company_id) && (
                        <StartChatButton bookingId={booking.id} userId={profile.id} companyId={booking.company_id || booking.tours?.company_id || ""} otherPartyName={getCompanyName(booking)} currentRole="user" />
                      )}
                      {(booking.status === "completed" || booking.status === "confirmed") && (
                        <button onClick={() => setReviewBooking({ id: booking.id, tourId: booking.tour_id })} className="btn btn-secondary !px-5 !py-3 !rounded-2xl flex items-center gap-2">
                          <Star size={16} /> Rate
                        </button>
                      )}
                      {booking.status === "pending" && (
                        <CancelBookingButton
                          bookingId={booking.id}
                          onCancelled={() => setBookings(prev => prev.map(item => (item.id === booking.id ? { ...item, status: "cancelled" } : item)))}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {reviewBooking && <ReviewModal bookingId={reviewBooking.id} tourId={reviewBooking.tourId} onClose={() => setReviewBooking(null)} />}
    </div>
  );
}
