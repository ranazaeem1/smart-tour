"use client";

import { useState } from "react";
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  Bell, 
  Shield, 
  Lock, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { emailPattern, normalizeEmail, onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

export default function CompanySettingsPage() {
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [currentPw, setCurrentPw] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUpdatePassword = () => {
    setPwError(null);
    setPwSuccess(false);
    if (!currentPw) { setPwError("Please enter your current password."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    setPwSuccess(true);
    setCurrentPw(""); setNewPw("");
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Settings Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165833767-027eeed15c3e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-slate inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-4 border">
              <Settings size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Config</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Control Panel
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Synchronize your corporate identity and security protocols.</p>
          </div>

          <div className="text-right hidden md:block">
            <span className="panel-hero-badge panel-hero-badge-slate badge badge-slate font-black">
              SECURE ACCESS ACTIVE
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Left Column: Corporate Profile ── */}
        <div className="space-y-10">
          <section className="card-premium space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <Building2 size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Corporate Profile</h2>
            </div>

            <div className="space-y-6">
              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Expedition Label</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input className="input !pl-12 font-bold" defaultValue="Northern Trails Co." pattern={textOnlyPattern} title="Use letters only." onInput={e => { e.currentTarget.value = stripNumbers(e.currentTarget.value); }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Communication Node</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input className="input !pl-12 font-bold" type="email" inputMode="email" pattern={emailPattern} defaultValue="info@northerntrails.pk" onInput={e => { e.currentTarget.value = normalizeEmail(e.currentTarget.value); }} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Contact Primary</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input className="input !pl-12 font-bold" type="tel" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} defaultValue="03001234567" onInput={e => { e.currentTarget.value = onlyDigits(e.currentTarget.value); }} />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">HQ Sector</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <select className="input !pl-12 font-bold">
                    <option>Gilgit</option>
                    <option>Skardu</option>
                    <option>Islamabad</option>
                    <option>Lahore</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Mission Statement</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-4 text-[var(--muted-foreground)]" />
                  <textarea 
                    className="input !pl-12 font-medium min-h-[100px]" 
                    rows={3} 
                    defaultValue="Leading adventure tour company in northern Pakistan since 2010. Dedicated to ecological integrity and traveler safety." 
                  />
                </div>
              </div>

              {saved && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500 animate-fade">
                  <CheckCircle2 size={18} />
                  <p className="text-xs font-black uppercase tracking-widest m-0">Identity Synchronized Successfully</p>
                </div>
              )}

              <button 
                className="btn btn-emerald !py-4 !px-8 !rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 group active:scale-95 transition-all"
                onClick={handleSave}
              >
                <Save size={18} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Update Profile</span>
              </button>
            </div>
          </section>
        </div>

        {/* ── Right Column: Protocols & Security ── */}
        <div className="space-y-10">
          {/* Signal Protocols */}
          <section className="card-premium space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <Bell size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Signal Protocols</h2>
            </div>

            <div className="space-y-2">
              {[
                "New Booking Deployment Alerts",
                "Financial Transaction Signals",
                "Traveler Sentiment Notifications",
                "Expedition Decommissioning Alerts",
                "Intelligence Reports (Weekly)"
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group">
                  <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">{item}</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={i < 3} />
                    <span className="switch-slider" />
                  </label>
                </label>
              ))}
            </div>
          </section>

          {/* Infrastructure Security */}
          <section className="card-premium space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)] m-0">Infrastructure Security</h2>
            </div>

            <div className="space-y-6">
              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Primary Key</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input 
                    className="input !pl-12 font-black" 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPw} 
                    onChange={e => setCurrentPw(e.target.value)} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em]">Replacement Key</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input 
                    className="input !pl-12 font-black" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPw} 
                    onChange={e => setNewPw(e.target.value)} 
                  />
                </div>
              </div>

              {pwError && (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500 animate-fade">
                  <AlertCircle size={18} />
                  <p className="text-xs font-black uppercase tracking-widest m-0">{pwError}</p>
                </div>
              )}

              {pwSuccess && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500 animate-fade">
                  <CheckCircle2 size={18} />
                  <p className="text-xs font-black uppercase tracking-widest m-0">Access Credentials Rotated</p>
                </div>
              )}

              <button 
                className="btn btn-secondary !py-4 !px-8 !rounded-2xl flex items-center gap-2 group active:scale-95 transition-all w-full md:w-auto"
                onClick={handleUpdatePassword}
              >
                <Shield size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Update Security Vault</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
