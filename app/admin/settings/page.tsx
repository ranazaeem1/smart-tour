"use client";

import { BarChart3, Bell, Lock, Mountain, Save, Settings } from "lucide-react";
import { emailPattern, normalizeEmail, onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

export default function AdminSettingsPage() {
  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin Panel</div>
          <h1 className="topbar-title inline-flex items-center gap-2"><Settings size={24} /> Platform Settings</h1>
        </div>
      </div>
      <div className="grid-2" style={{ gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h2 className="inline-flex items-center gap-2" style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}><Mountain size={20} /> Platform Configuration</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group"><label className="input-label">Platform Name</label><input className="input" defaultValue="Smart Tour Pakistan" pattern={textOnlyPattern} title="Use letters only." onInput={e => { e.currentTarget.value = stripNumbers(e.currentTarget.value); }} /></div>
              <div className="input-group"><label className="input-label">Commission Rate (%)</label><input className="input" type="number" defaultValue="10" /></div>
              <div className="input-group"><label className="input-label">Support Email</label><input className="input" type="email" inputMode="email" pattern={emailPattern} defaultValue="support@smarttour.pk" onInput={e => { e.currentTarget.value = normalizeEmail(e.currentTarget.value); }} /></div>
              <div className="input-group"><label className="input-label">Support Phone</label><input className="input" type="tel" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} defaultValue="0800762788687" onInput={e => { e.currentTarget.value = onlyDigits(e.currentTarget.value); }} /></div>
              <button className="btn btn-primary inline-flex items-center gap-2" style={{ alignSelf: "flex-start" }}><Save size={16} /> Save Settings</button>
            </div>
          </div>
          <div className="card">
            <h2 className="inline-flex items-center gap-2" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}><Lock size={20} /> Security Settings</h2>
            {["Require email verification", "Two-factor authentication for admins", "Auto-suspend flagged accounts", "Require company documents for approval"].map((item, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <span style={{ fontSize: 14 }}>{item}</span>
                <label className="switch"><input type="checkbox" defaultChecked={i < 2} /><span className="switch-slider" /></label>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <h2 className="inline-flex items-center gap-2" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}><BarChart3 size={20} /> Platform Status</h2>
            {[
              { label: "Total Users", value: "10,420", color: "var(--teal)" },
              { label: "Active Tours", value: "230", color: "var(--emerald)" },
              { label: "Companies", value: "45", color: "var(--purple-light)" },
              { label: "Uptime", value: "99.9%", color: "var(--gold)" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="inline-flex items-center gap-2" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}><Bell size={20} /> Notification Settings</h2>
            {["New company registration", "Safety alerts", "Revenue milestones", "System errors"].map((item, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <span style={{ fontSize: 14 }}>{item}</span>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="switch-slider" /></label>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
