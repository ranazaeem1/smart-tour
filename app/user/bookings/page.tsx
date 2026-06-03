"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { CancelBookingButton } from "@/components/user/CancelBookingButton";
import { StartChatButton } from "@/components/shared/StartChatButton";
import { ReviewModal } from "@/components/user/ReviewModal";
import { getTourImage } from "@/lib/tourImages";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Compass, 
  Star, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";

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
    companies?: { name: string }
  } | null;
}

export default function BookingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
    return () => { mounted = false; };
  }, [profile, authLoading]);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Retrieving Itinerary...</p>
    </div>
  );

  const getCompanyName = (b: Booking) => b.tours?.companies?.name || "Tour Company";

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <span className="badge badge-emerald"><CheckCircle2 size={12} className="mr-1.5" /> Confirmed</span>;
      case 'pending': return <span className="badge badge-amber"><Clock size={12} className="mr-1.5" /> Pending</span>;
      case 'completed': return <span className="badge badge-slate"><CheckCircle2 size={12} className="mr-1.5" /> Completed</span>;
      case 'cancelled': return <span className="badge badge-rose"><AlertCircle size={12} className="mr-1.5" /> Cancelled</span>;
      default: return <span className="badge badge-slate">{status}</span>;
    }
  };

  return (
    <div className="animate-fade space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-2">Adventure Archive</p>
          <h1 className="m-0 !text-white">My Bookings</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Trips</p>
            <p className="text-3xl font-black text-white leading-none">{bookings.length}</p>
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div className="text-right">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Confirmed</p>
            <p className="text-3xl font-black text-emerald-500 leading-none">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>
      </div>

      {/* Filter Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-zinc-900/50 backdrop-blur-md rounded-[20px] w-fit border border-white/5">
        {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-3 rounded-[14px] text-[13px] font-black uppercase tracking-widest transition-all duration-500 ${
              filter === f 
                ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-24 flex flex-col items-center">
          <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center text-zinc-700 mb-8 shadow-inner ring-1 ring-white/5">
            <Compass size={48} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No expeditions found</h2>
          <p className="text-zinc-400 mb-10 max-w-md mx-auto font-medium">
            {filter === 'all' 
              ? "Your itinerary is currently clear. Discover breathtaking destinations and start your next legendary journey today."
              : `You have no ${filter} bookings at this moment.`}
          </p>
          <Link href="/user/tours" className="btn btn-emerald py-4 px-10">
            Browse Experiences <ChevronRight size={18} className="ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filtered.map((booking) => (
            <div key={booking.id} className="card !p-0 overflow-hidden flex flex-col lg:flex-row gap-0 hover:border-emerald-500/30 transition-all duration-500 group">
              {/* IMAGE SECTION */}
              <div className="relative w-full lg:w-[400px] h-[300px] lg:h-auto overflow-hidden">
                <img 
                  src={getTourImage(booking.tours || {})} 
                  alt={booking.tours?.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-black/80 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 shadow-2xl">
                    <MapPin size={12} className="inline mr-1.5" />
                    {booking.tours?.destination || "Expedition"}
                  </span>
                </div>
              </div>

              {/* INFO SECTION */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ID: {booking.id.slice(0, 8)}</p>
                      <h3 className="text-3xl font-black text-white m-0 tracking-tight group-hover:text-emerald-500 transition-colors">{booking.tours?.title}</h3>
                      <p className="text-zinc-400 text-sm font-bold mt-1 flex items-center gap-2">
                        by <span className="text-emerald-500">{getCompanyName(booking)}</span>
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 my-8 bg-white/5 p-6 md:p-8 rounded-[24px] border border-white/5">
                    <div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Departure</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                          <Calendar size={16} />
                        </div>
                        <p className="text-white font-black text-sm">
                          {new Date(booking.travel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Size</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                          <Users size={16} />
                        </div>
                        <p className="text-white font-black text-sm">
                          {booking.group_size} Pax
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Payment</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                          <CreditCard size={16} />
                        </div>
                        <p className="text-white font-black text-sm capitalize">
                          {booking.payment_status || "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Investment</p>
                    <p className="text-4xl font-black text-emerald-500 tracking-tighter">{formatPKR(booking.total_price)}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 w-full sm:w-auto justify-end">
                    {profile && (booking.company_id || booking.tours?.company_id) && (
                      <StartChatButton
                        bookingId={booking.id}
                        userId={profile.id}
                        companyId={booking.company_id || booking.tours?.company_id || ""}
                        otherPartyName={getCompanyName(booking)}
                        currentRole="user"
                      />
                    )}
                    
                    {(booking.status === "completed" || booking.status === "confirmed") && (
                      <button 
                        onClick={() => setReviewBooking({ id: booking.id, tourId: booking.tour_id })} 
                        className="btn btn-secondary !px-6 py-4 flex items-center gap-2"
                      >
                        <Star size={18} /> Rate
                      </button>
                    )}
                    
                    {booking.status === "pending" && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal 
          bookingId={reviewBooking.id} 
          tourId={reviewBooking.tourId} 
          onClose={() => setReviewBooking(null)} 
        />
      )}
    </div>
  );
}
