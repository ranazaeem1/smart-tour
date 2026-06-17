"use client";

import { useState } from "react";
import { AlertCircle, Bell, Building2, CheckCircle2, FileText, Lock, Mail, MapPin, Phone, Save, Settings, Shield } from "lucide-react";
import { emailPattern, normalizeEmail, onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{children}</label>;
}

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
    if (!currentPw) {
      setPwError("Please enter your current password.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwSuccess(true);
    setCurrentPw("");
    setNewPw("");
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div>
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <Settings size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operator Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950">Settings</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
            <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Company Profile</h2>
              <p className="text-xs font-bold text-slate-500">Business identity and contact details</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <FieldLabel>Expedition Label</FieldLabel>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input className="input !pl-12 !rounded-2xl !bg-white font-bold" defaultValue="Northern Trails Co." pattern={textOnlyPattern} title="Use letters only." onInput={e => { e.currentTarget.value = stripNumbers(e.currentTarget.value); }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input className="input !pl-12 !rounded-2xl !bg-white font-bold" type="email" inputMode="email" pattern={emailPattern} defaultValue="info@northerntrails.pk" onInput={e => { e.currentTarget.value = normalizeEmail(e.currentTarget.value); }} />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>Phone</FieldLabel>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input className="input !pl-12 !rounded-2xl !bg-white font-bold" type="tel" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} defaultValue="03001234567" onInput={e => { e.currentTarget.value = onlyDigits(e.currentTarget.value); }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>HQ Sector</FieldLabel>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                <select className="input !pl-12 !rounded-2xl !bg-white font-bold">
                  <option>Gilgit</option>
                  <option>Skardu</option>
                  <option>Islamabad</option>
                  <option>Lahore</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Mission Statement</FieldLabel>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-emerald-500" />
                <textarea className="input !pl-12 !rounded-2xl !bg-white font-bold min-h-[120px]" rows={4} defaultValue="Leading adventure tour company in northern Pakistan since 2010. Dedicated to ecological integrity and traveler safety." />
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600">
                <CheckCircle2 size={18} />
                <p className="text-xs font-black uppercase tracking-widest">Profile updated successfully</p>
              </div>
            )}

            <button className="btn btn-emerald !py-4 !px-7 !rounded-2xl flex items-center gap-2" onClick={handleSave}>
              <Save size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Update Profile</span>
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-3 border-b border-slate-100">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Notifications</h2>
                <p className="text-xs font-bold text-slate-500">Alerts and operational updates</p>
              </div>
            </div>

            <div className="space-y-2">
              {["New booking alerts", "Payment notifications", "Traveler review alerts", "Tour status updates", "Weekly performance report"].map((item, index) => (
                <label key={item} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                  <span className="text-sm font-black text-slate-700">{item}</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={index < 3} />
                    <span className="switch-slider" />
                  </label>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">Security</h2>
                <p className="text-xs font-bold text-slate-500">Password and account protection</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <FieldLabel>Current Password</FieldLabel>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input className="input !pl-12 !rounded-2xl !bg-white font-black" type="password" placeholder="Password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>New Password</FieldLabel>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input className="input !pl-12 !rounded-2xl !bg-white font-black" type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
              </div>

              {pwError && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-500">
                  <AlertCircle size={18} />
                  <p className="text-xs font-black uppercase tracking-widest">{pwError}</p>
                </div>
              )}

              {pwSuccess && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600">
                  <CheckCircle2 size={18} />
                  <p className="text-xs font-black uppercase tracking-widest">Password updated</p>
                </div>
              )}

              <button className="btn btn-secondary !py-4 !px-7 !rounded-2xl flex items-center gap-2" onClick={handleUpdatePassword}>
                <Shield size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Update Security</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
