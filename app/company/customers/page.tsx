"use client";

const CUSTOMERS = [
  { name:"Ali Hassan", email:"ali@gmail.com", phone:"0300-1234567", tours:3, spent:180000, lastBooking:"2024-05-01", status:"active" },
  { name:"Sara Khan", email:"sara@gmail.com", phone:"0311-7654321", tours:1, spent:56000, lastBooking:"2024-05-10", status:"active" },
  { name:"Umar Farooq", email:"umar@gmail.com", phone:"0333-9876543", tours:2, spent:195000, lastBooking:"2024-05-15", status:"active" },
  { name:"Fatima Malik", email:"fatima@gmail.com", phone:"0321-1111222", tours:4, spent:132000, lastBooking:"2024-04-25", status:"active" },
  { name:"Bilal Ahmed", email:"bilal@gmail.com", phone:"0345-5556666", tours:1, spent:45000, lastBooking:"2024-03-10", status:"inactive" },
];

function formatPKR(n: number) {
  if(n>=1000000) return `PKR ${(n/1000000).toFixed(1)}M`;
  if(n>=1000) return `PKR ${(n/1000).toFixed(0)}K`;
  return `PKR ${n}`;
}

export default function CompanyCustomersPage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">👥 Customers</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{CUSTOMERS.length} Customers</span>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:"Total Customers", value:CUSTOMERS.length, color:"var(--teal)", icon:"👥" },
          { label:"Active", value:CUSTOMERS.filter(c=>c.status==="active").length, color:"var(--emerald)", icon:"✅" },
          { label:"Total Spent", value:formatPKR(CUSTOMERS.reduce((s,c)=>s+c.spent,0)), color:"var(--gold)", icon:"💰" },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Customer</th><th>Contact</th><th>Tours Taken</th><th>Total Spent</th><th>Last Booking</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c,i)=>(
                <tr key={i}>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div className="avatar" style={{ width:34,height:34,fontSize:13,flexShrink:0 }}>{c.name.charAt(0)}</div>
                      <div style={{ fontWeight:600 }}>{c.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize:13 }}>{c.email}</div>
                    <div style={{ fontSize:12,color:"var(--text-muted)" }}>{c.phone}</div>
                  </td>
                  <td style={{ fontWeight:700,color:"var(--teal)" }}>{c.tours}</td>
                  <td style={{ fontWeight:700,color:"var(--gold)" }}>{formatPKR(c.spent)}</td>
                  <td style={{ color:"var(--text-secondary)",fontSize:13 }}>{c.lastBooking}</td>
                  <td><span className={`badge ${c.status==="active"?"badge-emerald":"badge-rose"}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      <button className="btn btn-secondary btn-sm">View</button>
                      <button className="btn btn-secondary btn-sm">📧 Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
