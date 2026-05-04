"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createTour } from "@/lib/db";
import { DESTINATIONS } from "@/lib/data";

const INITIAL_HIGHLIGHTS = ["", "", ""];

export default function AddTourPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [highlights, setHighlights] = useState(INITIAL_HIGHLIGHTS);
  const [included, setIncluded] = useState([true, true, true, true, false, false]);
  const INCLUSIONS = ["Transport (AC Vehicle)", "Hotel Accommodation", "All Meals", "Professional Guide", "Permits & Fees", "Travel Insurance"];

  const [form, setForm] = useState({
    title: "", destination: DESTINATIONS[0] || "Hunza Valley", category: "Adventure",
    duration: "", max_group: "", price: "", difficulty: "Moderate",
    description: "", region: "Northern Pakistan",
  });

  const setField = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    const companyId = profile?.id;
    if (!companyId) {
      alert("Company profile not found.");
      setSubmitting(false);
      return;
    }
    const tour = await createTour({
      company_id: companyId,
      title: form.title,
      destination: form.destination,
      region: form.region,
      price: Number(form.price),
      duration: Number(form.duration),
      category: form.category,
      max_group: Number(form.max_group) || 12,
      difficulty: form.difficulty,
      highlights: highlights.filter(Boolean),
      included: INCLUSIONS.filter((_, i) => included[i]),
    });
    setSubmitting(false);
    if (tour) {
      setSuccess(true);
      setTimeout(() => router.push("/company/tours"), 2000);
    } else {
      alert("Failed to create tour. Please try again.");
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Tour Published!</h2>
        <p style={{ color: "var(--text-muted)" }}>Redirecting to your tours...</p>
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Company Panel</div>
          <h1 className="topbar-title">➕ Add New Tour Package</h1>
        </div>
        <div className="topbar-actions">
          <Link href="/company/tours" className="btn btn-secondary btn-sm">← Back to Tours</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Tour Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Tour Title *</label>
                  <input className="input" placeholder="e.g. Hunza Valley 7-Day Adventure" value={form.title} onChange={e => setField("title", e.target.value)} required />
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Destination *</label>
                    <select className="input" value={form.destination} onChange={e => setField("destination", e.target.value)}>
                      {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select className="input" value={form.category} onChange={e => setField("category", e.target.value)}>
                      {["Adventure", "Trekking", "Cultural", "Family", "Sports"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Duration (Days) *</label>
                    <input className="input" type="number" placeholder="7" min={1} value={form.duration} onChange={e => setField("duration", e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Max Group Size</label>
                    <input className="input" type="number" placeholder="12" min={1} value={form.max_group} onChange={e => setField("max_group", e.target.value)} />
                  </div>
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Price per Person (PKR) *</label>
                    <input className="input" type="number" placeholder="45000" min={0} value={form.price} onChange={e => setField("price", e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Difficulty</label>
                    <select className="input" value={form.difficulty} onChange={e => setField("difficulty", e.target.value)}>
                      {["Easy", "Moderate", "Challenging", "Expert"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Tour Description</label>
                  <textarea className="input" rows={4} placeholder="Describe the tour experience, unique highlights, and what makes it special..." value={form.description} onChange={e => setField("description", e.target.value)} style={{ resize: "vertical", minHeight: 100 }} />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏔️ Tour Highlights</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input className="input" placeholder={`Highlight ${i + 1} (e.g. Eagle's Nest Viewpoint)`} value={h} onChange={e => setHighlights(prev => prev.map((v, j) => j === i ? e.target.value : v))} />
                    {i > 0 && (
                      <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => setHighlights(prev => prev.filter((_, j) => j !== i))}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setHighlights(prev => [...prev, ""])}>
                  + Add Highlight
                </button>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📸 Tour Images</h2>
              <div style={{ border: "2px dashed var(--border-active)", borderRadius: "var(--radius-lg)", padding: "40px 20px", textAlign: "center", background: "var(--bg-glass)", cursor: "pointer" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop images here or click to upload</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>JPG, PNG up to 10MB each. Max 8 images.</div>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>✅ What's Included</h2>
              {INCLUSIONS.map((item, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                  <input type="checkbox" checked={included[i]} onChange={e => setIncluded(prev => prev.map((v, j) => j === i ? e.target.checked : v))} style={{ accentColor: "var(--teal)", width: 16, height: 16 }} />
                  <span style={{ fontSize: 14 }}>{item}</span>
                </label>
              ))}
            </div>

            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📅 Availability</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Available From</label>
                    <input className="input" type="date" min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Available Until</label>
                    <input className="input" type="date" />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <label className="switch"><input type="checkbox" defaultChecked /><span className="switch-slider" /></label>
                  <span style={{ fontSize: 14 }}>Tour is immediately active after submission</span>
                </label>
              </div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, rgba(20,210,190,0.08), rgba(124,58,237,0.08))", border: "1px solid var(--border-active)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📊 Tour Preview</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Title", value: form.title || "—" },
                  { label: "Destination", value: form.destination },
                  { label: "Duration", value: form.duration ? `${form.duration} days` : "—" },
                  { label: "Price", value: form.price ? `PKR ${Number(form.price).toLocaleString()}` : "—" },
                  { label: "Max Group", value: form.max_group ? `${form.max_group} pax` : "—" },
                  { label: "Difficulty", value: form.difficulty },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: "var(--teal)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={submitting}>
              {submitting ? <><span className="loading-spinner" /> Publishing...</> : "🚀 Publish Tour Package"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
