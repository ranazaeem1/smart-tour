"use client";
export default function CompanySettingsPage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">⚙️ Company Settings</h1>
        </div>
      </div>
      <div className="grid-2" style={{ gap:24 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>🏢 Company Profile</h2>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div className="input-group"><label className="input-label">Company Name</label><input className="input" defaultValue="Northern Trails Co."/></div>
              <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" defaultValue="info@northerntrails.pk"/></div>
              <div className="input-group"><label className="input-label">Phone</label><input className="input" defaultValue="0300-1234567"/></div>
              <div className="input-group"><label className="input-label">City</label><select className="input"><option>Gilgit</option><option>Skardu</option><option>Islamabad</option><option>Lahore</option></select></div>
              <div className="input-group"><label className="input-label">Description</label><textarea className="input" rows={3} defaultValue="Leading adventure tour company in northern Pakistan since 2010."/></div>
              <button className="btn btn-primary" style={{ alignSelf:"flex-start" }}>💾 Save Changes</button>
            </div>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>🔔 Notifications</h2>
            {["New booking alerts","Payment received","Customer reviews","Tour cancellations","Weekly revenue report"].map((item,i)=>(
              <label key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)",cursor:"pointer" }}>
                <span style={{ fontSize:14 }}>{item}</span>
                <label className="switch"><input type="checkbox" defaultChecked={i<3}/><span className="switch-slider"/></label>
              </label>
            ))}
          </div>
          <div className="card">
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:16 }}>🔐 Security</h2>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div className="input-group"><label className="input-label">Current Password</label><input className="input" type="password" placeholder="••••••••"/></div>
              <div className="input-group"><label className="input-label">New Password</label><input className="input" type="password" placeholder="••••••••"/></div>
              <button className="btn btn-secondary btn-sm" style={{ alignSelf:"flex-start" }}>🔑 Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
