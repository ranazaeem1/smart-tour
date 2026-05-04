"use client";
import { SAFETY_ZONES } from "@/lib/data";

const RISK_AREAS = [
  { area:"Khunjerab Pass", risk:"High Altitude Risk", icon:"⛰️", level:"warning", desc:"Altitude sickness possible above 4,693m. Acclimatize properly." },
  { area:"Babusar Top", risk:"Road Closure Risk", icon:"🛣️", level:"warning", desc:"Road may close due to heavy snowfall Nov-May. Check before travel." },
  { area:"Gilgit City", risk:"Minor Security Alert", icon:"🏙️", level:"info", desc:"Exercise normal caution. Avoid night travel outside city." },
  { area:"All Northern Areas", risk:"Weather Volatility", icon:"🌩️", level:"info", desc:"Mountain weather can change rapidly. Always check forecast." },
];

export default function SafetyPage() {
  return (
    <div className="animate-fade">
      <div className="topbar" style={{ background: "var(--navy)", margin: "-28px -32px 28px", padding: "22px 32px" }}>
        <div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>Real-Time Safety</div>
          <h1 className="topbar-title" style={{ color:"#fff" }}>🛡️ Safety &amp; Risk Map</h1>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span className="badge badge-emerald">● Live Data</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>Updated: Just now</span>
        </div>
      </div>

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
          {/* SVG Pakistan north map */}
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
