"use client";

import { BarChart3, Bell, Building2, Lock, Mail, Mountain, Phone, Save, Search, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { emailPattern, normalizeEmail, onlyDigits, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

export default function AdminSettingsPage() {
  const stats = [
    { label: "Total Users", value: "10,420", icon: <Users size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Active Tours", value: "230", icon: <Mountain size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Companies", value: "45", icon: <Building2 size={20} />, color: "#3B82F6", bg: "bg-blue-50" },
    { label: "Uptime", value: "99.9%", icon: <BarChart3 size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
  ];

  const securitySettings = [
    "Require email verification",
    "Two-factor authentication for admins",
    "Auto-suspend flagged accounts",
    "Require company documents for approval",
  ];

  const notificationSettings = [
    "New company registration",
    "Safety alerts",
    "Revenue milestones",
    "System errors",
  ];

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Control Center</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Platform Settings</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search settings..." readOnly />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${stat.bg}`} style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <div className="text-3xl font-black mb-1 text-slate-950">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <section className="xl:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Mountain size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SettingInput
              icon={<Settings size={16} />}
              label="Platform Name"
              defaultValue="Smart Tour Pakistan"
              pattern={textOnlyPattern}
              title="Use letters only."
              onInput={e => {
                e.currentTarget.value = stripNumbers(e.currentTarget.value);
              }}
            />
            <SettingInput icon={<Wallet size={16} />} label="Commission Rate (%)" defaultValue="10" type="number" />
            <SettingInput
              icon={<Mail size={16} />}
              label="Support Email"
              defaultValue="support@smarttour.pk"
              type="email"
              inputMode="email"
              pattern={emailPattern}
              onInput={e => {
                e.currentTarget.value = normalizeEmail(e.currentTarget.value);
              }}
            />
            <SettingInput
              icon={<Phone size={16} />}
              label="Support Phone"
              defaultValue="0800762788687"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{9,15}"
              maxLength={15}
              onInput={e => {
                e.currentTarget.value = onlyDigits(e.currentTarget.value);
              }}
            />
          </div>

          <button className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 active:scale-95">
            <Save size={15} />
            Save Settings
          </button>
        </section>

        <section className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform Status</span>
          </div>

          <div className="space-y-3">
            {stats.map(row => (
              <div key={row.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                <span className="text-sm font-black text-slate-950 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SettingsPanel icon={<Lock size={16} />} eyebrow="Security Rules" title="Security Settings">
          {securitySettings.map((item, index) => (
            <ToggleRow key={item} label={item} defaultChecked={index < 2} />
          ))}
        </SettingsPanel>

        <SettingsPanel icon={<Bell size={16} />} eyebrow="Alert Routing" title="Notification Settings">
          {notificationSettings.map(item => (
            <ToggleRow key={item} label={item} defaultChecked />
          ))}
        </SettingsPanel>
      </div>
    </div>
  );
}

type SettingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  label: string;
};

function SettingInput({ icon, label, ...props }: SettingInputProps) {
  return (
    <label className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all block">
      <div className="flex items-center gap-2 mb-3 text-emerald-500">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <input className="input !rounded-2xl !bg-slate-50 !border-slate-100 !font-black" {...props} />
    </label>
  );
}

function SettingsPanel({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-emerald-500">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{eyebrow}</span>
      </div>
      <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950 mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all flex items-center justify-between gap-5 cursor-pointer">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <ShieldCheck size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-black text-slate-950 truncate m-0">{label}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Policy toggle</p>
        </div>
      </div>
      <label className="switch shrink-0">
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span className="switch-slider" />
      </label>
    </label>
  );
}
