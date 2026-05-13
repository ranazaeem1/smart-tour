"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DESTINATIONS, SAFETY_ZONES, formatPKR } from "@/lib/data";

function GroupTravelContent() {
  const params = useSearchParams();
  const initialDest = params.get("dest") || "Hunza Valley";
  const initialBudget = Number(params.get("budget")) || 45000;

  const [dest, setDest] = useState(initialDest);
  const [email, setEmail] = useState("");
  // Start with just the planner (you) instead of dummy data
  const [members, setMembers] = useState([
    { name: "You (Planner)", email: "me@example.com", status: "accepted", budget: initialBudget }
  ]);

  const avgBudget = Math.round(members.reduce((s,m)=>s+m.budget,0)/members.length);
  const totalBudget = members.reduce((s,m)=>s+m.budget,0);
  const accepted = members.filter(m=>m.status==="accepted").length;

  const addMember = () => {
    if (!email.trim() || !email.includes("@")) return;
    setMembers(p => [
      ...p,
      { name: email.split("@")[0], email, status: "pending", budget: 45000 }
    ]);
    setEmail("");
  };

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Plan Together</div>
          <h1 className="topbar-title">👥 Group Travel Planning</h1>
        </div>
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          {/* Group Overview */}
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(20,210,190,0.05))",border:"1px solid rgba(124,58,237,0.2)" }}>
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🎯 Group Overview</h2>
            <div className="grid-2" style={{ gap:12,marginBottom:16 }}>
              {[
                { label:"Members", value:`${members.length} People`, icon:"👤" },
                { label:"Confirmed", value:`${accepted}/${members.length}`, icon:"✅" },
                { label:"Avg Budget", value:formatPKR(avgBudget), icon:"💰" },
                { label:"Total Budget", value:formatPKR(totalBudget), icon:"💵" },
              ].map(s=>(
                <div key={s.label} style={{ padding:"12px 14px",background:"var(--bg-secondary)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:18,marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontWeight:800,fontSize:16,color:"var(--teal)" }}>{s.value}</div>
                  <div style={{ fontSize:12,color:"var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="input-group">
              <label className="input-label">Destination</label>
              <select className="input" value={dest} onChange={e=>setDest(e.target.value)}>
                {DESTINATIONS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Group Composition */}
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontSize:18,fontWeight:700,margin:0 }}>👥 Group Composition</h2>
              <button 
                onClick={() => {
                  const newGuestNum = members.length + 1;
                  setMembers(p => [...p, { name: `Traveler ${newGuestNum}`, email: `traveler${newGuestNum}@example.com`, status: "accepted", budget: 45000 }]);
                }} 
                className="btn btn-primary btn-sm"
              >
                + Add traveler
              </button>
            </div>
            
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {members.map((m,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--bg-secondary)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)" }}>
                  <div className="avatar" style={{ width:34,height:34,fontSize:12,flexShrink:0 }}>{m.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:14,fontWeight:600 }}>{m.name}</div>
                      {i !== 0 && (
                        <button 
                          onClick={() => setMembers(p => p.filter((_, idx) => idx !== i))}
                          style={{ background:"none", border:"none", color:"var(--rose)", fontSize:11, cursor:"pointer", fontWeight:600 }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize:12,color:"var(--text-secondary)" }}>Individual Budget: {formatPKR(m.budget)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          {/* Date Coordination */}
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>📅 Date Coordination</h2>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {["2024-06-15","2024-06-22","2024-07-01"].map((date,i)=>(
                <div key={date} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:i===0?"var(--teal-glow)":"var(--bg-secondary)",borderRadius:"var(--radius-md)",border:`1px solid ${i===0?"var(--border-active)":"var(--border)"}` }}>
                  <div style={{ fontSize:18 }}>📅</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,fontSize:14 }}>{date}</div>
                    <div style={{ fontSize:12,color:"var(--text-muted)" }}>{i===0?"✅ Most preferred":"Possible date"}</div>
                  </div>
                  <div style={{ display:"flex",gap:4 }}>
                    {members.slice(0,i===0?4:2).map((m,j)=>(
                      <div key={j} className="avatar" style={{ width:24,height:24,fontSize:10,marginLeft:-6 }}>{m.name.charAt(0)}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Splitting */}
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>💰 Cost Splitting</h2>
            <div style={{ fontSize:13,color:"var(--text-secondary)",marginBottom:14 }}>
              Based on selected destination: <strong style={{ color:"var(--teal)" }}>{dest}</strong>
            </div>
            {members.map((m,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",fontSize:14 }}>
                <span style={{ fontWeight:500 }}>{m.name}</span>
                <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                  <span style={{ color:"var(--text-secondary)" }}>Budget: {formatPKR(m.budget)}</span>
                  <span style={{ color:"var(--teal)",fontWeight:700 }}>Share: {formatPKR(Math.round(totalBudget/members.length))}</span>
                </div>
              </div>
            ))}
            <div style={{ display:"flex",justifyContent:"space-between",paddingTop:12,fontWeight:800,fontSize:17 }}>
              <span>Grand Total</span>
              <span className="text-gradient">{formatPKR(totalBudget)}</span>
            </div>
          </div>

          {/* Safety for group */}
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:12 }}>🛡️ Group Safety Check</h2>
            {SAFETY_ZONES.slice(0,3).map(z=>(
              <div key={z.area} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--bg-secondary)",borderRadius:"var(--radius-md)",marginBottom:8,border:"1px solid var(--border)" }}>
                <span style={{ fontSize:13,fontWeight:500 }}>{z.area}</span>
                <span style={{ fontWeight:700,color:z.color }}>{z.status} ({z.score}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GroupTravelPage() {
  return (
    <Suspense fallback={<div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"50vh" }}><span className="loading-spinner"/></div>}>
      <GroupTravelContent />
    </Suspense>
  );
}
