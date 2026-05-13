"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchTours, createBooking } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { BookingSuccessModal } from "@/components/BookingSuccessModal";
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Shield, 
  ArrowRight, 
  Calendar, 
  Phone, 
  FileText,
  X,
  Compass,
  AlertCircle
} from "lucide-react";

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
        const data = await fetchTours();
        setAllTours(data as Tour[]);
      } catch (err) {
        console.error("[ToursPage] Load error:", err);
        setAllTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getImg = (t: Tour) => t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
  const getSafety = (t: Tour) => t.safety_score || t.safetyScore || 80;
  const getGroup = (t: Tour) => t.max_group || t.maxGroup || 10;
  const getReviews = (t: Tour) => t.review_count || t.reviews || 0;
  const getCompany = (t: Tour) => t.companies?.name || t.company || "—";

  const filtered = allTours
    .filter(t => {
      const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.destination?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      const matchDiff = difficulty === "All" || t.difficulty === difficulty;
      return matchSearch && matchCat && matchDiff;
    })
    .sort((a, b) =>
      sortBy === "price"
        ? a.price - b.price
        : sortBy === "rating"
        ? b.rating - a.rating
        : getReviews(b) - getReviews(a)
    );

  const isPhoneValid = (phone: string) => /^\+?[\d\s\-(]{9,16}$/.test(phone.trim());

  const handleOpenBooking = (tourId: string) => {
    setBookingTourId(tourId);
    setBookingDate("");
    setBookingGroup(2);
    setBookingPhone(profile?.phone || "");
    setBookingNotes("");
    setBookingError(null);
  };

  const handleCloseBooking = useCallback(() => {
    setBookingTourId(null);
    setBookingError(null);
  }, []);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const handleConfirmBooking = async () => {
    if (!profile) { setBookingError("Please login first."); return; }
    if (!bookingDate) { setBookingError("Please select a travel date."); return; }
    if (!bookingPhone || !isPhoneValid(bookingPhone)) { setBookingError("Please enter a valid phone number."); return; }

    const tour = filtered.find(t => t.id === bookingTourId);
    if (!tour) return;
    if (!tour.company_id) { setBookingError("This tour is not linked to a company yet."); return; }

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

  if (loading)
    return (
      <div className="space-y-10 animate-fade">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-12 w-64 rounded-2xl" />
          </div>
        </div>
        <div className="card-premium h-32 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card h-[500px] skeleton rounded-[32px]" />
          ))}
        </div>
      </div>
    );

  const bookingTour = filtered.find(t => t.id === bookingTourId) ?? null;

  return (
    <div className="animate-fade space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">Discovery Hub</p>
          <h1 className="m-0 tracking-tight">Explore the Peaks</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[11px] tracking-widest">{filtered.length} curated experiences available</p>
        </div>
      </div>

      <div className="card-premium p-8 bg-white/40 backdrop-blur-2xl border-white/20 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              className="input !pl-16 !py-5 !bg-white/60 !rounded-[24px] !text-lg !font-bold"
              placeholder="Where to next? Search peaks, valleys, or companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <div className="flex flex-col min-w-[140px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category</span>
              <select className="input !bg-white/60 !py-3 !rounded-xl !text-sm !font-black" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Difficulty</span>
              <select className="input !bg-white/60 !py-3 !rounded-xl !text-sm !font-black" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sort Grid</span>
              <select className="input !bg-white/60 !py-3 !rounded-xl !text-sm !font-black" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Top Rated</option>
                <option value="price">Lowest Price</option>
                <option value="reviews">Trending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4 overflow-x-auto scrollbar-hide custom-scrollbar">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-8 py-3.5 rounded-[18px] text-[13px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
              category === c 
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.05]' 
                : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card py-32 flex flex-col items-center animate-fade">
          <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 shadow-inner ring-1 ring-slate-100">
            <Compass size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No expeditions found</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto text-center">
            We couldn't find any tours matching your criteria. Try broadening your search or switching categories.
          </p>
          <button onClick={() => {setSearch(""); setCategory("All"); setDifficulty("All");}} className="mt-10 btn btn-secondary px-8 py-4">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map(tour => (
            <div
              key={tour.id}
              className="group card-premium p-0 flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-700 bg-white"
            >
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={getImg(tour)}
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-4 py-2 bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl ring-1 ring-white/20">
                    {tour.category}
                  </span>
                  <span className={`px-4 py-2 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl ring-1 ring-white/20 ${
                    tour.difficulty === 'Challenging' ? 'bg-rose-500/80' : 
                    tour.difficulty === 'Moderate' ? 'bg-amber-500/80' : 'bg-emerald-500/80'
                  }`}>
                    {tour.difficulty}
                  </span>
                </div>
                
                <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-xl rounded-[18px] px-4 py-2.5 flex items-center gap-2 shadow-2xl border border-white/10">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-white text-[13px] font-black">{tour.rating}</span>
                  <span className="text-slate-500 text-[11px] font-bold">({getReviews(tour)})</span>
                </div>

                <div className="absolute bottom-6 right-6">
                  <div className="px-4 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center gap-2 shadow-xl border border-slate-100">
                    <Shield size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Safety {getSafety(tour)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-10 flex flex-col flex-1">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                      <Compass size={14} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{getCompany(tour)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[11px] font-black uppercase tracking-tighter">{tour.duration} Days</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">{tour.title}</h3>
                
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[13px] mb-8">
                  <MapPin size={14} className="text-rose-400" />
                  {tour.destination}
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {(tour.highlights || []).slice(0, 3).map(h => (
                    <span key={h} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fee</p>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                      {formatPKR(tour.price)}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Per Person</p>
                  </div>
                  <button
                    className="btn btn-emerald !rounded-[20px] !py-4 !px-8 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                    onClick={() => handleOpenBooking(tour.id)}
                  >
                    Reserve <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingTourId && bookingTour && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade" onClick={handleCloseBooking}>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
          <div className="bg-white border border-gray-100 rounded-[40px] p-12 shadow-2xl w-full max-w-[600px] relative z-10 animate-scale" onClick={e => e.stopPropagation()}>
            <button className="absolute top-10 right-10 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400" onClick={handleCloseBooking}>
              <X size={24} />
            </button>
            
            <div className="mb-10">
              <span className="badge badge-emerald mb-4">Expedition Reservation</span>
              <h2 className="text-4xl font-black text-slate-900 m-0 tracking-tighter leading-none">
                {bookingTour.title}
              </h2>
              <div className="flex items-center gap-3 text-slate-500 font-bold text-sm mt-4">
                <MapPin size={16} className="text-rose-400" />
                {bookingTour.destination}
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />
                <Clock size={16} />
                {bookingTour.duration} Days
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="input-group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500" /> Contact Number *
                  </label>
                  <input
                    className="input font-black !py-4 !rounded-2xl"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    required
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" /> Departure Date *
                  </label>
                  <input
                    className="input font-black !py-4 !rounded-2xl appearance-none"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Users size={14} className="text-emerald-500" /> Expedition Size
                </label>
                <div className="flex items-center gap-8 bg-slate-50 p-3 rounded-[24px] border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookingGroup(g => Math.max(1, g - 1))}
                    className="w-14 h-14 rounded-2xl bg-white text-slate-900 font-black text-2xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 shadow-sm border border-slate-200 transition-all active:scale-90"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-slate-900">
                      {bookingGroup}
                    </span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Person(s)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingGroup(g => Math.min(getGroup(bookingTour), g + 1))}
                    className="w-14 h-14 rounded-2xl bg-white text-slate-900 font-black text-2xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 shadow-sm border border-slate-200 transition-all active:scale-90"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center opacity-60">Maximum capacity for this expedition: {getGroup(bookingTour)}</p>
              </div>

              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <FileText size={14} className="text-emerald-500" /> Alpine Requirements
                </label>
                <textarea
                  className="input !rounded-[24px] !py-5 resize-none"
                  rows={2}
                  placeholder="Any dietary needs, accessibility, or equipment requirements?"
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                />
              </div>

              <div className="p-8 bg-slate-900 rounded-[32px] flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Expedition Fee</p>
                  <div className="text-4xl font-black text-emerald-400 tracking-tighter leading-none">
                    {formatPKR(bookingTour.price * bookingGroup)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Secure via</div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-white font-black text-[11px] uppercase tracking-widest inline-block">Direct Payment</div>
                </div>
              </div>

              {bookingError && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-rose-600 text-sm font-bold flex items-center gap-3 animate-fade">
                  <AlertCircle size={20} /> {bookingError}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  className="btn btn-secondary flex-1 py-5 !rounded-2xl font-black uppercase tracking-widest"
                  disabled={bookingLoading}
                  onClick={handleCloseBooking}
                >
                  Dismiss
                </button>
                <button
                  className="btn btn-emerald flex-1 py-5 !rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 group"
                  disabled={bookingLoading || !bookingDate || !bookingPhone}
                  onClick={handleConfirmBooking}
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="loading-spinner w-5 h-5 border-white" />
                      Syncing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      Complete Reservation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <BookingSuccessModal tourTitle={bookedTourTitle} onClose={handleCloseSuccess} />
      )}
    </div>
  );
}
