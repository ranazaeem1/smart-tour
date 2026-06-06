"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingSuccessModal } from "@/components/BookingSuccessModal";
import { useAuth } from "@/components/AuthProvider";
import { createBooking, fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { onlyDigits } from "@/lib/formValidation";
import { getTourImage } from "@/lib/tourImages";
import { AlertCircle, ArrowRight, Calendar, Clock, Compass, FileText, MapPin, Phone, Search, Shield, Star, Users, Wallet, X } from "lucide-react";

const CATEGORIES = ["All", "Adventure", "Trekking", "Cultural", "Family", "Sports"];
const DIFFICULTIES = ["All", "Easy", "Moderate", "Challenging"];

interface Tour {
  id: string;
  company_id?: string;
  title: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  rating: number;
  review_count?: number;
  reviews?: number;
  image_url?: string | null;
  image?: string;
  category: string;
  tags: string[];
  max_group?: number;
  maxGroup?: number;
  difficulty: string;
  highlights: string[];
  safety_score?: number;
  safetyScore?: number;
  featured: boolean;
  available: boolean;
  companies?: { name: string } | null;
  company?: string;
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

export default function ToursPage() {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [bookingTourId, setBookingTourId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingGroup, setBookingGroup] = useState(2);
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedTourTitle, setBookedTourTitle] = useState("");
  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setAllTours((await fetchTours()) as Tour[]);
      } catch (err) {
        console.error("[ToursPage] Load error:", err);
        setAllTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getSafety = (tour: Tour) => tour.safety_score || tour.safetyScore || 80;
  const getGroup = (tour: Tour) => tour.max_group || tour.maxGroup || 10;
  const getReviews = (tour: Tour) => tour.review_count || tour.reviews || 0;
  const getCompany = (tour: Tour) => tour.companies?.name || tour.company || "Tour Company";
  const isPhoneValid = (phone: string) => /^[0-9]{9,15}$/.test(phone.trim());

  const filtered = useMemo(
    () =>
      allTours
        .filter(tour => {
          const matchSearch = `${tour.title} ${tour.destination} ${getCompany(tour)}`.toLowerCase().includes(search.toLowerCase());
          const matchCat = category === "All" || tour.category === category;
          const matchDiff = difficulty === "All" || tour.difficulty === difficulty;
          return matchSearch && matchCat && matchDiff;
        })
        .sort((a, b) => (sortBy === "price" ? a.price - b.price : sortBy === "rating" ? b.rating - a.rating : getReviews(b) - getReviews(a))),
    [allTours, search, category, difficulty, sortBy]
  );

  const handleOpenBooking = (tourId: string) => {
    setBookingTourId(tourId);
    setBookingDate("");
    setBookingGroup(2);
    setBookingPhone(onlyDigits(profile?.phone || ""));
    setBookingNotes("");
    setBookingError(null);
  };

  const handleCloseBooking = useCallback(() => {
    setBookingTourId(null);
    setBookingError(null);
  }, []);

  const handleConfirmBooking = async () => {
    if (!profile) {
      setBookingError("Please login first.");
      return;
    }
    if (!bookingDate) {
      setBookingError("Please select a travel date.");
      return;
    }
    if (!bookingPhone || !isPhoneValid(bookingPhone)) {
      setBookingError("Please enter a valid phone number.");
      return;
    }

    const tour = filtered.find(item => item.id === bookingTourId);
    if (!tour) return;
    if (!tour.company_id) {
      setBookingError("This tour is not linked to a company yet.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
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

      if (result) {
        setBookedTourTitle(tour.title);
        setBookingTourId(null);
        setShowSuccess(true);
      } else {
        setBookingError("Booking failed. Please try again.");
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading tours...</p>
      </div>
    );
  }

  const bookingTour = filtered.find(tour => tour.id === bookingTourId) ?? null;

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Compass size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Discovery Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Browse Tours</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{filtered.length} curated experiences available</p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-end">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search peaks, valleys, or companies..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className="input !rounded-2xl !bg-white font-black" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(item => <option key={item}>{item}</option>)}
            </select>
            <select className="input !rounded-2xl !bg-white font-black" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(item => <option key={item}>{item}</option>)}
            </select>
            <select className="input !rounded-2xl !bg-white font-black" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rating">Top Rated</option>
              <option value="price">Lowest Price</option>
              <option value="reviews">Trending</option>
            </select>
          </div>
        </div>

        <div className="flex w-full overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mt-5">
          {CATEGORIES.map(item => (
            <button key={item} onClick={() => setCategory(item)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === item ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm py-24 text-center">
          <Compass size={42} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-950">No tours found</h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Try broadening your filters.</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }} className="mt-8 btn btn-secondary !rounded-2xl !py-4 !px-7">Clear Filters</button>
        </section>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map(tour => (
            <article key={tour.id} className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 hover:shadow-xl transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
                <div className="relative">
                  <img src={getTourImage(tour)} alt={tour.title} className="h-56 lg:h-full min-h-52 w-full rounded-2xl object-cover border border-slate-100" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/90 text-slate-900 border border-white">{tour.category}</span>
                </div>

                <div className="min-w-0 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 truncate">{getCompany(tour)}</span>
                    <div className="flex items-center gap-1 text-slate-900">
                      <Star size={15} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black">{tour.rating}</span>
                      <span className="text-xs font-bold text-slate-400">({getReviews(tour)})</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-950">{tour.title}</h3>
                  <p className="mt-2 text-xs font-bold text-slate-500 flex items-center gap-2">
                    <MapPin size={13} className="text-emerald-500" />
                    {tour.destination}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <InfoTile icon={Clock} label="Duration" value={`${tour.duration} days`} />
                    <InfoTile icon={Users} label="Group" value={`Max ${getGroup(tour)}`} />
                    <InfoTile icon={Shield} label="Safety" value={`${getSafety(tour)}%`} />
                    <InfoTile icon={Compass} label="Difficulty" value={tour.difficulty} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(tour.highlights || []).slice(0, 3).map(highlight => (
                      <span key={highlight} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-100">{highlight}</span>
                    ))}
                  </div>

                  <div className="mt-auto pt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Per Person</p>
                      <p className="text-2xl font-black text-emerald-600">{formatPKR(tour.price)}</p>
                    </div>
                    <button className="btn btn-emerald !rounded-2xl !py-4 !px-6 flex items-center gap-2" onClick={() => handleOpenBooking(tour.id)}>
                      Reserve <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {bookingTourId && bookingTour && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade" onClick={handleCloseBooking}>
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-[620px] relative z-10" onClick={e => e.stopPropagation()}>
            <button className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-colors text-slate-400" onClick={handleCloseBooking} aria-label="Close booking modal">
              <X size={20} />
            </button>

            <div className="mb-6 pr-10">
              <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">Reservation</span>
              <h2 className="mt-4 text-2xl font-black text-slate-950">{bookingTour.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 font-bold text-sm mt-3">
                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-emerald-500" />{bookingTour.destination}</span>
                <span className="flex items-center gap-1.5"><Clock size={15} className="text-emerald-500" />{bookingTour.duration} days</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Phone size={13} className="text-emerald-500" /> Contact</label>
                  <input className="input !rounded-2xl !bg-white font-black" type="tel" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} placeholder="03XXXXXXXXX" required value={bookingPhone} onChange={e => setBookingPhone(onlyDigits(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Calendar size={13} className="text-emerald-500" /> Date</label>
                  <input className="input !rounded-2xl !bg-white font-black" type="date" min={new Date().toISOString().split("T")[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Users size={13} className="text-emerald-500" /> Group Size</label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <button type="button" onClick={() => setBookingGroup(group => Math.max(1, group - 1))} className="w-12 h-12 rounded-2xl bg-white text-slate-900 font-black text-xl border border-slate-200">-</button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-slate-950">{bookingGroup}</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">People</p>
                  </div>
                  <button type="button" onClick={() => setBookingGroup(group => Math.min(getGroup(bookingTour), group + 1))} className="w-12 h-12 rounded-2xl bg-white text-slate-900 font-black text-xl border border-slate-200">+</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><FileText size={13} className="text-emerald-500" /> Notes</label>
                <textarea className="input !rounded-2xl !bg-white resize-none" rows={2} placeholder="Any dietary, accessibility, or equipment requirements?" value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} />
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Fee</p>
                  <p className="text-3xl font-black text-emerald-400">{formatPKR(bookingTour.price * bookingGroup)}</p>
                </div>
                <Wallet size={28} className="text-white" />
              </div>

              {bookingError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={18} /> {bookingError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="btn btn-secondary flex-1 !py-4 !rounded-2xl font-black uppercase tracking-widest" disabled={bookingLoading} onClick={handleCloseBooking}>Dismiss</button>
                <button className="btn btn-emerald flex-1 !py-4 !rounded-2xl font-black uppercase tracking-widest" disabled={bookingLoading || !bookingDate || !bookingPhone} onClick={handleConfirmBooking}>
                  {bookingLoading ? "Booking..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && <BookingSuccessModal tourTitle={bookedTourTitle} onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
