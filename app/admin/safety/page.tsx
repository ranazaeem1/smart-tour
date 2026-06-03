"use client";

import { useEffect, useState } from "react";
import { createSafetyAlert, dismissSafetyAlert, fetchSafetyAlerts, fetchSafetyZones } from "@/lib/db";
import { Activity, AlertTriangle, CheckCircle2, MapPin, Plus, ShieldAlert, Trash2, X } from "lucide-react";

interface SafetyZone {
  id: string;
  area: string;
  score: number;
  status: string;
  updated_at: string;
}

interface SafetyAlert {
  id: string;
  area: string;
  type: string;
  severity: string;
  description: string;
  active: boolean;
  created_at: string;
}

const severityStyle: Record<string, { text: string; bg: string; border: string }> = {
  high: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  medium: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  low: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
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
    area: "",
    type: "Road Closure",
    severity: "medium" as "low" | "medium" | "high",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [zonesData, alertsData] = await Promise.all([fetchSafetyZones(), fetchSafetyAlerts(true)]);
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
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Risk Operations</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Safety Alerts Management</h1>
        </div>

        <button
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            showForm ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-950 text-white hover:bg-emerald-600"
          }`}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Issue Alert"}
        </button>
      </div>

      {showForm && (
        <section className="bg-white border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-950 mb-6">Issue New Safety Alert</h2>
          <form onSubmit={handleIssueAlert} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="input-group">
              <label className="input-label">Area</label>
              <input className="input !py-4" placeholder="e.g. Hunza Valley" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Alert Type</label>
              <select className="input !py-4" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
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
              <select className="input !py-4" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as "low" | "medium" | "high" }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="input-group md:col-span-2">
              <label className="input-label">Description</label>
              <textarea className="input min-h-[120px] resize-y !py-4" rows={3} placeholder="Describe the alert..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-600 disabled:opacity-60" disabled={submitting}>
                {submitting ? "Issuing..." : "Issue Alert"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Regional Matrix</p>
              <h2 className="text-xl font-black text-slate-950 m-0">Safety Scores</h2>
            </div>
            <Activity className="text-emerald-500" size={22} />
          </div>

          <div className="space-y-5">
            {zones.length === 0 ? (
              <p className="text-center py-10 text-slate-500 font-bold">No safety zones configured.</p>
            ) : (
              zones.map(zone => (
                <article key={zone.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-950 m-0">{zone.area}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{zone.status}</p>
                    </div>
                    <span className="text-2xl font-black" style={{ color: scoreColor(zone.score) }}>{zone.score}/100</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-md bg-white border border-slate-100">
                    <div className="h-full rounded-md transition-all" style={{ width: `${zone.score}%`, background: scoreColor(zone.score) }} />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Operations</p>
              <h2 className="text-xl font-black text-slate-950 m-0">Active Alerts</h2>
            </div>
            <span className="badge badge-rose !rounded-full !px-4 !py-1.5">{alerts.length} Active</span>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle2 size={42} className="mx-auto mb-3 text-emerald-500" />
                <p className="font-bold">All clear. No active alerts.</p>
              </div>
            ) : (
              alerts.map(alert => {
                const style = severityStyle[alert.severity] || severityStyle.medium;
                return (
                  <article key={alert.id} className={`rounded-2xl border ${style.border} ${style.bg} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className={`flex items-center gap-2 font-black ${style.text}`}>
                          <MapPin size={15} />
                          {alert.area}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border ${style.border} bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest ${style.text}`}>
                            {alert.type}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{timeAgo(alert.created_at)}</span>
                        </div>
                      </div>
                      <AlertTriangle className={style.text} size={20} />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 m-0">{alert.description}</p>
                    <button
                      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                      onClick={() => handleDismiss(alert.id)}
                      disabled={dismissingId === alert.id}
                    >
                      <Trash2 size={14} />
                      {dismissingId === alert.id ? "Removing" : "Dismiss"}
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
