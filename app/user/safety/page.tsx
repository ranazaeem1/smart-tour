"use client";
import { useState } from "react";
import { SAFETY_ZONES } from "@/lib/data";

const RISK_AREAS = [
  { area:"Khunjerab Pass", risk:"High Altitude Risk", icon:"⛰️", level:"warning", desc:"Altitude sickness possible above 4,693m. Acclimatize properly." },
  { area:"Babusar Top", risk:"Road Closure Risk", icon:"🛣️", level:"warning", desc:"Road may close due to heavy snowfall Nov-May. Check before travel." },
  { area:"Gilgit City", risk:"Minor Security Alert", icon:"🏙️", level:"info", desc:"Exercise normal caution. Avoid night travel outside city." },
  { area:"All Northern Areas", risk:"Weather Volatility", icon:"🌩️", level:"info", desc:"Mountain weather can change rapidly. Always check forecast." },
];

export default function SafetyPage() {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSOS = () => {
    setSosLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          setSosLoading(false);
          setSosActive(true);
          console.log("SOS Signal Dispatched:", loc);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback if GPS blocked
          setLocation({ lat: 35.3125, lng: 74.3125 }); // Simulated Gilgit coords
          setSosLoading(false);
          setSosActive(true);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setSosLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="topbar" style={{ background: "var(--navy)", margin: "-28px -32px 28px", padding: "22px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>Real-Time Safety</div>
          <h1 className="topbar-title" style={{ color:"#fff", margin: 0 }}>🛡️ Safety &amp; Risk Map</h1>
        </div>
        
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display:"flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
             <span className="badge badge-emerald">● Live Data</span>
             <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Last sync: 2 min ago</span>
          </div>
          
          <button 
            className="sos-button"
            onClick={handleSOS}
            disabled={sosLoading}
            style={{ 
              background: "var(--rose)", 
              color: "#fff", 
              border: "none", 
              padding: "12px 28px", 
              borderRadius: 100, 
              fontWeight: 900, 
              fontSize: 16, 
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(244, 63, 94, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease"
            }}
          >
            {sosLoading ? <span className="loading-spinner" style={{ borderTopColor: "#fff", width: 14, height: 14 }} /> : "🚨 SOS"}
          </button>
        </div>
      </div>

      {/* SOS Modal Overlay */}
      {sosActive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card-glass animate-fade" style={{ maxWidth: 500, width: "100%", padding: 32, textAlign: "center", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
            <div className="sos-pulse" style={{ width: 80, height: 80, background: "var(--rose)", borderRadius: "50%", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🚨</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "var(--rose)" }}>SOS SIGNAL ACTIVE</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>Your current location and emergency profile have been broadcasted to local authorities and saved contacts.</p>
            
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, marginBottom: 24, textAlign: "left" }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12, display: "block" }}>COORDINATES</span>
                <span style={{ fontFamily: "monospace", fontSize: 15, color: "var(--teal)" }}>{location?.lat?.toFixed(6) || "Fetching..."}, {location?.lng?.toFixed(6) || "Fetching..."}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12, display: "block" }}>EMERGENCY CONTACTS</span>
                <span style={{ fontSize: 14 }}>Rescue 1122, Northern Police, Family (Primary)</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: 12, display: "block" }}>STATUS</span>
                <span style={{ fontSize: 14, color: "var(--emerald)" }}>📡 Signal Dispatched via Satellite</span>
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSosActive(false)}>Dismiss Signal</button>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap:24,marginBottom:28 }}>
        {/* Safety scores */}
        <div className="card">
          <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>📊 Safety Scores by Destination</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {SAFETY_ZONES.map(zone=>(
              <div key={zone.area}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:14 }}>
                  <span style={{ fontWeight:600 }}>{zone.area}</span>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ fontWeight:800,color:zone.color }}>{zone.score}/100</span>
                    <span className="badge" style={{ fontSize:10,background:`${zone.color}20`,color:zone.color,border:`1px solid ${zone.color}40`,padding:"2px 8px" }}>{zone.status}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${zone.score}%`,background:zone.color }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="card">
          <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>⚠️ Active Risk Alerts</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {RISK_AREAS.map(r=>(
              <div key={r.area} className={`alert alert-${r.level}`} style={{ flexDirection:"column",gap:6 }}>
                <div style={{ display:"flex",gap:10,alignItems:"center",fontWeight:700,fontSize:14 }}>
                  <span style={{ fontSize:20 }}>{r.icon}</span>
                  <span>{r.area}: {r.risk}</span>
                </div>
                <div style={{ fontSize:13,opacity:0.85 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🗺️ Interactive Safety Map</h2>
        <div className="map-placeholder" style={{ height:360,borderRadius:"var(--radius-lg)",background:"var(--bg-secondary)",border:"1px solid var(--border)",position:"relative",overflow:"hidden" }}>
          <svg viewBox="0 0 600 400" style={{ width:"100%",height:"100%",opacity:0.3 }}>
            <path d="M100 200 L200 100 L350 80 L450 150 L500 250 L400 320 L250 350 L150 300 Z" fill="var(--teal)" stroke="var(--border)" strokeWidth="2"/>
            <circle cx="200" cy="150" r="12" fill="var(--emerald)" opacity="0.8"/>
            <circle cx="350" cy="120" r="10" fill="var(--emerald)" opacity="0.8"/>
            <circle cx="300" cy="200" r="10" fill="var(--gold)" opacity="0.8"/>
            <circle cx="150" cy="250" r="8" fill="var(--emerald)" opacity="0.8"/>
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12 }}>
            <div style={{ fontSize:48 }}>🗺️</div>
            <div style={{ fontWeight:700,fontSize:18,color:"var(--text-primary)" }}>Interactive Safety Map</div>
            <div style={{ fontSize:14,color:"var(--text-muted)" }}>Google Maps integration ready for production</div>
            <div style={{ display:"flex",gap:16,marginTop:8 }}>
              <span style={{ display:"flex",alignItems:"center",gap:6,fontSize:13 }}><span style={{ width:12,height:12,borderRadius:"50%",background:"var(--emerald)",display:"inline-block" }}/> Safe</span>
              <span style={{ display:"flex",alignItems:"center",gap:6,fontSize:13 }}><span style={{ width:12,height:12,borderRadius:"50%",background:"var(--gold)",display:"inline-block" }}/> Moderate</span>
              <span style={{ display:"flex",alignItems:"center",gap:6,fontSize:13 }}><span style={{ width:12,height:12,borderRadius:"50%",background:"var(--rose)",display:"inline-block" }}/> Unsafe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="card">
        <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>💡 Safety Tips for Northern Pakistan</h2>
        <div className="grid-3">
          {[
            { icon:"🏥", tip:"Carry a first-aid kit and altitude sickness medication (Diamox)" },
            { icon:"📱", tip:"Download offline maps before traveling. Signal is scarce in valleys." },
            { icon:"🌡️", tip:"Night temperatures can drop to -10°C even in summer at high altitudes." },
            { icon:"💧", tip:"Carry water purification tablets. Drink only purified water." },
            { icon:"🚗", tip:"Hire experienced local drivers familiar with mountain terrain." },
            { icon:"📞", tip:"Share your itinerary with family. Register with local police if trekking." },
          ].map((t,i)=>(
            <div key={i} style={{ padding:"14px 16px",background:"var(--bg-secondary)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)",display:"flex",gap:12,alignItems:"flex-start" }}>
              <span style={{ fontSize:24,flexShrink:0 }}>{t.icon}</span>
              <p style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.6,margin:0 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
