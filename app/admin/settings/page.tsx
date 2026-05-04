"use client";
export default function AdminSettingsPage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Admin Panel</div>
          <h1 className="topbar-title">⚙️ Platform Settings</h1>
        </div>
      </div>
      <div className="grid-2" style={{ gap:24 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>🏔️ Platform Configuration</h2>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div className="input-group"><label className="input-label">Platform Name</label><input className="input" defaultValue="Smart Tour Pakistan"/></div>
              <div className="input-group"><label className="input-label">Commission Rate (%)</label><input className="input" type="number" defaultValue="10"/></div>
              <div className="input-group"><label className="input-label">Support Email</label><input className="input" type="email" defaultValue="support@smarttour.pk"/></div>
              <div className="input-group"><label className="input-label">Support Phone</label><input className="input" defaultValue="0800-SMARTTOUR"/></div>
              <button className="btn btn-primary" style={{ alignSelf:"flex-start" }}>💾 Save Settings</button>
            </div>
          </div>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🔒 Security Settings</h2>
            {["Require email verification","Two-factor authentication for admins","Auto-suspend flagged accounts","Require company documents for approval"].map((item,i)=>(
              <label key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)",cursor:"pointer" }}>
                <span style={{ fontSize:14 }}>{item}</span>
                <label className="switch"><input type="checkbox" defaultChecked={i<2}/><span className="switch-slider"/></label>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>📊 Platform Status</h2>
            {[
              { label:"Total Users", value:"10,420", color:"var(--teal)" },
              { label:"Active Tours", value:"230", color:"var(--emerald)" },
              { label:"Companies", value:"45", color:"var(--purple-light)" },
              { label:"Uptime", value:"99.9%", color:"var(--gold)" },
            ].map(r=>(
              <div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)",fontSize:14 }}>
                <span style={{ color:"var(--text-secondary)" }}>{r.label}</span>
                <span style={{ fontWeight:700,color:r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🔔 Notification Settings</h2>
            {["New company registration","Safety alerts","Revenue milestones","System errors"].map((item,i)=>(
              <label key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)",cursor:"pointer" }}>
                <span style={{ fontSize:14 }}>{item}</span>
                <label className="switch"><input type="checkbox" defaultChecked/><span className="switch-slider"/></label>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
