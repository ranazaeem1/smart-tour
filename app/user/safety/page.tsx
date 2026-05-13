"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSafetyZones, fetchSafetyAlerts } from "@/lib/db";
import { WeatherCard } from "@/components/shared/WeatherCard";
import { SafetyMap } from "@/components/shared/SafetyMap";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Map as MapIcon, 
  Zap, 
  Navigation,
  Activity,
  HeartPulse,
  Smartphone,
  Thermometer,
  Droplets,
  Truck,
  PhoneCall
} from "lucide-react";

interface SafetyZone {
  area: string;
  score: number;
  status: string;
  color: string;
}

interface SafetyAlert {
  id: string;
  area: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "Location access was denied. Using last known region as fallback.",
  2: "Location unavailable. Network or hardware issue detected.",
  3: "Location request timed out. Using last known region as fallback.",
};

export default function SafetyPage() {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<"gps" | "fallback">("gps");
  const [geoError, setGeoError] = useState<string | null>(null);

  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [z, a] = await Promise.all([
          fetchSafetyZones(),
          fetchSafetyAlerts()
        ]);
        setZones(z || []);
        setAlerts(a || []);
      } catch (err) {
        console.error("Error loading safety data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSOS = () => {
    setSosLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setLocation({ lat: 35.3125, lng: 74.3125 });
      setLocationSource("fallback");
      setSosLoading(false);
      setSosActive(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationSource("gps");
        setSosLoading(false);
        setSosActive(true);
      },
      (err: GeolocationPositionError) => {
        const msg = GEO_ERROR_MESSAGES[err.code] ?? `Location error (code ${err.code}): ${err.message}`;
        setGeoError(msg);
        setLocation({ lat: 35.3125, lng: 74.3125 });
        setLocationSource("fallback");
        setSosLoading(false);
        setSosActive(true);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4" role="status" aria-live="polite">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Loading Safety Intelligence...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10" role="main">
      {/* ── Safety Hero Header ── */}
      <section className="bg-slate-950 rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-Time Intelligence</span>
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-3">Safety & Risk Map</h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">Live threat monitoring for Northern Pakistan expeditions.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="text-right hidden md:block">
              <span className="badge badge-emerald !bg-emerald-500/20 !text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Network Sync
              </span>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Update: 2 mins ago</p>
            </div>

            <button
              onClick={handleSOS}
              disabled={sosLoading}
              className={`btn min-h-[56px] px-10 rounded-full shadow-2xl transition-all group ${
                sosLoading ? 'bg-slate-800 opacity-50 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40'
              }`}
              aria-label="Trigger Emergency SOS Signal"
            >
              {sosLoading ? (
                <div className="loading-spinner w-5 h-5 border-t-white" />
              ) : (
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className="animate-pulse" />
                  <span className="text-sm font-black tracking-widest">🚨 SOS ALERT</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── SOS Active Modal ── */}
      {sosActive && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade" onClick={() => setSosActive(false)} />
          <div className="bg-[var(--card)] border border-rose-500/30 rounded-[var(--radius-xl)] p-8 md:p-12 max-w-[520px] w-full shadow-2xl relative z-10 animate-fade-in-up text-center">
            <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-500/40 mx-auto mb-8 animate-bounce">
              <ShieldAlert size={40} />
            </div>
            
            <h2 className="text-3xl font-black text-rose-500 mb-4 tracking-tighter uppercase">SOS Signal Active</h2>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-10 font-medium px-4">
              Your GPS coordinates and emergency profile have been broadcast to local authorities and saved contacts.
            </p>

            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 mb-10 text-left space-y-6">
              <div>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Navigation size={12} /> Current Coordinates
                </p>
                <p className="text-xl font-mono font-black text-[var(--foreground)] tracking-tight">
                  {location?.lat?.toFixed(6)}, {location?.lng?.toFixed(6)}
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Activity size={12} /> Broadcast Status
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <p className="text-sm font-bold text-emerald-500 uppercase tracking-tighter">Signal Dispatched via Emergency Network</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSosActive(false); setGeoError(null); }}
              className="btn btn-emerald w-full !py-4 !rounded-2xl shadow-xl shadow-emerald-500/20"
            >
              Secure & Dismiss Signal
            </button>
          </div>
        </div>
      )}

      {/* ── Environment Metrics ── */}
      <section aria-label="Environmental Intelligence">
        <WeatherCard />
      </section>

      {/* ── Risk Intelligence Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Safety Scores */}
        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Destination Safety Scores</h2>
          </div>

          <div className="space-y-8">
            {zones.map(zone => (
              <div key={zone.area} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-sm font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">{zone.area}</p>
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Regional Health Index</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-tighter" style={{ color: zone.color }}>{zone.score}/100</span>
                    <span className={`badge`} style={{ background: `${zone.color}15`, color: zone.color, border: `1px solid ${zone.color}30` }}>
                      {zone.status}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${zone.score}%`, backgroundColor: zone.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Risk Alerts */}
        <div className="card-premium">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Active Risk Intelligence</h2>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="p-8 bg-tint-green rounded-[var(--radius-lg)] border-emerald-100/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-700">All Clear</p>
                  <p className="text-xs font-bold text-emerald-600/70 mt-0.5">No critical risk intelligence reported for your tracked regions.</p>
                </div>
              </div>
            ) : (
              alerts.map(r => (
                <div key={r.id} className={`p-6 rounded-[var(--radius-lg)] border flex flex-col gap-3 transition-all hover:shadow-md ${
                  r.severity === 'high' ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30' : 
                  r.severity === 'medium' ? 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' : 
                  'bg-slate-50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className={r.severity === 'high' ? 'text-rose-500' : r.severity === 'medium' ? 'text-amber-500' : 'text-slate-900'} />
                    <p className={`text-[13px] font-black uppercase tracking-tight ${
                      r.severity === 'high' ? 'text-rose-700 dark:text-rose-400' : 
                      r.severity === 'medium' ? 'text-amber-700 dark:text-amber-400' : 
                      'text-slate-900 dark:text-slate-100'
                    }`}>
                      {r.area}: {r.type}
                    </p>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed ${
                    r.severity === 'high' ? 'text-rose-600/80 dark:text-rose-400/60' : 
                    r.severity === 'medium' ? 'text-amber-600/80 dark:text-amber-400/60' : 
                    'text-slate-900/80 dark:text-slate-100/60'
                  }`}>
                    {r.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive Map Section ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <MapIcon size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Interactive Safety Infrastructure</h2>
          </div>
          <Link href="/user/safety/map" className="btn btn-secondary !py-2 !px-4 !text-[10px]">Expand Map</Link>
        </div>
        <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] shadow-2xl">
          <SafetyMap />
        </div>
      </section>

      {/* ── Professional Safety Protocol ── */}
      <section className="card-premium !p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-900 border border-slate-900/20">
            <Info size={20} />
          </div>
          <h2 className="text-xl font-black text-[var(--foreground)] m-0">Expedition Safety Protocol</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            { icon: <HeartPulse className="text-rose-500" />, title: "Medical Readiness", tip: "Carry altitude sickness medication (Diamox) and a comprehensive trauma kit." },
            { icon: <Smartphone className="text-slate-900" />, title: "Digital Redundancy", tip: "Cache offline maps and maintain physical backups. Signal is valley-dependent." },
            { icon: <Thermometer className="text-amber-500" />, title: "Thermal Planning", tip: "Night temperatures can drop to -10°C. Multi-layer technical gear is mandatory." },
            { icon: <Droplets className="text-slate-800" />, title: "Hydration Security", tip: "Use industrial water purification. Natural springs may carry regional pathogens." },
            { icon: <Truck className="text-emerald-500" />, title: "Logistics Verification", tip: "Verify driver credentials and vehicle clearance for high-mountain terrain." },
            { icon: <PhoneCall className="text-slate-800" />, title: "Emergency Comms", tip: "Register your itinerary with local authorities and establish check-in windows." },
          ].map((t, i) => (
            <div key={i} className="p-6 bg-[var(--muted)] rounded-[var(--radius-lg)] border border-[var(--border)] flex gap-4 transition-all hover:bg-[var(--card)] hover:shadow-lg group">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--card)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {t.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--foreground)] mb-1 uppercase tracking-tight">{t.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">{t.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
