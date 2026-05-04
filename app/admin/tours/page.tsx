"use client";
import { TOURS, formatPKR } from "@/lib/data";
import { useState } from "react";

export default function AdminToursPage() {
  const [search, setSearch] = useState("");
  const filtered = TOURS.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Admin Panel</div>
          <h1 className="topbar-title">🏔️ All Tours</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{TOURS.length} Tours Listed</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div className="input-group">
          <label className="input-label">🔍 Search Tours</label>
          <input className="input" placeholder="Search by title or destination..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Tour</th><th>Company</th><th>Destination</th><th>Price</th><th>Duration</th><th>Rating</th><th>Safety</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td style={{ fontWeight:600,maxWidth:200 }}>{t.title}</td>
                  <td style={{ color:"var(--text-secondary)",fontSize:13 }}>{t.company}</td>
                  <td style={{ color:"var(--text-secondary)" }}>{t.destination}</td>
                  <td style={{ color:"var(--teal)",fontWeight:700 }}>{formatPKR(t.price)}</td>
                  <td style={{ color:"var(--text-secondary)" }}>{t.duration}d</td>
                  <td style={{ color:"var(--gold)",fontWeight:700 }}>⭐ {t.rating}</td>
                  <td>
                    <span style={{ color:t.safetyScore>=90?"var(--emerald)":t.safetyScore>=80?"var(--gold)":"var(--rose)",fontWeight:700 }}>
                      {t.safetyScore}%
                    </span>
                  </td>
                  <td><span className={`badge ${t.available?"badge-emerald":"badge-rose"}`}>{t.available?"Active":"Inactive"}</span></td>
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      <button className="btn btn-secondary btn-sm">View</button>
                      <button className="btn btn-danger btn-sm">Remove</button>
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
