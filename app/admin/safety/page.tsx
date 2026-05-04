"use client";
import { useEffect, useState } from "react";
import { fetchSafetyZones, fetchSafetyAlerts, createSafetyAlert, dismissSafetyAlert } from "@/lib/db";

interface SafetyZone {
  id: string; area: string; score: number; status: string; updated_at: string;
}

interface SafetyAlert {
  id: string; area: string; type: string; severity: string; description: string; active: boolean; created_at: string;
}

const severityColor: Record<string, string> = {
  high: "var(--rose)", medium: "var(--gold)", low: "var(--emerald)"
};

const scoreColor = (score: number) =>
  score >= 90 ? "#14D2BE" : score >= 80 ? "#10B981" : score >= 70 ? "#F59E0B" : "#EF4444";

export default function AdminSafetyPage() {
  const [zones, setZones] = useState<SafetyZone[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    area: "", type: "Road Closure", severity: "medium" as "low" | "medium" | "high", description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [zonesData, alertsData] = await Promise.all([
        fetchSafetyZones(),
        fetchSafetyAlerts(true),
      ]);
      setZones(zonesData as SafetyZone[]);
      setAlerts(alertsData as SafetyAlert[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleDismiss = async (id: string) => {
    setDismissingId(id);
    const ok = await dismissSafetyAlert(id);
    if (ok) setAlerts(prev => prev.filter(a => a.id !== id));
    setDismissingId(null);
  };

  const handleIssueAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.area || !form.description) return;
    setSubmitting(true);
    const newAlert = await createSafetyAlert(form);
    if (newAlert) setAlerts(prev => [newAlert as SafetyAlert, ...prev]);
    setForm({ area: "", type: "Road Closure", severity: "medium", description: "" });
    setShowForm(false);
    setSubmitting(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

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
          <h1 className="topbar-title">🛡️ Safety Alerts Management</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Cancel" : "+ Issue Alert"}
          </button>
        </div>
      </div>

      {/* Issue Alert Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: "1px solid var(--border-active)" }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>📣 Issue New Safety Alert</h3>
          <form onSubmit={handleIssueAlert} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Area</label>
              <input className="input" placeholder="e.g. Hunza Valley" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Alert Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>Road Closure</option>
                <option>Weather Alert</option>
                <option>Security Notice</option>
                <option>All Clear</option>
                <option>Flood Warning</option>
                <option>Landslide Risk</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Severity</label>
              <select className="input" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as "low" | "medium" | "high" }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">Description</label>
              <textarea className="input" rows={2} placeholder="Describe the alert..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={{ resize: "vertical", minHeight: 60 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="loading-spinner" /> : "🚨 Issue Alert"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Safety Scores */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 Safety Scores</h2>
          {zones.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No safety zones configured.</p>
          ) : (
            zones.map(zone => (
              <div key={zone.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{zone.area}</span>
                  <span style={{ fontWeight: 700, color: scoreColor(zone.score) }}>{zone.score}/100 — {zone.status}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${zone.score}%`, background: scoreColor(zone.score) }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>⚠️ Active Alerts</h2>
            <span className="badge badge-rose">{alerts.length} Active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p>All clear — no active alerts.</p>
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} style={{ padding: "14px 16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: `1px solid ${severityColor[a.severity]}40` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: severityColor[a.severity] }}>📍 {a.area}</span>
                      <span className="badge" style={{ background: `${severityColor[a.severity]}20`, color: severityColor[a.severity], border: `1px solid ${severityColor[a.severity]}40`, fontSize: 10 }}>{a.type}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{timeAgo(a.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{a.description}</p>
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm">✏️ Edit</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDismiss(a.id)}
                      disabled={dismissingId === a.id}
                    >
                      {dismissingId === a.id ? "Removing..." : "🗑️ Dismiss"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
