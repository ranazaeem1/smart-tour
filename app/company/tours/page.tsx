"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTours, updateTour, fetchCompanyByOwner } from "@/lib/db";
import { TOURS, formatPKR } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

interface Tour {
  id: string; title: string; destination: string; price: number;
  duration: number; rating: number; safety_score?: number; safetyScore?: number;
  available: boolean; category: string; difficulty: string;
  companies?: { name: string } | null; company?: string;
  image_url?: string | null; image?: string;
  tags?: string[]; review_count?: number; reviews?: number;
}

export default function CompanyToursPage() {
  const { profile } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (profile?.id) {
          const company = await fetchCompanyByOwner(profile.id);
          let data: Tour[] = [];
          if (company && company.id) {
            const raw = await fetchTours({ companyId: company.id });
            data = raw as Tour[];
          }
          setTours(data.length > 0 ? data : []);
        } else {
          setTours([]);
        }
      } catch (err) {
        console.error("Failed to load tours:", err);
        setTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  const getSafety = (t: Tour) => t.safety_score || t.safetyScore || 80;
  const getImg = (t: Tour) => t.image_url || t.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400";

  const handleToggle = async (id: string, current: boolean) => {
    setUpdatingId(id);
    await updateTour(id, { available: !current });
    setTours(prev => prev.map(t => t.id === id ? { ...t, available: !current } : t));
    setUpdatingId(null);
  };

  const filtered = tours
    .filter(t => filterStatus === "all" || (filterStatus === "active" ? t.available : !t.available))
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Company Panel</div>
          <h1 className="topbar-title">🏔️ My Tour Packages</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{tours.filter(t => t.available).length} Active</span>
          <Link href="/company/tours/new" className="btn btn-primary">+ Add New Tour</Link>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="input-label">🔍 Search Tours</label>
            <input className="input" placeholder="Search by name or destination..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs" style={{ alignSelf: "flex-end" }}>
            {["all", "active", "inactive"].map(f => (
              <button key={f} className={`tab-btn ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏔️</div>
          <h3 style={{ marginBottom: 8 }}>No tours found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            {search ? "Try a different search term." : "Start by adding your first tour package."}
          </p>
          <Link href="/company/tours/new" className="btn btn-primary">+ Add First Tour</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(tour => (
            <div key={tour.id} className="card" style={{ display: "flex", gap: 0, padding: 0, overflow: "hidden" }}>
              <img
                src={getImg(tour)}
                alt={tour.title}
                style={{ width: 180, height: 140, objectFit: "cover", flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"; }}
              />
              <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{tour.title}</h3>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        📍 {tour.destination} · {tour.duration} days · {tour.difficulty}
                      </div>
                    </div>
                    <span className={`badge ${tour.available ? "badge-emerald" : "badge-rose"}`}>
                      {tour.available ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {(tour.tags || []).slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 12, borderTop: "1px solid var(--border)", marginTop: 8, flexWrap: "wrap" }}>
                  <span className="price" style={{ fontSize: 16 }}>{formatPKR(tour.price)}</span>
                  <span style={{ fontSize: 13, color: "var(--gold)" }}>⭐ {tour.rating}</span>
                  <span style={{ fontSize: 13, color: "var(--emerald)" }}>🛡️ {getSafety(tour)}%</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                      className={`btn btn-sm ${tour.available ? "btn-danger" : "btn-primary"}`}
                      onClick={() => handleToggle(tour.id, tour.available)}
                      disabled={updatingId === tour.id}
                    >
                      {updatingId === tour.id ? "..." : tour.available ? "⏸️ Deactivate" : "▶️ Activate"}
                    </button>
                    <Link href={`/company/tours/new?edit=${tour.id}`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
                    <Link href="/company/bookings" className="btn btn-secondary btn-sm">📋 Bookings</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
