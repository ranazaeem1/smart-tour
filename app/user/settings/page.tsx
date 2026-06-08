"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Bell, Camera, Eye, EyeOff, Globe, Lock, Mail, MapPin, Phone, Save, Settings, ShieldCheck, User } from "lucide-react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{children}</label>;
}

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmergencyPhone(profile.emergency_phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({
          full_name: fullName.trim(),
          phone,
          emergency_phone: emergencyPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      setSaveMessage("Profile and SOS emergency number saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Settings save failed.";
      setSaveMessage(message.includes("emergency_phone") ? "Database emergency_phone column is missing. Apply the latest emergency contact migration." : message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <ShieldCheck size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "preferences", label: "Preferences", icon: <Globe size={18} /> },
  ];

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Settings size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Profile Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Settings</h1>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="btn btn-emerald !rounded-2xl !py-4 !px-6 flex items-center justify-center gap-2">
          {isSaving ? <div className="loading-spinner w-5 h-5 border-white" /> : <Save size={18} />}
          <span className="text-xs font-black uppercase tracking-widest">{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm h-fit">
          <div className="space-y-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}>
                <span className={activeTab === tab.id ? "text-emerald-400" : "text-emerald-500"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade">
              {saveMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                  {saveMessage}
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-950 text-3xl font-black">
                    {fullName ? fullName[0].toUpperCase() : "U"}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all border-4 border-white" aria-label="Change photo">
                    <Camera size={18} />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{fullName || "Unnamed Member"}</h2>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{profile?.email}</p>
                  <span className="inline-flex mt-3 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <FieldLabel>Full Name</FieldLabel>
                  <input value={fullName} onChange={e => setFullName(stripNumbers(e.target.value))} className="input !rounded-2xl !bg-white font-black" placeholder="Enter full name" pattern={textOnlyPattern} title="Use letters only." />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Email</FieldLabel>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input value={profile?.email || ""} disabled className="input !pl-12 !rounded-2xl !bg-slate-50 font-black opacity-70" />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Phone</FieldLabel>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input value={phone} onChange={e => setPhone(onlyDigits(e.target.value))} className="input !pl-12 !rounded-2xl !bg-white font-black" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} placeholder="03XXXXXXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Emergency Phone</FieldLabel>
                  <div className="relative">
                    <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                    <input value={emergencyPhone} onChange={e => setEmergencyPhone(onlyDigits(e.target.value))} className="input !pl-12 !rounded-2xl !bg-white font-black" inputMode="numeric" pattern="[0-9]{9,15}" maxLength={15} placeholder="SOS contact number" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">SOS signal uses this number for emergency contact sharing.</p>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Location</FieldLabel>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input className="input !pl-12 !rounded-2xl !bg-white font-black" placeholder="e.g. Islamabad, PK" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-fade max-w-2xl">
              <div className="pb-5 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-950">Security</h2>
                <p className="text-xs font-bold text-slate-500 mt-1">Password and account protection</p>
              </div>
              <div className="space-y-2">
                <FieldLabel>Current Password</FieldLabel>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input type={showPassword ? "text" : "password"} className="input !pl-12 !pr-12 !rounded-2xl !bg-white font-black" placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>New Password</FieldLabel>
                <input type="password" className="input !rounded-2xl !bg-white font-black" placeholder="New password" />
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
                <AlertCircle size={18} className="mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">Use a strong password with letters, numbers, and symbols.</p>
              </div>
              <button className="btn btn-secondary !py-4 !px-7 !rounded-2xl flex items-center gap-2">
                <ShieldCheck size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Update Security</span>
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 animate-fade">
              <div className="pb-5 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-950">Notifications</h2>
                <p className="text-xs font-bold text-slate-500 mt-1">Trip alerts, safety messages, and booking updates</p>
              </div>
              {[
                { id: "email", label: "Email alerts", desc: "Booking confirmations and account updates", value: notifications.email },
                { id: "push", label: "Push notifications", desc: "Real-time itinerary and safety alerts", value: notifications.push },
                { id: "sms", label: "SMS alerts", desc: "Critical messages for remote zones", value: notifications.sms },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between gap-5 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all">
                  <div>
                    <h3 className="text-sm font-black text-slate-950">{item.label}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={item.value} onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))} />
                    <span className="switch-slider" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6 animate-fade">
              <div className="pb-5 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-950">Preferences</h2>
                <p className="text-xs font-bold text-slate-500 mt-1">Language and interface preferences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <FieldLabel>Language</FieldLabel>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="input !rounded-2xl !bg-white font-black">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Urdu</option>
                    <option>Chinese (Mandarin)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Theme</FieldLabel>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
                    <p className="text-sm font-black">Light panel theme active</p>
                    <p className="text-xs font-bold mt-1">Matched with admin and company panel UI.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
