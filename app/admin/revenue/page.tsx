"use client";
import { MONTHLY_REVENUE, formatPKR } from "@/lib/data";

const maxRev = Math.max(...MONTHLY_REVENUE.map(m=>m.revenue));

export default function AdminRevenuePage() {
  const totalRevenue = MONTHLY_REVENUE.reduce((s,m)=>s+m.revenue,0);
  const platformCut = Math.round(totalRevenue * 0.1);

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Admin Panel</div>
          <h1 className="topbar-title">💰 Platform Revenue</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm">📥 Export Report</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:"Gross Revenue", value:formatPKR(totalRevenue), color:"var(--teal)", icon:"💰" },
          { label:"Platform Cut (10%)", value:formatPKR(platformCut), color:"var(--gold)", icon:"🏦" },
          { label:"Total Bookings", value:MONTHLY_REVENUE.reduce((s,m)=>s+m.bookings,0), color:"var(--purple-light)", icon:"📋" },
          { label:"Best Month", value:"July", color:"var(--emerald)", icon:"📈" },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color,fontSize:20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:24 }}>
        <div className="section-header">
          <h2 className="section-title">📊 Platform Revenue 2024</h2>
          <span className="badge badge-gold">{formatPKR(totalRevenue)} Gross</span>
        </div>
        <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:200,paddingBottom:32,paddingTop:16 }}>
          {MONTHLY_REVENUE.map((m,i)=>(
            <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <div style={{ fontSize:9,color:"var(--text-muted)",marginBottom:2 }}>{formatPKR(m.revenue)}</div>
              <div style={{ width:"75%",borderRadius:"4px 4px 0 0",
                background:`linear-gradient(180deg,var(--gold),var(--purple))`,
                height:`${(m.revenue/maxRev)*150}px`,minHeight:8,transition:"height 0.6s ease" }}/>
              <div style={{ fontSize:10,color:"var(--text-muted)",transform:"rotate(-45deg)" }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="section-title">📅 Monthly Breakdown</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Month</th><th>Bookings</th><th>Gross Revenue</th><th>Platform Cut</th><th>Company Payouts</th></tr>
            </thead>
            <tbody>
              {MONTHLY_REVENUE.map(m=>(
                <tr key={m.month}>
                  <td style={{ fontWeight:600 }}>{m.month} 2024</td>
                  <td style={{ color:"var(--text-secondary)" }}>{m.bookings}</td>
                  <td style={{ color:"var(--teal)",fontWeight:700 }}>{formatPKR(m.revenue)}</td>
                  <td style={{ color:"var(--gold)",fontWeight:600 }}>{formatPKR(Math.round(m.revenue*0.1))}</td>
                  <td style={{ color:"var(--purple-light)",fontWeight:600 }}>{formatPKR(Math.round(m.revenue*0.9))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
