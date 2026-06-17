"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DESTINATIONS, BUDGET_BREAKDOWN, SAFETY_ZONES, formatPKR } from "@/lib/data";
import { getLocalDateInputValue, isPastTravelDate } from "@/lib/db";
import { getTourImage } from "@/lib/tourImages";
import { 
  Star,
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Shield, 
  BrainCircuit, 
  ChevronRight, 
  ArrowRight,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  X,
  Target,
  Utensils,
  Hotel,
  CloudSun,
  Activity,
  Zap,
  Info
} from "lucide-react";

const INTERESTS = ["Trekking", "Photography", "Culture", "Wildlife", "Camping", "History", "Family", "Winter Sports", "Lakes", "Food"];

type SemanticMatchedTour = {
  id: string;
  title: string;
  destination: string;
  price: number;
  rating: number;
  image_url?: string | null;
  difficulty?: string;
  safety_score?: number;
  similarity?: number;
  companies?: { name?: string } | null;
};

function generateDynamicItinerary(dest: string, days: number) {
  const baseName = dest.split(" ")[0];
  const genericDays = [
    { title: `Arrival in ${baseName}`, places: [`${baseName} City Center`, `Local Markets`], travelTime: "1-2h", accommodation: `${baseName} Grand Hotel`, meals: ["Dinner"], weather: "Sunny 22°C", weatherIcon: <CloudSun size={14} className="text-amber-400" /> },
    { title: `${baseName} Valley Highlights`, places: [`${baseName} Viewpoint`, `Historical Fort`, `Old Town`], travelTime: "3h drive", accommodation: `${baseName} Grand Hotel`, meals: ["Breakfast", "Dinner"], weather: "Partly Cloudy 18°C", weatherIcon: <CloudSun size={14} className="text-slate-400" /> },
    { title: `Nature & Lakes of ${baseName}`, places: [`${baseName} Main Lake`, `Mountain Pass`, `Scenic Valley`], travelTime: "4h total", accommodation: `${baseName} Grand Hotel`, meals: ["Breakfast", "Lunch", "Dinner"], weather: "Clear 20°C", weatherIcon: <CloudSun size={14} className="text-amber-400" /> },
    { title: `Adventure in ${baseName}`, places: [`High Altitude Basecamp`, `Glacier View`, `Alpine Meadows`], travelTime: "5h drive", accommodation: `${baseName} Resort`, meals: ["Breakfast", "Lunch"], weather: "Cool 12°C", weatherIcon: <CloudSun size={14} className="text-slate-900" /> },
    { title: `Farewell from ${baseName}`, places: [`Souvenir Shopping`, `Departure`], travelTime: "2h", accommodation: "—", meals: ["Breakfast"], weather: "Sunny 24°C", weatherIcon: <CloudSun size={14} className="text-amber-400" /> },
  ];
  
  const result = [];
  for (let i = 0; i < days; i++) {
    if (i === days - 1) {
      result.push({ day: i + 1, ...genericDays[4] }); 
    } else if (i < 4) {
      result.push({ day: i + 1, ...genericDays[i] });
    } else {
      result.push({ day: i + 1, ...genericDays[1] });
    }
  }
  return result;
}

type GeneratedItineraryDay = {
  day_number: number;
  title: string;
  activities: string[];
  estimated_cost: number;
};

type GeneratedItinerary = {
  trip_overview: string;
  day_by_day: GeneratedItineraryDay[];
};

function PlannerContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState(params.get("dest") || "");
  const [budget, setBudget] = useState(Number(params.get("budget")) || 45000);
  const [days, setDays] = useState<string | number>(params.get("days") || "");
  const [group, setGroup] = useState<string | number>(params.get("group") || "");
  const [startDate, setStartDate] = useState("");
  const [interests, setInterests] = useState<string[]>(["Trekking", "Photography"]);
  const [, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);
  const [itinerarySource, setItinerarySource] = useState<"gemini" | "fallback" | null>(null);
  const [itineraryNotice, setItineraryNotice] = useState<string | null>(null);
  
  const [matchingTours, setMatchingTours] = useState<SemanticMatchedTour[] | null>(null);
  const [searchingTours, setSearchingTours] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  const dynamicItinerary = generatedItinerary?.day_by_day || [];
  const minDeploymentDate = getLocalDateInputValue();

  const toggleInterest = (i: string) => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const generate = async () => {
    if (!dest || !days || !group || !startDate) {
      setPlannerError("Complete all planner fields before generating the itinerary.");
      return;
    }
    if (isPastTravelDate(startDate)) {
      setPlannerError("Previous dates are locked. Please select today or a future deployment date.");
      return;
    }
    setPlannerError(null);
    setGeneratedItinerary(null);
    setItinerarySource(null);
    setItineraryNotice(null);
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: dest,
          duration_days: Number(days),
          budget,
          group_size: Number(group),
          start_date: startDate,
          preferences: interests,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setPlannerError(payload?.error || "Itinerary generation failed.");
        return;
      }

      setGeneratedItinerary(payload.itinerary as GeneratedItinerary);
      setItinerarySource(payload.source === "fallback" ? "fallback" : "gemini");
      setItineraryNotice(payload.source === "fallback" ? payload.reason || "Gemini was unavailable, so a safe fallback plan was generated." : null);
      setGenerated(true);
      setStep(3);
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Itinerary generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTour = async () => {
    setSearchingTours(true);
    setShowRecommendation(true);
    setSemanticError(null);
    try {
      const response = await fetch("/api/ai/match-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: dest,
          budget,
          duration: Number(days) || undefined,
          groupSize: Number(group) || undefined,
          interests,
          preferences: [
            `${days || "Flexible"} day itinerary`,
            `${group || "Flexible"} travelers`,
            interests.length ? `Interested in ${interests.join(", ")}` : "",
            safetyInfo ? `Safety preference: ${safetyInfo.status}` : "",
          ].filter(Boolean).join(". "),
          matchThreshold: 0.55,
          matchCount: 8,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setSemanticError(payload?.error || "Semantic matching failed.");
        setMatchingTours([]);
        return;
      }

      setMatchingTours(Array.isArray(payload.tours) ? payload.tours : []);
    } catch (err) {
      setSemanticError(err instanceof Error ? err.message : "Semantic matching failed.");
      setMatchingTours([]);
    } finally {
      setSearchingTours(false);
    }
  };

  const totalCost = budget * Number(group || 0);
  const safetyInfo = dest ? (SAFETY_ZONES.find(z => dest.includes(z.area.split(" ")[0])) || SAFETY_ZONES[0]) : null;
  const isFormValid = Boolean(dest && days && group && startDate && !isPastTravelDate(startDate));

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Recommendation Overlay ── */}
      {showRecommendation && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xl animate-fade" onClick={() => setShowRecommendation(false)} />
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-[650px] relative z-10 animate-fade-in-up overflow-hidden">
            <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" aria-hidden="true">
              <BrainCircuit size={300} />
            </div>
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg mb-3 border border-emerald-500/20">
                  <Zap size={12} className="text-emerald-500" />
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">AI Intelligence</span>
                </div>
                <h3 className="text-3xl font-black text-slate-950 tracking-tighter">Tailored Expeditions</h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Semantic matches for {dest} under {formatPKR(budget)}</p>
              </div>
              <button onClick={() => setShowRecommendation(false)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-slate-500" aria-label="Close recommendations">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {searchingTours ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="loading-spinner h-12 w-12 mb-6" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Generating embeddings and scanning vector index...</p>
                </div>
              ) : matchingTours && matchingTours.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-5 bg-tint-green rounded-2xl border-emerald-100/50 flex items-center gap-4 animate-fade">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest">Found {matchingTours.length} semantic matches.</p>
                  </div>
                  {matchingTours.map((tour, idx) => (
                    <div key={tour.id} className="group flex gap-6 p-6 bg-slate-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-200 rounded-3xl transition-all duration-500 animate-fade" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="w-24 h-24 rounded-[20px] overflow-hidden shadow-lg shrink-0">
                        <img src={getTourImage(tour)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={tour.title} />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-black text-slate-950 group-hover:text-emerald-500 transition-colors leading-tight">{tour.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tour.companies?.name}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                            <div className="flex items-center gap-1">
                              <Star size={10} className="text-amber-400 fill-amber-400" />
                              <span className="text-[11px] font-black text-slate-950">{tour.rating}</span>
                            </div>
                            {typeof tour.similarity === "number" && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{Math.round(tour.similarity * 100)}% match</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xl font-black text-emerald-500 tracking-tighter">{formatPKR(tour.price)}</span>
                          <Link href={`/user/tours/${tour.id}`} className="btn btn-emerald !py-2 !px-5 !rounded-xl !text-[10px]">View Expedition</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-500 mx-auto mb-6 shadow-inner border border-slate-200">
                    <Compass size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-950 mb-2 tracking-tight">No Matching Expeditions</h4>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                    {semanticError || `We couldn't find embedded tours for ${dest} within your budget constraints.`}
                  </p>
                  <div className="mt-10 flex gap-4 justify-center">
                    <button className="btn btn-secondary !px-8" onClick={() => setShowRecommendation(false)}>Adjust Specs</button>
                    <Link href="/user/tours" className="btn btn-emerald !px-8">Explore All</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-center relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time operator synchronization enabled.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Algorithm-Driven Planning</p>
          <h1 className="m-0 tracking-tighter text-4xl">Smart Itinerary</h1>
        </div>
        <nav className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200" aria-label="Planner steps">
          {["Preferences", "Review", "Itinerary"].map((l, i) => (
            <button 
              key={l} 
              className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${step === i + 1 ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-slate-950"}`} 
              onClick={() => {
                if (i + 1 > 1 && !isFormValid) {
                  setPlannerError("Previous dates are locked and all planner fields are required before review.");
                  return;
                }
                if (i + 1 === 3 && !generatedItinerary) {
                  void generate();
                  return;
                }
                setPlannerError(null);
                setStep(i + 1);
              }}
              aria-current={step === i + 1 ? "step" : undefined}
            >
              {i + 1}. {l}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Step 1: Preferences ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-sm">
                  <Target size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 m-0">Expedition Objectives</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Define your core mission parameters</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="dest" className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Destination Region</label>
                  <select id="dest" className="input !py-4 font-black" value={dest} onChange={e => setDest(e.target.value)}>
                    <option value="" disabled>Select Locale</option>
                    {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label htmlFor="budget" className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    Budget Threshold <span className="text-emerald-500">{formatPKR(budget)}</span>
                  </label>
                  <div className="rounded-2xl border border-slate-300 bg-white px-4 py-4">
                    <input id="budget" type="range" min={10000} max={200000} step={5000} value={budget} onChange={e => setBudget(Number(e.target.value))} className="budget-threshold-slider w-full cursor-pointer appearance-none" />
                    <div className="flex justify-between mt-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      <span>10K</span><span>50K</span><span>100K</span><span>150K</span><span>200K</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label htmlFor="days" className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Duration (Days)</label>
                  <input id="days" className="input !py-4 font-black" type="number" min={1} max={30} value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 5" />
                </div>
                <div className="space-y-3">
                  <label htmlFor="group" className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Unit Size (Personnel)</label>
                  <input id="group" className="input !py-4 font-black" type="number" min={1} max={50} value={group} onChange={e => setGroup(e.target.value)} placeholder="e.g. 2" />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label htmlFor="startDate" className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Deployment Date</label>
                  <input id="startDate" className="input !py-4 font-black" type="date" min={minDeploymentDate} value={startDate} onChange={e => { setPlannerError(null); setStartDate(e.target.value); }} />
                </div>
              </div>
              {plannerError && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-black uppercase tracking-widest text-rose-600">
                  {plannerError}
                </div>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-sm">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 m-0">Regional Interests</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure your experience filters</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map(i => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${interests.includes(i) ? "bg-slate-100 border-slate-900 text-slate-950 shadow-xl dark:bg-emerald-500 dark:border-emerald-500" : "bg-white border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-50"}`}>
                    {i}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" aria-hidden="true">
                <Wallet size={150} className="text-slate-950" />
              </div>
              <h2 className="text-xl font-black text-slate-950 mb-10 relative z-10 flex items-center gap-3">
                <Activity size={20} className="text-emerald-500" />
                Economic Model
              </h2>
              <div className="space-y-6 relative z-10">
                {[
                  { label: "Destination Locale", value: dest || "Pending" },
                  { label: "Expedition Span", value: days ? `${days} Days` : "Not Set" },
                  { label: "Unit Strength", value: group ? `${group} Personnel` : "Not Set" },
                  { label: "Base Budget (PP)", value: formatPKR(budget) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.label}</span>
                    <span className="text-sm font-black text-slate-700">{r.value}</span>
                  </div>
                ))}
                <div className="pt-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Aggregate Investment</p>
                  <p className="text-4xl font-black text-emerald-400 tracking-tighter">{formatPKR(totalCost)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <Shield size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-950 m-0">Safety Analysis</h2>
              </div>
              {safetyInfo ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
                      <p className="text-2xl font-black text-emerald-500">{safetyInfo.score}</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">{safetyInfo.status}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Integrity Confirmed</p>
                    </div>
                  </div>
                  <div className="p-5 bg-tint-green rounded-2xl border border-emerald-100/30 flex items-start gap-4">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed uppercase tracking-tight">Route accessibility verified for {dest}. No active hazards.</p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center opacity-30 italic font-black text-[11px] uppercase tracking-[0.2em]">Awaiting Locale...</div>
              )}
            </div>

            <div className="space-y-4">
              <button 
                onClick={generate} 
                className={`btn btn-emerald w-full !py-5 !rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 ${!isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : ''}`} 
                disabled={loading || !isFormValid}
              >
                {loading ? <><div className="loading-spinner w-5 h-5 border-white"/> Synthesizing Strategy...</> : <><BrainCircuit size={20} /> Generate Itinerary <ArrowRight size={20} /></>}
              </button>
              {!isFormValid && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                   <Info size={12} className="text-rose-500" />
                   <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{startDate && isPastTravelDate(startDate) ? "Previous dates are locked" : "Incomplete parameters detected"}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── Step 3: Itinerary ── */}
      {step === 3 && (
        <div className="space-y-10 animate-fade">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge badge-emerald">{itinerarySource === "fallback" ? "Fallback Strategy" : "Gemini Optimized"}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{days} Days in {dest}</span>
              </div>
              <h2 className="text-4xl font-black text-slate-950 tracking-tighter m-0">Expedition Blueprint</h2>
              {itineraryNotice && (
                <p className="mt-3 max-w-2xl text-xs font-bold uppercase tracking-widest text-amber-600">{itineraryNotice} Showing a budget-safe itinerary.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-secondary !px-6 py-4 flex items-center gap-2 group" onClick={() => {
                const lines = [`SmartTour Gemini Strategy - ${days}-Day ${dest} Expedition`, `Group: ${group} People | Budget: ${formatPKR(budget)} pp | Total: ${formatPKR(budget * Number(group))}`, generatedItinerary?.trip_overview || '', ...dynamicItinerary.map(day => [`Day ${day.day_number}: ${day.title}`, ...day.activities.map(activity => `  - ${activity}`), `  Estimated Cost: ${formatPKR(day.estimated_cost)}`, ''].join('\n'))].join('\n');
                const blob = new Blob([lines], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `blueprint-${dest.replace(/\s+/g, '-').toLowerCase()}.txt`; a.click(); URL.revokeObjectURL(url);
              }}>
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Download
              </button>
              <button className="btn btn-secondary !px-6 py-4 flex items-center gap-2 group" onClick={() => { if (navigator.share) { navigator.share({ title: `${days}-Day ${dest} Expedition`, text: `Check out my Smart Tour strategy for ${dest}!`, url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); alert('Signal broadcasted to clipboard!'); } }}>
                <Share2 size={18} className="group-hover:scale-110 transition-transform" /> Broadcast
              </button>
              <button onClick={handleBookTour} className="btn btn-emerald !px-8 py-4 shadow-xl shadow-emerald-500/20">Secure Expedition <ChevronRight size={18} className="ml-1" /></button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <section className="lg:col-span-2 space-y-10" aria-label="Daily Objectives">
              {generatedItinerary?.trip_overview && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <BrainCircuit size={18} className="text-emerald-500" />
                    <h3 className="text-xl font-black text-slate-950 m-0">Gemini Trip Overview</h3>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-slate-600">{generatedItinerary.trip_overview}</p>
                </div>
              )}
              {dynamicItinerary.map((day, idx) => (
                <article key={day.day_number} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 animate-fade group" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shrink-0 group-hover:rotate-3 transition-transform">
                        {day.day_number < 10 ? `0${day.day_number}` : day.day_number}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-950 m-0 tracking-tight">{day.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={14} className="text-emerald-500" />
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">Gemini Generated Day Plan</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                      <Wallet size={14} className="text-emerald-500" />
                      <span className="text-[12px] font-black text-slate-950 uppercase tracking-tighter">{formatPKR(day.estimated_cost)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-10">
                    {day.activities.map(activity => (
                      <div key={activity} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        <p className="text-sm font-bold leading-relaxed text-slate-700">{activity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-200">
                    <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                        <Hotel size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Planner Source</p>
                        <p className="text-sm font-black text-slate-950">Gemini 1.5 Flash</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                        <Utensils size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Day Estimate</p>
                        <p className="text-sm font-black text-slate-950">{formatPKR(day.estimated_cost)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="space-y-10">
              <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Wallet size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-950 m-0 tracking-tight">Resource Allocation</h3>
                </div>
                <div className="space-y-10">
                  {dynamicItinerary.map(day => (
                    <div key={day.day_number} className="group">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Day {day.day_number}</span>
                        <span className="text-sm font-black text-slate-950">{formatPKR(day.estimated_cost)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-50 rounded-md overflow-hidden p-[1px] border border-slate-200">
                        <div className="h-full rounded-md bg-emerald-500 shadow-lg transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)" style={{ width: `${Math.min(100, Math.max(4, (day.estimated_cost / Math.max(1, budget)) * 100))}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Gemini Estimate</p>
                      <p className="text-3xl font-black text-emerald-500 tracking-tighter">{formatPKR(dynamicItinerary.reduce((sum, day) => sum + day.estimated_cost, 0))}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05]" aria-hidden="true">
                  <Zap size={100} className="text-slate-950" />
                </div>
                <h3 className="text-xl font-black text-slate-950 mb-8 relative z-10 flex items-center gap-3">
                   <BrainCircuit size={22} className="text-emerald-500" />
                   AI Live Intel
                </h3>
                <div className="space-y-4 relative z-10">
                  {[
                    { color: "text-slate-950 shadow-[0_0_10px_#FFFFFF]", msg: "Atmospheric Prediction: Light precipitation on Day 3. Standard gear sufficient." },
                    { color: "text-emerald-400 shadow-[0_0_10px_#10B981]", msg: "Logistics Sync: Primary high-altitude routes clear of active construction." },
                    { color: "text-amber-400 shadow-[0_0_10px_#F59E0B]", msg: "Climate Advisory: Night cycles drop to 5°C. High-thermal layers mandatory." },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 animate-fade">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${alert.color.split(' ')[0]} ${alert.color.split(' ')[1]}`} />
                      <p className="text-[12px] font-bold text-slate-400 leading-relaxed">{alert.msg}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-950 border border-slate-200">
                    <Users size={18} />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 tracking-tight">Expedition Unit</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Strength</span>
                    <span className="text-sm font-black text-slate-950">{group} Personnel</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Rate</span>
                    <span className="text-sm font-black text-emerald-500">{formatPKR(budget)}</span>
                  </div>
                  <div className="pt-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Deployment Cost</p>
                    <p className="text-3xl font-black text-slate-950 tracking-tighter">{formatPKR(budget * Number(group))}</p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm max-w-[800px] mx-auto animate-fade p-6 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="text-center mb-16 relative z-10">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[40px] flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-500/20 shadow-xl">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-950 m-0 tracking-tighter uppercase">Mission Validation</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-4">Finalizing Expedition Parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {[
              { label: "Target Locale", value: dest, icon: <MapPin size={22} className="text-rose-500" /> },
              { label: "Budget Rate (PP)", value: formatPKR(budget), icon: <Wallet size={22} className="text-emerald-500" /> },
              { label: "Temporal Scale", value: `${days} Days`, icon: <Calendar size={22} className="text-slate-900" /> },
              { label: "Unit Count", value: `${group} Personnel`, icon: <Users size={22} className="text-slate-500" /> },
              { label: "Aggregate Value", value: formatPKR(budget * Number(group)), icon: <Zap size={22} className="text-emerald-500" /> },
              { label: "Core Objectives", value: interests.join(", "), icon: <Target size={22} className="text-amber-500" /> },
            ].map(r => (
              <div key={r.label} className="p-8 bg-slate-50 border border-slate-200 rounded-3xl group hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-200 group-hover:scale-110 transition-transform">
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{r.label}</p>
                    <p className="text-sm font-black text-slate-950 group-hover:text-emerald-500 transition-colors">{r.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 flex flex-col gap-6 relative z-10">
            <button onClick={generate} className="btn btn-emerald w-full !py-6 !rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4 text-base">
              {loading ? <><div className="loading-spinner w-6 h-6 border-white"/> Synthesizing Intelligence...</> : <><BrainCircuit size={24} /> Generate Final Strategy <ArrowRight size={24} /></>}
            </button>
            <button onClick={() => setStep(1)} className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-950 transition-colors py-2 text-center">Modify Mission Parameters</button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center h-[60vh] space-y-6"><div className="loading-spinner h-12 w-12"/><p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Initializing AI Kernel...</p></div>}>
      <PlannerContent />
    </Suspense>
  );
}

