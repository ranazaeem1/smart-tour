"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { fetchTourById, createBooking } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Star, 
  Users, 
  Wallet, 
  Calendar, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  Zap,
  Mountain
} from "lucide-react";

export default function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
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
        const data = await fetchTourById(id);
        setTour(data);
      } catch (err) {
        console.error("Error loading tour:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Expedition Details...</p>
    </div>
  );

  if (!tour) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-fade px-6 text-center">
      <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center text-rose-500 shadow-inner ring-1 ring-rose-100">
        <AlertCircle size={48} />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Expedition Not Found</h2>
        <p className="text-slate-500 font-medium">The journey you are looking for has been moved or archived.</p>
      </div>
      <Link href="/user/tours" className="btn btn-secondary px-10 py-4 flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Expeditions
      </Link>
    </div>
  );

  const getImg = (t: any) => t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200";
  const getSafety = (t: any) => t.safety_score || t.safetyScore || 85;
  const getGroup = (t: any) => t.max_group || t.maxGroup || 10;
  const getReviews = (t: any) => t.review_count || t.reviews || 0;
  const getCompany = (t: any) => t.companies?.name || t.company || "Elite Expedition Co.";

  const handleBooking = async () => {
    if (!profile) { alert("Security Protocol: Please authenticate to continue."); return; }
    if (!bookingDate) { alert("Input Required: Please select a deployment date."); return; }
    if (!tour.company_id) { alert("System Error: Tour operator coordinates missing. Please contact support."); return; }
    
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
      
      if (result) {
        // Confetti effect would go here
        router.push("/user/bookings?success=true");
      } else {
        alert("Transmission Failed: Unable to synchronize booking. Please retry.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Critical Error: Transaction interrupted.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="animate-fade space-y-10 pb-20">
      {/* Immersive Header */}
      <div className="relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl group">
        <img src={getImg(tour)} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s] ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <Link href="/user/tours" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-widest rounded-2xl border border-white/20 transition-all active:scale-95">
            <ArrowLeft size={16} /> Back to Expeditions
          </Link>
        </div>

        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30">
                  {tour.category || "Adventure"}
                </span>
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                  {tour.difficulty || "Moderate"} Difficulty
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter m-0 max-w-3xl">
                {tour.title}
              </h1>
              <div className="flex items-center gap-6 text-white/80 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-400" />
                  {tour.destination}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  {tour.duration} Days Expedition
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-card p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                <Star size={20} className="fill-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{tour.rating}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Member Rating</p>
            </div>
            <div className="stat-card p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                <ShieldCheck size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{getSafety(tour)}%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Safety Score</p>
            </div>
            <div className="stat-card p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-900/10 flex items-center justify-center text-slate-900 mb-4">
                <Users size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{getGroup(tour)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Max Unit Size</p>
            </div>
            <div className="stat-card p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-500 mb-4">
                <Sparkles size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{getReviews(tour)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Expeditions Logged</p>
            </div>
          </div>

          <div className="card-premium p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                <Mountain size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight m-0">Expedition Overview</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Join {getCompany(tour)} for an unparalleled journey through {tour.destination}. This {tour.duration}-day expedition is meticulously engineered to offer a {tour.difficulty?.toLowerCase() || 'moderate'} challenge while showcasing the most breathtaking landscapes and cultural landmarks the region has to offer.
            </p>
            <p className="text-slate-500 mt-6 leading-relaxed">
              Our professional guides ensure maximum safety and immersive storytelling, making every mile of this {tour.category?.toLowerCase() || 'adventure'} a memory to last a lifetime. All logistics, from tactical transport to premium quarters, are handled by our elite operations team.
            </p>

            <div className="mt-12">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Mission Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tour.highlights || ["Panoramic Alpine Views", "Professional Tactical Guides", "Authentic Local Cuisine", "Cultural Heritage Sites"]).map((h: string) => (
                  <div key={h} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-900">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card p-10 sticky top-28 shadow-2xl shadow-slate-200/50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pricing Model</p>
                <h3 className="text-3xl font-black text-emerald-600 tracking-tighter m-0">{formatPKR(tour.price)}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Per Individual</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                <Wallet size={24} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Calendar size={14} /> Deployment Date
                </label>
                <input 
                  className="input !bg-slate-50/50 !font-black !py-4 !rounded-2xl" 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]} 
                  value={bookingDate} 
                  onChange={e => setBookingDate(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Users size={14} /> Unit Size (Max {getGroup(tour)})
                </label>
                <div className="relative">
                  <input 
                    className="input !bg-slate-50/50 !font-black !py-4 !rounded-2xl pr-12" 
                    type="number" 
                    min={1} 
                    max={getGroup(tour)} 
                    value={bookingGroup} 
                    onChange={e => setBookingGroup(Number(e.target.value))} 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase">Pax</div>
                </div>
              </div>
              <div className="input-group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                  <Info size={14} /> Mission Notes
                </label>
                <textarea 
                  className="input !bg-slate-50/50 !font-black !py-4 !rounded-2xl !min-h-[100px]" 
                  placeholder="Special requests or requirements..." 
                  value={bookingNotes} 
                  onChange={e => setBookingNotes(e.target.value)} 
                />
              </div>

              <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <Zap size={60} className="text-white" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Base Investment</span>
                    <span>{bookingGroup} x {formatPKR(tour.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black">Total Investment</span>
                    <span className="text-2xl font-black text-emerald-400 tracking-tighter">{formatPKR(tour.price * bookingGroup)}</span>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-emerald w-full py-5 !rounded-[24px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3" 
                disabled={bookingLoading} 
                onClick={handleBooking}
              >
                {bookingLoading ? <div className="loading-spinner w-5 h-5 border-white" /> : <><Sparkles size={18} /> Confirm Expedition <ChevronRight size={18} /></>}
              </button>
              
              <p className="text-[10px] text-slate-400 text-center font-black uppercase tracking-widest mt-4">
                Secure transaction guaranteed via SmartTour SSL.
              </p>
            </div>
          </div>
          
          <div className="stat-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-[20px] bg-slate-50 flex items-center justify-center text-slate-900 shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Managed By</p>
              <p className="text-sm font-black text-slate-900">{getCompany(tour)}</p>
              <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 hover:text-emerald-600">Contact Operator</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
