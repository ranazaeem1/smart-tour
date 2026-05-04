"use client";
import { MONTHLY_REVENUE } from "@/lib/data";

const maxBookings = Math.max(...MONTHLY_REVENUE.map(m=>m.bookings));

export default function AdminAnalyticsPage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Admin Panel</div>
          <h1 className="topbar-title">📊 Platform Analytics</h1>
        </div>
      </div>

      <div className="grid-2" style={{ gap:24,marginBottom:24 }}>
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">📅 Monthly Bookings</h2>
          </div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:180,paddingBottom:28 }}>
            {MONTHLY_REVENUE.map(m=>(
              <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <div style={{ fontSize:9,color:"var(--text-muted)",marginBottom:2 }}>{m.bookings}</div>
                <div style={{ width:"70%",borderRadius:"4px 4px 0 0",
                  background:`linear-gradient(180deg,var(--teal),var(--teal-dark))`,
                  height:`${(m.bookings/maxBookings)*140}px`,minHeight:4 }}/>
                <div style={{ fontSize:10,color:"var(--text-muted)" }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🏆 Top Destinations</h2>
          {[
            { name:"Hunza Valley", bookings:342, pct:78 },
            { name:"Skardu", bookings:228, pct:52 },
            { name:"Swat Valley", bookings:195, pct:44 },
            { name:"Naran Kaghan", bookings:167, pct:38 },
            { name:"Fairy Meadows", bookings:98, pct:22 },
          ].map(d=>(
            <div key={d.name} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4 }}>
                <span style={{ fontWeight:600 }}>{d.name}</span>
                <span style={{ color:"var(--teal)" }}>{d.bookings} bookings</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${d.pct}%` }}/></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ gap:24 }}>
        {[
          { title:"User Growth", stats:[{label:"This Month",val:"234 new"},{label:"Last Month",val:"198 new"},{label:"Growth",val:"+18%"}] },
          { title:"Tour Performance", stats:[{label:"Most Booked",val:"Hunza Explorer"},{label:"Best Rated",val:"Fairy Meadows"},{label:"Avg Duration",val:"6.2 days"}] },
          { title:"Revenue Health", stats:[{label:"Avg Booking",val:"PKR 145K"},{label:"Platform Fee",val:"PKR 5M"},{label:"MoM Growth",val:"+12%"}] },
        ].map(s=>(
          <div key={s.title} className="card">
            <h3 style={{ fontSize:16,fontWeight:700,marginBottom:16 }}>{s.title}</h3>
            {s.stats.map(r=>(
              <div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13 }}>
                <span style={{ color:"var(--text-secondary)" }}>{r.label}</span>
                <span style={{ fontWeight:700,color:"var(--teal)" }}>{r.val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
