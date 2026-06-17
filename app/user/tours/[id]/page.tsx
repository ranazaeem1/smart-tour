"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBooking, fetchTourById, getLocalDateInputValue, isPastTravelDate } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { getTourImage } from "@/lib/tourImages";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, Info, MapPin, Mountain, ShieldCheck, Sparkles, Star, Users, Wallet } from "lucide-react";

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingGroup, setBookingGroup] = useState(2);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setTour(await fetchTourById(id));
      } catch (err) {
        console.error("Error loading tour:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading tour...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-fade px-6 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-200">
          <AlertCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Tour Not Found</h2>
          <p className="text-slate-500 font-bold">The journey you are looking for has been moved or archived.</p>
        </div>
        <Link href="/user/tours" className="btn btn-secondary !rounded-2xl !px-8 !py-4 flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Tours
        </Link>
      </div>
    );
  }

  const getSafety = (item: any) => item.safety_score || item.safetyScore || 85;
  const getGroup = (item: any) => item.max_group || item.maxGroup || 10;
  const getReviews = (item: any) => item.review_count || item.reviews || 0;
  const getCompany = (item: any) => item.companies?.name || item.company || "Tour Company";
  const minBookingDate = getLocalDateInputValue();

  const handleBooking = async () => {
    if (!profile) {
      alert("Please login to continue.");
      return;
    }
    if (!bookingDate) {
      alert("Please select a travel date.");
      return;
    }
    if (isPastTravelDate(bookingDate)) {
      alert("Please select today or a future travel date. Previous dates are blocked.");
      return;
    }
    if (!tour.company_id) {
      alert("Tour operator is missing. Please contact support.");
      return;
    }

    setBookingLoading(true);
    try {
      const result = await createBooking({
        tour_id: tour.id,
        user_id: profile.id,
        company_id: tour.company_id,
        group_size: bookingGroup,
        total_price: tour.price * bookingGroup,
        travel_date: bookingDate,
        notes: bookingNotes || undefined,
      });
      if (result) router.push("/user/bookings?success=true");
      else alert("Booking failed. Please retry.");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking interrupted.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <Link href="/user/tours" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors mb-4">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Tours
          </Link>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Mountain size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{tour.category || "Adventure"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950">{tour.title}</h1>
        </div>
        <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
          {tour.difficulty || "Moderate"} Difficulty
        </span>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm">
        <img src={getTourImage(tour)} alt={tour.title} className="h-[320px] md:h-[440px] w-full rounded-2xl object-cover border border-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-3">
            <MapPin size={18} className="text-emerald-500" />
            <span className="text-sm font-black text-slate-800">{tour.destination}</span>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-3">
            <Clock size={18} className="text-emerald-500" />
            <span className="text-sm font-black text-slate-800">{tour.duration} Days</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard label="Rating" value={tour.rating} icon={Star} tone="bg-amber-50 text-amber-500" />
            <StatCard label="Safety" value={`${getSafety(tour)}%`} icon={ShieldCheck} tone="bg-emerald-50 text-emerald-500" />
            <StatCard label="Max Group" value={getGroup(tour)} icon={Users} tone="bg-slate-100 text-slate-900" />
            <StatCard label="Reviews" value={getReviews(tour)} icon={Sparkles} tone="bg-slate-100 text-slate-900" />
          </div>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Mountain size={18} className="text-slate-900" />
              <h2 className="text-xl font-black text-slate-950">Tour Overview</h2>
            </div>
            <p className="text-sm md:text-base font-bold leading-relaxed text-slate-600">
              Join {getCompany(tour)} for a {tour.duration}-day journey through {tour.destination}. This package is designed for a {tour.difficulty?.toLowerCase() || "moderate"} travel style with guided logistics, local experiences, and safety-first planning.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(tour.highlights || ["Panoramic Alpine Views", "Professional Guides", "Authentic Local Cuisine", "Cultural Heritage Sites"]).map((highlight: string) => (
                <div key={highlight} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  <span className="text-sm font-black text-slate-800">{highlight}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm xl:sticky xl:top-28">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Person</p>
                <h3 className="text-3xl font-black text-emerald-600">{formatPKR(tour.price)}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                <Wallet size={24} />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Calendar size={13} /> Date</label>
                <input className="input !rounded-2xl !bg-white font-black" type="date" min={minBookingDate} value={bookingDate} onChange={event => setBookingDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Users size={13} /> Group Size</label>
                <input className="input !rounded-2xl !bg-white font-black" type="number" min={1} max={getGroup(tour)} value={bookingGroup} onChange={event => setBookingGroup(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Info size={13} /> Notes</label>
                <textarea className="input !rounded-2xl !bg-white font-black min-h-[100px]" placeholder="Special requests..." value={bookingNotes} onChange={event => setBookingNotes(event.target.value)} />
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-3xl font-black text-emerald-400">{formatPKR(tour.price * bookingGroup)}</p>
                </div>
                <Wallet size={28} className="text-white" />
              </div>

              <button className="btn btn-emerald w-full !py-5 !rounded-3xl flex items-center justify-center gap-2" disabled={bookingLoading} onClick={handleBooking}>
                {bookingLoading ? <div className="loading-spinner w-5 h-5 border-white" /> : <Sparkles size={18} />}
                <span className="text-xs font-black uppercase tracking-widest">{bookingLoading ? "Booking..." : "Confirm Tour"}</span>
              </button>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed By</p>
            <p className="mt-2 text-base font-black text-slate-950">{getCompany(tour)}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
