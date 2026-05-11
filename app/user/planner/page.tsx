"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DESTINATIONS, ITINERARY_5DAY, BUDGET_BREAKDOWN, SAFETY_ZONES, formatPKR } from "@/lib/data";

const INTERESTS = ["Trekking","Photography","Culture","Wildlife","Camping","History","Family","Winter Sports","Lakes","Food"];

// Dynamic generator for a generic itinerary based on destination
function generateDynamicItinerary(dest: string, days: number) {
  const baseName = dest.split(" ")[0];
  const genericDays = [
    { title: `Arrival in ${baseName}`, places: [`${baseName} City Center`, `Local Markets`], travelTime: "1-2h", accommodation: `${baseName} Grand Hotel`, meals: ["Dinner"], weather: "Sunny 22°C", weatherIcon: "☀️" },
    { title: `${baseName} Valley Highlights`, places: [`${baseName} Viewpoint`, `Historical Fort`, `Old Town`], travelTime: "3h drive", accommodation: `${baseName} Grand Hotel`, meals: ["Breakfast", "Dinner"], weather: "Partly Cloudy 18°C", weatherIcon: "⛅" },
    { title: `Nature & Lakes of ${baseName}`, places: [`${baseName} Main Lake`, `Mountain Pass`, `Scenic Valley`], travelTime: "4h total", accommodation: `${baseName} Grand Hotel`, meals: ["Breakfast", "Lunch", "Dinner"], weather: "Clear 20°C", weatherIcon: "☀️" },
    { title: `Adventure in ${baseName}`, places: [`High Altitude Basecamp`, `Glacier View`, `Alpine Meadows`], travelTime: "5h drive", accommodation: `${baseName} Resort`, meals: ["Breakfast", "Lunch"], weather: "Cool 12°C", weatherIcon: "🌤️" },
    { title: `Farewell from ${baseName}`, places: [`Souvenir Shopping`, `Departure`], travelTime: "2h", accommodation: "—", meals: ["Breakfast"], weather: "Sunny 24°C", weatherIcon: "☀️" },
  ];
  
  // Extend or slice based on days (repeating middle days if > 5)
  const result = [];
  for (let i=0; i<days; i++) {
    if (i === days - 1) {
      result.push({ day: i+1, ...genericDays[4] }); // Always end with departure
    } else if (i < 4) {
      result.push({ day: i+1, ...genericDays[i] });
    } else {
      result.push({ day: i+1, ...genericDays[1] }); // Repeat day 2 logic for extra days
    }
  }
  return result;
}

