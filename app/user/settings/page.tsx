"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Camera, 
  CheckCircle2, 
  Save, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Settings,
  CreditCard,
  History,
  Activity,
  MapPin
} from "lucide-react";

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fade">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Accessing Secure Vault...</p>
    </div>
  );

  const tabs = [
    { id: "profile", label: "My Profile", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <ShieldCheck size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "preferences", label: "Preferences", icon: <Globe size={18} /> },
  ];

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Settings Hero Header ── */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-emerald inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border">
              <Settings size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profile Configuration</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Settings & Privacy
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">Manage your digital identity and security protocols.</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-emerald px-10 py-5 !rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-all min-h-[56px]"
          >
            {isSaving ? <div className="loading-spinner w-5 h-5 border-white" /> : <Save size={20} />}
            <span className="text-sm font-black tracking-widest uppercase">{isSaving ? "Synchronizing..." : "Commit Changes"}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* ── Sidebar Navigation ── */}
        <div className="lg:col-span-1 space-y-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-500 font-black text-[11px] uppercase tracking-[0.2em] border active:scale-95 ${
                activeTab === tab.id 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 translate-x-2" 
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-emerald-500"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 border-t border-[var(--border)] mt-6">
             <div className="p-6 bg-[var(--muted)] rounded-[24px] border border-[var(--border)] space-y-4">
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Storage Status</p>
                <div className="w-full h-1.5 bg-[var(--card)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="w-[45%] h-full bg-emerald-500" />
                </div>
                <p className="text-[9px] font-bold text-[var(--foreground)]">45% of security vault utilized</p>
             </div>
          </div>
        </div>

        {/* ── Content Matrix ── */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <div className="card-premium space-y-12 animate-fade">
              <div className="flex flex-col md:flex-row items-center gap-10 pb-10 border-b border-[var(--border)]">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl border border-white/10 ring-4 ring-emerald-500/20">
                    {fullName ? fullName[0].toUpperCase() : "U"}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 border-4 border-[var(--card)]">
                    <Camera size={20} />
                  </button>
                </div>
                <div className="text-center md:text-left space-y-3">
                  <h3 className="text-3xl font-black text-[var(--foreground)] m-0 tracking-tight">{fullName || "Unnamed Member"}</h3>
                  <p className="text-[var(--muted-foreground)] font-bold text-sm tracking-widest uppercase">{profile?.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="badge badge-emerald">Verified Identity</span>
                    <span className="badge badge-slate">Premium Access</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
                    <User size={14} className="text-emerald-500" /> Full Signature
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input !font-black !py-4 !rounded-2xl"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
                    <Mail size={14} className="text-emerald-500" /> Encryption Node
                  </label>
                  <input 
                    type="email" 
                    value={profile?.email || ""}
                    disabled
                    className="input !bg-[var(--muted)] !font-black !py-4 !rounded-2xl opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
                    <Phone size={14} className="text-emerald-500" /> Comm Device
                  </label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input !font-black !py-4 !rounded-2xl"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
                    <MapPin size={14} className="text-emerald-500" /> Regional Sector
                  </label>
                  <input 
                    type="text" 
                    className="input !font-black !py-4 !rounded-2xl"
                    placeholder="e.g. Islamabad, PK"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card-premium space-y-10 animate-fade">
              <div className="border-b border-[var(--border)] pb-8">
                <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight">Access Rotation</h3>
                <p className="text-[var(--muted-foreground)] text-sm font-medium">Update your administrative credentials to maintain perimeter integrity.</p>
              </div>

              <div className="space-y-8 max-w-lg">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4">Master Key (Current)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input !font-black !py-4 !rounded-2xl pr-14"
                      placeholder="••••••••"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4">New Credential</label>
                  <input 
                    type="password" 
                    className="input !font-black !py-4 !rounded-2xl"
                    placeholder="Configure new key"
                  />
                </div>

                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[24px] flex items-start gap-4">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-amber-500 font-black text-[11px] uppercase tracking-widest">Protocol Advisory</p>
                    <p className="text-[var(--muted-foreground)] text-xs font-medium mt-2 leading-relaxed italic">
                      Entropy requirement: 12+ characters, alphanumeric symbols, and regional complexity.
                    </p>
                  </div>
                </div>

                <button className="btn btn-secondary !py-4 !px-10 !rounded-2xl font-black uppercase tracking-widest text-[12px] w-full md:w-auto">
                   <ShieldCheck size={18} className="mr-2" /> Rotate Credentials
                </button>
              </div>

              <div className="pt-10 border-t border-[var(--border)]">
                <h3 className="text-xl font-black text-[var(--foreground)] mb-8 tracking-tight">Identity Multi-Factor</h3>
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-[var(--muted)] rounded-[32px] border border-[var(--border)] gap-6 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                    <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                      <Lock size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">Biometric Sync / SMS</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] font-bold mt-1 uppercase tracking-wider">Secondary verification method inactive</p>
                    </div>
                  </div>
                  <button className="btn btn-emerald !py-3 !px-8 !rounded-xl !text-[10px]">Initialize MFA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card-premium space-y-10 animate-fade">
              <div className="border-b border-[var(--border)] pb-8">
                <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight m-0">Transmission Channels</h3>
                <p className="text-[var(--muted-foreground)] text-sm font-medium">Configure telemetry and mission alerts across your node network.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: "email", label: "Email Dispatch", desc: "Receive trip confirmations and expense reports via primary relay.", value: notifications.email },
                  { id: "push", label: "Neural Push Signals", desc: "Get real-time safety alerts and itinerary updates on your device.", value: notifications.push },
                  { id: "sms", label: "SMS Critical Relay", desc: "Urgent notifications delivered via direct carrier for remote zones.", value: notifications.sms },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-8 bg-[var(--muted)] hover:bg-[var(--card)] hover:shadow-2xl transition-all duration-500 rounded-[32px] border border-[var(--border)] group">
                    <div>
                      <h4 className="text-lg font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{item.label}</h4>
                      <p className="text-[12px] text-[var(--muted-foreground)] font-medium mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                      className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center p-1 border ${item.value ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-[var(--card)] border-[var(--border)]"}`}
                    >
                      <div className={`w-6 h-6 rounded-full shadow-lg transition-all duration-500 ${item.value ? "translate-x-6 bg-white" : "translate-x-0 bg-[var(--muted-foreground)]"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="card-premium space-y-12 animate-fade">
              <div className="border-b border-[var(--border)] pb-8">
                <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight m-0">Interface Calibration</h3>
                <p className="text-[var(--muted-foreground)] text-sm font-medium">Personalize your environmental data visualization for peak efficiency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4">System Lexicon</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input !font-black !py-4 !rounded-2xl"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Urdu (اردو)</option>
                    <option>Chinese (Mandarin)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label !text-[10px] !font-black !uppercase !tracking-[0.2em] mb-4">Luminance Profile</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center gap-4 p-6 bg-slate-950 text-white rounded-[24px] shadow-2xl ring-2 ring-emerald-500 group transition-all">
                      <div className="w-12 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Midnight Paradigm</span>
                    </button>
                    <button className="flex flex-col items-center gap-4 p-6 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-[24px] border border-[var(--border)] hover:bg-[var(--card)] hover:text-[var(--foreground)] transition-all grayscale opacity-40 cursor-not-allowed">
                      <div className="w-12 h-1.5 rounded-full bg-[var(--border)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Solaris (Locked)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
