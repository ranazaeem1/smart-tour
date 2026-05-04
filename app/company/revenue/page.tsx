"use client";
import { MONTHLY_REVENUE, BOOKINGS, formatPKR } from "@/lib/data";

const maxRev = Math.max(...MONTHLY_REVENUE.map(m=>m.revenue));
const totalRevenue = MONTHLY_REVENUE.reduce((s,m)=>s+m.revenue,0);
const totalBookings = MONTHLY_REVENUE.reduce((s,m)=>s+m.bookings,0);

export default function CompanyRevenuePage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">💰 Revenue & Analytics</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm">📥 Export Report</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:"Total Revenue", value:formatPKR(totalRevenue), color:"var(--teal)", icon:"💰" },
          { label:"Total Bookings", value:totalBookings, color:"var(--purple-light)", icon:"📋" },
          { label:"Avg per Booking", value:formatPKR(Math.round(totalRevenue/totalBookings)), color:"var(--gold)", icon:"📊" },
          { label:"This Month", value:formatPKR(MONTHLY_REVENUE[6].revenue), color:"var(--emerald)", icon:"📈" },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color,fontSize:22 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="section-header">
          <h2 className="section-title">📈 Monthly Revenue (2024)</h2>
          <span className="badge badge-teal">{formatPKR(totalRevenue)} Total</span>
        </div>
        <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:200,paddingBottom:32,paddingTop:16 }}>
          {MONTHLY_REVENUE.map((m,i)=>(
            <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <div style={{ fontSize:10,color:"var(--text-muted)",marginBottom:4 }}>{formatPKR(m.revenue)}</div>
              <div style={{ position:"relative",width:"100%",display:"flex",justifyContent:"center" }}>
                <div style={{ width:"70%",borderRadius:"4px 4px 0 0",background:`linear-gradient(180deg,var(--teal),var(--purple))`,
                  height:`${(m.revenue/maxRev)*150}px`,minHeight:8,transition:"height 0.6s ease",
                  boxShadow:i===6?"0 0 12px rgba(20,210,190,0.5)":"none" }}/>
              </div>
              <div style={{ fontSize:11,color:i===6?"var(--teal)":"var(--text-muted)",fontWeight:i===6?700:400 }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">📅 Monthly Breakdown</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Month</th><th>Bookings</th><th>Revenue</th><th>Avg per Booking</th><th>Growth</th></tr>
            </thead>
            <tbody>
              {MONTHLY_REVENUE.map((m,i)=>{
                const prev = i>0?MONTHLY_REVENUE[i-1].revenue:m.revenue;
                const growth = i===0?0:Math.round(((m.revenue-prev)/prev)*100);
                return (
                  <tr key={m.month}>
                    <td style={{ fontWeight:600 }}>{m.month} 2024</td>
                    <td>{m.bookings}</td>
                    <td style={{ color:"var(--teal)",fontWeight:700 }}>{formatPKR(m.revenue)}</td>
                    <td>{formatPKR(Math.round(m.revenue/m.bookings))}</td>
                    <td>
                      <span style={{ color:growth>=0?"var(--emerald)":"var(--rose)",fontWeight:600 }}>
                        {growth>=0?`+${growth}%`:` ${growth}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
