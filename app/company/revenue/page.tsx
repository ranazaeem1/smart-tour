"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchRevenueStats, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";

export default function CompanyRevenuePage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; bookings: number }[]>([]);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        if (company) {
          const stats = await fetchRevenueStats(company.id);
          setRevenueData(stats);
        }
      } catch (err) {
        console.error("Failed to load revenue stats:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const totalRevenue = revenueData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = revenueData.reduce((s, m) => s + m.bookings, 0);
  const maxRev = Math.max(...revenueData.map(m => m.revenue), 1);
  
  const currentMonthIdx = new Date().getMonth();
  const currentMonthStats = revenueData[currentMonthIdx] || { revenue: 0 };

  if (loading || authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">💰 Revenue & Analytics</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>📥 Export Report</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:"Total Revenue", value:formatPKR(totalRevenue), color:"var(--teal)", icon:"💰" },
          { label:"Total Bookings", value:totalBookings, color:"var(--purple-light)", icon:"📋" },
          { label:"Avg per Booking", value:totalBookings > 0 ? formatPKR(Math.round(totalRevenue/totalBookings)) : "PKR 0", color:"var(--gold)", icon:"📊" },
          { label:"This Month", value:formatPKR(currentMonthStats.revenue), color:"var(--emerald)", icon:"📈" },
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
          <h2 className="section-title">📈 Monthly Revenue ({new Date().getFullYear()})</h2>
          <span className="badge badge-teal">{formatPKR(totalRevenue)} Total</span>
        </div>
        <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:200,paddingBottom:32,paddingTop:16 }}>
          {revenueData.map((m,i)=>(
            <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <div style={{ fontSize:10,color:"var(--text-muted)",marginBottom:4 }}>{m.revenue > 0 ? formatPKR(m.revenue) : ""}</div>
              <div style={{ position:"relative",width:"100%",display:"flex",justifyContent:"center" }}>
                <div style={{ 
                  width:"70%",borderRadius:"4px 4px 0 0",background:`linear-gradient(180deg,var(--teal),var(--purple))`,
                  height:`${(m.revenue/maxRev)*150}px`,minHeight:2,transition:"height 0.6s ease",
                  boxShadow:i===currentMonthIdx?"0 0 12px rgba(20,210,190,0.5)":"none" }}/>
              </div>
              <div style={{ fontSize:11,color:i===currentMonthIdx?"var(--teal)":"var(--text-muted)",fontWeight:i===currentMonthIdx?700:400 }}>{m.month}</div>
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
              {revenueData.filter(m => m.revenue > 0 || m.bookings > 0).map((m,i, arr)=>{
                const prev = i > 0 ? arr[i-1].revenue : m.revenue;
                const growth = i === 0 ? 0 : Math.round(((m.revenue-prev)/prev)*100);
                return (
                  <tr key={m.month}>
                    <td style={{ fontWeight:600 }}>{m.month} {new Date().getFullYear()}</td>
                    <td>{m.bookings}</td>
                    <td style={{ color:"var(--teal)",fontWeight:700 }}>{formatPKR(m.revenue)}</td>
                    <td>{m.bookings > 0 ? formatPKR(Math.round(m.revenue/m.bookings)) : "—"}</td>
                    <td>
                      <span style={{ color:growth>=0?"var(--emerald)":"var(--rose)",fontWeight:600 }}>
                        {growth>=0?`+${growth}%`:` ${growth}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {revenueData.every(m => m.revenue === 0) && (
                <tr><td colSpan={5} style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>No revenue data available yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
