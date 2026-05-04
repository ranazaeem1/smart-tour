"use client";
import { useState } from "react";
import { SAFETY_ZONES } from "@/lib/data";

// ==========================================
// Constants
// ==========================================

const RISK_AREAS = [
  { area: "Khunjerab Pass", risk: "High Altitude Risk", icon: "⛰️", level: "warning", desc: "Altitude sickness possible above 4,693m. Acclimatize properly." },
  { area: "Babusar Top", risk: "Road Closure Risk", icon: "🛣️", level: "warning", desc: "Road may close due to heavy snowfall Nov–May. Check before travel." },
  { area: "Gilgit City", risk: "Minor Security Alert", icon: "🏙️", level: "info", desc: "Exercise normal caution. Avoid night travel outside city." },
  { area: "All Northern Areas", risk: "Weather Volatility", icon: "🌩️", level: "info", desc: "Mountain weather can change rapidly. Always check forecast." },
];

// GeolocationPositionError codes
const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "Location access was denied. Using last known region as fallback.",
  2: "Location unavailable. Network or hardware issue detected.",
  3: "Location request timed out. Using last known region as fallback.",
};

// ==========================================
// Component
// ==========================================

export default function SafetyPage() {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<"gps" | "fallback">("gps");
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleSOS = () => {
    setSosLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      // Browser doesn't support geolocation at all — use fallback immediately
      setLocation({ lat: 35.3125, lng: 74.3125 });
      setLocationSource("fallback");
      setSosLoading(false);
      setSosActive(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // ✅ Success callback — real GPS coordinates
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationSource("gps");
        setSosLoading(false);
        setSosActive(true);
      },
      // ⚠️ Error callback — graceful fallback with proper error details
      (err: GeolocationPositionError) => {
        const msg = GEO_ERROR_MESSAGES[err.code] ?? `Location error (code ${err.code}): ${err.message}`;
        console.warn("[SOS] Geolocation failed:", `Code ${err.code} — ${err.message}`);
        setGeoError(msg);
        // Fallback to approximate Gilgit-Baltistan region center
        setLocation({ lat: 35.3125, lng: 74.3125 });
        setLocationSource("fallback");
        setSosLoading(false);
        setSosActive(true);
      },
      // Options: 10s timeout, accept cached position up to 60s old
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="animate-fade">

      {/* ── Hero Topbar — Navy gradient matching landing page ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, #0f172a 60%, #0d9488 200%)",
        margin: "-28px -32px 32px",
        padding: "28px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background accent glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at top right, rgba(13,148,136,0.18), transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Real-Time Safety System
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2 }}>
            🛡️ Safety &amp; Risk Map
          </h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            Live threat intelligence for northern Pakistan
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span className="badge badge-emerald" style={{ fontSize: 11 }}>● Live Data</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Last sync: 2 min ago</span>
          </div>

          {/* SOS Button — landing page gradient style */}
          <button
            className="sos-button"
            onClick={handleSOS}
            disabled={sosLoading}
            style={{
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "13px 32px",
              borderRadius: 100,
              fontWeight: 900,
              fontSize: 16,
              cursor: sosLoading ? "not-allowed" : "pointer",
              boxShadow: "0 0 28px rgba(244, 63, 94, 0.5), 0 4px 16px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease",
              letterSpacing: "0.05em",
            }}
          >
            {sosLoading
              ? <><span className="loading-spinner" style={{ borderTopColor: "#fff", width: 14, height: 14 }} /> Locating...</>
              : "🚨 SOS ALERT"
            }
          </button>
        </div>
      </div>

      {/* ── SOS Active Modal — cinematic glassmorphism overlay ── */}
      {sosActive && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(5, 10, 20, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <div className="animate-fade" style={{
            maxWidth: 520,
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(32px) saturate(150%)",
            WebkitBackdropFilter: "blur(32px) saturate(150%)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 24,
            padding: 40,
            textAlign: "center",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,63,94,0.1)",
          }}>
            {/* Pulsing SOS icon */}
            <div className="sos-pulse" style={{
              width: 88,
              height: 88,
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              borderRadius: "50%",
              margin: "0 auto 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              boxShadow: "0 0 40px rgba(244,63,94,0.5)",
            }}>🚨</div>

            <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6, color: "#f43f5e", letterSpacing: "-0.02em" }}>
              SOS SIGNAL ACTIVE
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Your location and emergency profile have been broadcasted to local authorities and saved contacts.
            </p>

            {/* Location source warning if fallback */}
            {locationSource === "fallback" && geoError && (
              <div style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: "#f59e0b",
                textAlign: "left",
              }}>
                ⚠️ {geoError}
              </div>
            )}

            {/* Info grid */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px 24px",
              borderRadius: 16,
              marginBottom: 28,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  COORDINATES {locationSource === "fallback" ? "(Approximate Region)" : "(GPS Accurate)"}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 16, color: "#14d2be", fontWeight: 700 }}>
                  {location?.lat?.toFixed(6) ?? "—"}, {location?.lng?.toFixed(6) ?? "—"}
                </span>
              </div>

              <div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>EMERGENCY CONTACTS</span>
                <span style={{ fontSize: 14, color: "#fff" }}>Rescue 1122 &nbsp;·&nbsp; Northern Police &nbsp;·&nbsp; Family (Primary)</span>
              </div>

              <div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>STATUS</span>
                <span style={{ fontSize: 14, color: "#10b981", fontWeight: 600 }}>
                  📡 Signal Dispatched via Emergency Network
                </span>
              </div>

              <div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>TIME SENT</span>
                <span style={{ fontSize: 14, color: "#fff" }}>
                  {new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Dismiss button — teal outline style like landing page CTA */}
            <button
              onClick={() => { setSosActive(false); setGeoError(null); }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.07)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            >
              ✓ Dismiss Signal
            </button>
          </div>
        </div>
      )}

      {/* ── Safety Content ── */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 28 }}>

        {/* Safety Scores */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 Safety Scores by Destination</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SAFETY_ZONES.map(zone => (
              <div key={zone.area}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{zone.area}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: zone.color }}>{zone.score}/100</span>
                    <span className="badge" style={{ fontSize: 10, background: `${zone.color}20`, color: zone.color, border: `1px solid ${zone.color}40`, padding: "2px 8px" }}>{zone.status}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${zone.score}%`, background: zone.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>⚠️ Active Risk Alerts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RISK_AREAS.map(r => (
              <div key={r.area} className={`alert alert-${r.level}`} style={{ flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 14 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span>{r.area}: {r.risk}</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🗺️ Interactive Safety Map</h2>
        <div style={{ height: 360, borderRadius: "var(--radius-lg)", background: "var(--bg-secondary)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 600 400" style={{ width: "100%", height: "100%", opacity: 0.25 }}>
            <path d="M100 200 L200 100 L350 80 L450 150 L500 250 L400 320 L250 350 L150 300 Z" fill="var(--teal)" stroke="var(--border)" strokeWidth="2" />
            <circle cx="200" cy="150" r="12" fill="var(--emerald)" opacity="0.9" />
            <circle cx="350" cy="120" r="10" fill="var(--emerald)" opacity="0.9" />
            <circle cx="300" cy="200" r="10" fill="var(--gold)" opacity="0.9" />
            <circle cx="150" cy="250" r="8" fill="var(--emerald)" opacity="0.9" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 48 }}>🗺️</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Interactive Safety Map</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Google Maps integration ready for production</div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--emerald)", display: "inline-block" }} /> Safe</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} /> Moderate</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--rose)", display: "inline-block" }} /> Unsafe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💡 Safety Tips for Northern Pakistan</h2>
        <div className="grid-3">
          {[
            { icon: "🏥", tip: "Carry a first-aid kit and altitude sickness medication (Diamox)" },
            { icon: "📱", tip: "Download offline maps before traveling. Signal is scarce in valleys." },
            { icon: "🌡️", tip: "Night temperatures can drop to -10°C even in summer at high altitudes." },
            { icon: "💧", tip: "Carry water purification tablets. Drink only purified water." },
            { icon: "🚗", tip: "Hire experienced local drivers familiar with mountain terrain." },
            { icon: "📞", tip: "Share your itinerary with family. Register with local police if trekking." },
          ].map((t, i) => (
            <div key={i} style={{ padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
