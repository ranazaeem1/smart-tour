"use client";
import { REVIEWS, getStatusColor } from "@/lib/data";
import { useState } from "react";

const SENTIMENT_STATS = [
  { label:"Positive", value:78, color:"var(--emerald)", icon:"😊" },
  { label:"Neutral", value:15, color:"var(--gold)", icon:"😐" },
  { label:"Negative", value:7, color:"var(--rose)", icon:"😞" },
];

export default function CompanyReviewsPage() {
  const [filter, setFilter] = useState("all");
  const reviews = filter === "all" ? REVIEWS : REVIEWS.filter(r => r.sentiment === filter);

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">⭐ Reviews & Sentiment</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{REVIEWS.length} Total Reviews</span>
        </div>
      </div>

      {/* Sentiment overview */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {SENTIMENT_STATS.map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:28 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}%</div>
            <div className="stat-label">{s.label} Reviews</div>
            <div className="progress-bar" style={{ marginTop:8 }}>
              <div className="progress-fill" style={{ width:`${s.value}%`,background:s.color }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="tabs" style={{ marginBottom:20,width:"fit-content" }}>
        {["all","positive","neutral","negative"].map(f=>(
          <button key={f} className={`tab-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {reviews.map(r=>(
          <div key={r.id} className="card" style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                <div className="avatar" style={{ width:40,height:40,fontSize:14,flexShrink:0 }}>{r.userName.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight:700,fontSize:15 }}>{r.userName}</div>
                  <div style={{ fontSize:12,color:"var(--text-muted)" }}>{r.tourTitle} · {r.date}</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <div style={{ color:"var(--gold)",fontSize:16 }}>{"⭐".repeat(r.rating)}</div>
                <span className={`badge ${getStatusColor(r.sentiment)}`}>{r.sentiment}</span>
              </div>
            </div>
            <p style={{ fontSize:14,color:"var(--text-secondary)",lineHeight:1.7,margin:0 }}>&quot;{r.comment}&quot;</p>
            <div style={{ marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:12,color:"var(--text-muted)" }}>👍 {r.helpful} people found this helpful</span>
              <button className="btn btn-secondary btn-sm">↩️ Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