function PlannerContent() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState(params.get("dest") || "Hunza Valley");
  const [budget, setBudget] = useState(Number(params.get("budget")) || 45000);
  const [days, setDays] = useState(5);
  const [group, setGroup] = useState(2);
  const [interests, setInterests] = useState<string[]>(["Trekking","Photography"]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dynamicItinerary = generateDynamicItinerary(dest, days);

  const toggleInterest = (i: string) => setInterests(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]);

  const generate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); setStep(3); }, 2000);
  };

  const totalCost = budget * group;
  const safetyInfo = SAFETY_ZONES.find(z => dest.includes(z.area.split(" ")[0])) || SAFETY_ZONES[0];

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>AI-Powered</div>
          <h1 className="topbar-title">🗺️ Smart Itinerary Planner</h1>
        </div>
        <div className="topbar-actions">
          <div className="tabs">
            {["1. Preferences","2. Review","3. Itinerary"].map((l,i)=>(
              <button key={l} className={`tab-btn ${step===i+1?"active":""}`} onClick={()=>setStep(i+1)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Preferences */}
      {step === 1 && (
        <div className="grid-2" style={{ gap:24 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            <div className="card">
              <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>🎯 Trip Preferences</h2>
              <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                <div className="input-group">
                  <label className="input-label">Destination</label>
                  <select className="input" value={dest} onChange={e=>setDest(e.target.value)}>
                    {DESTINATIONS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Budget per Person (PKR): <strong style={{ color:"var(--teal)" }}>{formatPKR(budget)}</strong></label>
                  <input type="range" min={10000} max={200000} step={5000} value={budget} onChange={e=>setBudget(Number(e.target.value))}
                    style={{ width:"100%",accentColor:"var(--teal)" }}/>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text-muted)" }}>
                    <span>PKR 10K</span><span>PKR 2L</span>
                  </div>
                </div>
                <div className="grid-2" style={{ gap:12 }}>
                  <div className="input-group">
                    <label className="input-label">Duration (Days)</label>
                    <input className="input" type="number" min={1} max={30} value={days} onChange={e=>setDays(Number(e.target.value))}/>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Group Size</label>
                    <input className="input" type="number" min={1} max={50} value={group} onChange={e=>setGroup(Number(e.target.value))}/>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Start Date</label>
                  <input className="input" type="date" defaultValue="2024-06-15"/>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🎨 Interests</h2>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {INTERESTS.map(i=>(
                  <button key={i} onClick={()=>toggleInterest(i)}
                    className="tag"
                    style={{ cursor:"pointer",background:interests.includes(i)?"var(--teal-glow)":"var(--bg-secondary)",color:interests.includes(i)?"var(--teal)":"var(--text-secondary)",border:interests.includes(i)?"1px solid var(--teal)40":"1px solid var(--border)",transition:"all 0.2s" }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* Summary card */}
            <div className="card" style={{ background:"var(--gradient-card)" }}>
              <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>📊 Trip Summary</h2>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {[
                  { label:"Destination", value:dest },
                  { label:"Duration", value:`${days} days` },
                  { label:"Group Size", value:`${group} people` },
                  { label:"Per Person", value:formatPKR(budget) },
                  { label:"Total Cost", value:formatPKR(totalCost) },
                ].map(r=>(
                  <div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
                    <span style={{ color:"var(--text-secondary)",fontSize:14 }}>{r.label}</span>
                    <span style={{ fontWeight:600,fontSize:14,color:"var(--text-primary)" }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 0" }}>
                  <span style={{ fontWeight:700,fontSize:16 }}>Grand Total</span>
                  <span style={{ fontWeight:800,fontSize:20,color:"var(--teal)" }}>{formatPKR(totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="card">
              <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🛡️ Safety Analysis</h2>
              <div style={{ display:"flex",alignItems:"center",gap:20,marginBottom:16 }}>
                <div className="safety-ring">
                  <div style={{ fontSize:22,fontWeight:800,color:"var(--emerald)" }}>{safetyInfo.score}</div>
                  <div style={{ fontSize:10,color:"var(--text-muted)" }}>/ 100</div>
                </div>
                <div>
                  <div style={{ fontSize:18,fontWeight:700,color:"var(--emerald)"}}>{safetyInfo.status}</div>
                  <div style={{ fontSize:13,color:"var(--text-secondary)",marginTop:4 }}>{dest} is currently safe for tourists</div>
                </div>
              </div>
              <div className="alert alert-success" style={{ fontSize:13 }}>
                ✅ All routes to {dest} are currently accessible and safe.
              </div>
            </div>

            <button onClick={generate} className="btn btn-primary btn-lg" style={{ width:"100%",justifyContent:"center" }} disabled={loading}>
              {loading ? <><span className="loading-spinner"/> Generating AI Itinerary...</> : "🤖 Generate Smart Itinerary →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Itinerary */}
      {step === 3 && (
        <div className="animate-fade">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
            <div>
              <h2 style={{ fontSize:22,fontWeight:800 }}>🏔️ Your {days}-Day {dest} Itinerary</h2>
              <p style={{ color:"var(--text-secondary)",fontSize:14,marginTop:4 }}>AI-optimized for minimum travel time & maximum places covered</p>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                const lines = [
                  `SmartTour — ${days}-Day ${dest} Itinerary`,
                  `Group: ${group} people | Budget: ${formatPKR(budget)}/person | Total: ${formatPKR(budget * group)}`,
                  '',
                  ...dynamicItinerary.map(day => [
                    `Day ${day.day}: ${day.title}`,
                    `  Places: ${day.places.join(', ')}`,
                    `  Accommodation: ${day.accommodation}`,
                    `  Meals: ${day.meals.join(', ')}`,
                    `  Weather: ${day.weather}`,
                    ''
                  ].join('\n'))
                ].join('\n');
                const blob = new Blob([lines], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `smarttour-${dest.replace(/\s+/g, '-').toLowerCase()}-itinerary.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}>📥 Download</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { if (navigator.share) { navigator.share({ title: `${days}-Day ${dest} Itinerary`, text: `Check out my Smart Tour itinerary for ${dest}!`, url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); } }}>📤 Share</button>
              <Link href="/user/tours" className="btn btn-primary btn-sm">Book This Tour →</Link>
            </div>
          </div>

          <div className="grid-2" style={{ gap:24 }}>
            <div>
              {dynamicItinerary.map(day=>(
                <div key={day.day} className="card" style={{ marginBottom:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:40,height:40,borderRadius:"50%",background:"var(--gradient-main)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,flexShrink:0 }}>{day.day}</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:16 }}>{day.title}</div>
                        <div style={{ fontSize:12,color:"var(--text-muted)" }}>🕐 Travel: {day.travelTime}</div>
                      </div>
                    </div>
                    <span className="weather-chip">{day.weatherIcon} {day.weather}</span>
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                    {day.places.map(p=><span key={p} className="tag">📍 {p}</span>)}
                  </div>
                  <div style={{ fontSize:13,color:"var(--text-secondary)" }}>
                    🏨 {day.accommodation} &nbsp;·&nbsp; 🍽️ {day.meals.join(", ")}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div className="card">
                <h3 style={{ fontSize:16,fontWeight:700,marginBottom:16 }}>💰 Budget Breakdown</h3>
                {BUDGET_BREAKDOWN.map(item=>(
                  <div key={item.name} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                      <span>{item.name}</span>
                      <span style={{ color:item.color,fontWeight:600 }}>{formatPKR(item.amount)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${item.value}%`,background:item.color }}/></div>
                  </div>
                ))}
                <div className="divider"/>
                <div style={{ display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:18 }}>
                  <span>Total</span><span className="text-gradient">{formatPKR(budget)}</span>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>⚠️ AI Alerts</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  <div className="alert alert-info" style={{ fontSize:13 }}>🌤️ Expect light rain on Day 3. Pack rain gear.</div>
                  <div className="alert alert-success" style={{ fontSize:13 }}>✅ All roads open. No construction delays.</div>
                  <div className="alert alert-warning" style={{ fontSize:13 }}>⚡ Carry warm clothing — nights drop to 5°C.</div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>👥 Group Info</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:8,fontSize:14 }}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text-secondary)" }}>Group Size</span><span>{group} people</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text-secondary)" }}>Per Person</span><span className="text-gradient" style={{ fontWeight:700 }}>{formatPKR(budget)}</span></div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:"var(--text-secondary)" }}>Grand Total</span><span style={{ color:"var(--teal)",fontWeight:800 }}>{formatPKR(budget*group)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="card animate-fade" style={{ maxWidth:600,margin:"0 auto" }}>
          <h2 style={{ fontSize:20,fontWeight:800,marginBottom:20 }}>✅ Review Your Preferences</h2>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {[
              { label:"Destination", value:dest, icon:"📍" },
              { label:"Budget per Person", value:formatPKR(budget), icon:"💰" },
              { label:"Duration", value:`${days} days`, icon:"📅" },
              { label:"Group Size", value:`${group} people`, icon:"👥" },
              { label:"Total Cost", value:formatPKR(budget*group), icon:"💵" },
              { label:"Interests", value:interests.join(", "), icon:"🎯" },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex",gap:12,padding:"12px 16px",background:"var(--bg-secondary)",borderRadius:"var(--radius-md)",alignItems:"center" }}>
                <span style={{ fontSize:20 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,color:"var(--text-muted)" }}>{r.label}</div>
                  <div style={{ fontSize:15,fontWeight:600 }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={generate} className="btn btn-primary btn-lg" style={{ width:"100%",justifyContent:"center",marginTop:24 }} disabled={loading}>
            {loading ? <><span className="loading-spinner"/> Generating...</> : "🤖 Generate Itinerary →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"50vh" }}><span className="loading-spinner"/></div>}>
      <PlannerContent/>
    </Suspense>
  );
}
