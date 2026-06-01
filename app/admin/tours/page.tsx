"use client";
import { useEffect, useState } from "react";
import { fetchTours } from "@/lib/db";
import { formatPKR } from "@/lib/data";

interface Tour {
  id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  rating: number;
  safety_score: number;
  available: boolean;
  companies?: {
    name: string;
  } | null;
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTours({ admin: true });
        if (data) {
          setTours(data as unknown as Tour[]);
        }
      } catch (err) {
        console.error("Error loading admin tours:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = tours.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin Panel</div>
          <h1 className="topbar-title">🏔️ All Tours</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{tours.length} Tours Listed</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="input-group">
          <label className="input-label">🔍 Search Tours</label>
          <input className="input" placeholder="Search by title or destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Tour</th><th>Company</th><th>Destination</th><th>Price</th><th>Duration</th><th>Rating</th><th>Safety</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No tours found
                  </td>
                </tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{t.title}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.companies?.name || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{t.destination}</td>
                  <td style={{ color: "var(--teal)", fontWeight: 700 }}>{formatPKR(t.price)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{t.duration}d</td>
                  <td style={{ color: "var(--gold)", fontWeight: 700 }}>⭐ {t.rating}</td>
                  <td>
                    <span style={{ color: t.safety_score >= 90 ? "var(--emerald)" : t.safety_score >= 80 ? "var(--gold)" : "var(--rose)", fontWeight: 700 }}>
                      {t.safety_score}%
                    </span>
                  </td>
                  <td><span className={`badge ${t.available ? "badge-emerald" : "badge-rose"}`}>{t.available ? "Active" : "Inactive"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
