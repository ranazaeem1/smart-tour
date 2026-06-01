"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from '@/lib/supabase';

import { 
  LayoutDashboard, 
  Map, 
  CalendarCheck, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Settings, 
  Bell, 
  LogOut, 
  Plus, 
  BarChart3,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  MoreVertical
} from "lucide-react";

export default function CompanyPanel() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [bookingTab, setBookingTab] = useState("All Bookings");
  const [companyName, setCompanyName] = useState('Company');
  const [greeting, setGreeting] = useState('Good Morning');
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        if (!user) return;

        // Get company name from companies table
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('owner_id', user.id)
          .maybeSingle() as { data: { name: string } | null };

        if (companyData?.name) {
          setCompanyName(companyData.name);
        } else {
          setCompanyName(profile?.full_name || 'Company');
        }

        // Set time-based greeting
        const hour = new Date().getHours();
        if (hour < 12) {
          setGreeting('Good Morning');
        } else if (hour < 17) {
          setGreeting('Good Afternoon');
        } else {
          setGreeting('Good Evening');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setCompanyName('Company');
      }
    };

    fetchCompanyData();
  }, [profile?.full_name, user?.id]);



  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <Map size={20} />, label: "Manage Tours" },
    { icon: <CalendarCheck size={20} />, label: "Bookings" },
    { icon: <TrendingUp size={20} />, label: "Revenue" },
    { icon: <Users size={20} />, label: "Customers" },
    { icon: <MessageSquare size={20} />, label: "Chats" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="company-panel flex min-h-screen bg-[#050505]">
      {/* ── Sidebar ── */}
      <aside className="w-[260px] bg-black border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col z-[100]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              S
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">
              <span className="text-black">Smart</span>
              <span className="text-emerald-500">Tour</span>
            </span>
          </div>
          <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-1">Operator Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-zinc-600 group-hover:text-emerald-400"} transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-tight uppercase tracking-widest text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
          <div className="flex items-center gap-4 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white font-black text-sm">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{companyName}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Verified Partner</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 ml-[260px] flex flex-col">
        {/* ── Top Bar ── */}
        <header className="h-[90px] bg-black/50 backdrop-blur-xl border-b border-white/5 px-10 flex items-center justify-between sticky top-0 z-[90]">
          <div className="animate-fade">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{greeting} 👋</p>
            <h1 className="text-white text-3xl font-black tracking-tighter m-0 uppercase italic">{activeSection === 'Dashboard' ? `${companyName}` : activeSection}</h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                <Plus size={16} />
                Create Tour
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2">
                <BarChart3 size={16} />
                Analytics
              </button>
            </div>

            <div className="h-10 w-[1px] bg-white/10" />

            <div className="flex items-center gap-6">
              <button className="text-zinc-500 hover:text-emerald-400 transition-colors relative" aria-label="Notifications">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm cursor-pointer hover:scale-105 transition-all">
                {companyName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 space-y-12 animate-fade">
          {/* ── Dashboard Content ── */}
          {activeSection === "Dashboard" && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Tours", value: "12", icon: <Map size={24} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Active Bookings", value: "48", icon: <CalendarCheck size={24} />, color: "text-white", bg: "bg-white/5" },
                  { label: "Total Revenue", value: "PKR 2.4M", icon: <TrendingUp size={24} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Customers", value: "134", icon: <Users size={24} />, color: "text-white", bg: "bg-white/5" }
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-[28px] p-8 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all" />
                    <div className="flex flex-col gap-6 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <h3 className={`${stat.color} text-3xl font-black tracking-tighter`}>{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-white text-xl font-black tracking-tighter uppercase italic">Recent Bookings</h2>
                    <button onClick={() => setActiveSection("Bookings")} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      View Ledger <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="bg-zinc-900/50 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">ID</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Traveler</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { id: "#BK001", name: "Ahmed Khan", status: "Confirmed", rev: "PKR 50,000", sColor: "text-emerald-500 bg-emerald-500/10" },
                          { id: "#BK002", name: "Sara Ali", status: "Pending", rev: "PKR 32,000", sColor: "text-amber-500 bg-amber-500/10" },
                          { id: "#BK003", name: "Usman Tariq", status: "Confirmed", rev: "PKR 54,000", sColor: "text-emerald-500 bg-emerald-500/10" }
                        ].map((b, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6 text-xs font-black text-emerald-500">{b.id}</td>
                            <td className="px-8 py-6 text-xs font-bold text-white">{b.name}</td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${b.sColor}`}>{b.status}</span>
                            </td>
                            <td className="px-8 py-6 text-sm font-black text-emerald-400 text-right">{b.rev}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-white text-xl font-black tracking-tighter uppercase italic px-2">Intelligence</h2>
                  <div className="bg-emerald-600 rounded-[32px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-600/20">
                    <TrendingUp className="absolute top-0 right-0 opacity-20 -translate-y-4 translate-x-4 group-hover:scale-110 transition-transform duration-700" size={180} />
                    <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Growth Signal</p>
                    <h3 className="text-2xl font-black tracking-tight mb-8 leading-tight uppercase italic">Conversion increased by 8.4% this week.</h3>
                    <button className="w-full bg-black/20 hover:bg-black/40 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all border border-white/10 backdrop-blur-md">Deep Analysis</button>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── Manage Tours Content ── */}
          {activeSection === "Manage Tours" && (
            <section className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic">Expedition Catalog</h2>
              </div>
              <div className="bg-zinc-900/50 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Tour Name</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Destination</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Duration</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Price</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: "Hunza Valley Tour", dest: "Hunza, Pakistan", dur: "5 Days", price: "PKR 25,000", status: "Active", sColor: "bg-emerald-500/10 text-emerald-500" },
                      { name: "Lahore City Tour", dest: "Lahore, Pakistan", dur: "2 Days", price: "PKR 8,000", status: "Active", sColor: "bg-emerald-500/10 text-emerald-500" },
                      { name: "Naran Kaghan Tour", dest: "KPK, Pakistan", dur: "4 Days", price: "PKR 18,000", status: "Full", sColor: "bg-rose-500/10 text-rose-500" }
                    ].map((t, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6 text-sm font-bold text-white">{t.name}</td>
                        <td className="px-8 py-6 text-sm text-zinc-400">{t.dest}</td>
                        <td className="px-8 py-6 text-sm text-zinc-400 font-medium">{t.dur}</td>
                        <td className="px-8 py-6 text-sm text-emerald-400 font-black">{t.price}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.sColor}`}>{t.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-6">
                          <button className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Modify</button>
                          <button className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Bookings Content ── */}
          {activeSection === "Bookings" && (
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic">Global Reservations</h2>
                <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  {["All Bookings", "Confirmed", "Pending", "Cancelled"].map((tab) => (
                    <button key={tab} onClick={() => setBookingTab(tab)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${bookingTab === tab ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`}>{tab}</button>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Traveler</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right border-b border-white/5">Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right border-b border-white/5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: "#BK001", name: "Ahmed Khan", date: "15 Jun 2025", rev: "PKR 50,000", status: "Confirmed", sColor: "bg-emerald-500/10 text-emerald-500" },
                      { id: "#BK002", name: "Sara Ali", date: "20 Jun 2025", rev: "PKR 32,000", status: "Pending", sColor: "bg-amber-500/10 text-amber-500" },
                      { id: "#BK004", name: "Fatima Malik", date: "30 Jun 2025", rev: "PKR 25,000", status: "Cancelled", sColor: "bg-rose-500/10 text-rose-500" }
                    ].map((b, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 text-xs font-black text-emerald-500">{b.id}</td>
                        <td className="px-8 py-6 text-xs font-bold text-white">{b.name}</td>
                        <td className="px-8 py-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">{b.date}</td>
                        <td className="px-8 py-6 text-sm font-black text-emerald-400 text-right">{b.rev}</td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${b.sColor}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Revenue Content ── */}
          {activeSection === "Revenue" && (
            <section className="space-y-8">
              <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic px-2">Revenue Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Growth Capital", val: "PKR 85,000", trend: "+12% Increase", bg: "bg-emerald-500/10", border: "border-emerald-500/20", tColor: "text-emerald-500", vColor: "text-white", trColor: "text-emerald-400" },
                  { label: "Global Revenue", val: "PKR 2.4M", trend: "Total Lifetime", bg: "bg-white/5", border: "border-white/5", tColor: "text-zinc-500", vColor: "text-white", trColor: "text-zinc-600" },
                  { label: "Locked Assets", val: "PKR 32,000", trend: "Pending Verification", bg: "bg-amber-500/5", border: "border-amber-500/10", tColor: "text-amber-500", vColor: "text-white", trColor: "text-zinc-600" }
                ].map((r, i) => (
                  <div key={i} className={`${r.bg} border ${r.border} rounded-[32px] p-10 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <p className={`${r.tColor} text-[10px] font-black uppercase tracking-[0.2em] mb-4`}>{r.label}</p>
                    <h3 className={`${r.vColor} text-4xl font-black tracking-tighter`}>{r.val}</h3>
                    <p className={`${r.trColor} text-[10px] font-bold mt-8 uppercase tracking-widest`}>{r.trend}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Customers Content ── */}
          {activeSection === "Customers" && (
            <section className="space-y-8">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-white text-2xl font-black tracking-tighter uppercase italic">Traveler Base</h2>
                <div className="relative w-80 group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="text" placeholder="ID or Signal search..." className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold placeholder:text-zinc-600 uppercase tracking-widest" />
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Traveler</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Communication</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right border-b border-white/5">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: "Ahmed Khan", initials: "AK", color: "bg-emerald-500", email: "ahmed@global.travel", spent: "PKR 75,000" },
                      { name: "Sara Ali", initials: "SA", color: "bg-zinc-800", email: "sara@nexus.network", spent: "PKR 32,000" }
                    ].map((c, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20`}>{c.initials}</div>
                            <span className="text-sm font-bold text-white">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-zinc-500 font-bold">{c.email}</td>
                        <td className="px-8 py-6 text-sm font-black text-emerald-400 text-right">{c.spent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Chats Content ── */}
          {activeSection === "Chats" && (
            <section className="company-chats space-y-6">
              <h2 className="company-chats-title text-2xl font-black tracking-tighter uppercase italic px-2">Customer Communications</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat List Sidebar */}
                <div className="company-chats-list rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[580px]">
                  <div className="p-4 border-b company-chats-list-header">
                    <div className="relative group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 company-chats-search-icon group-focus-within:text-emerald-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search chats..." 
                        className="company-chats-search w-full pl-10 pr-3 py-2.5 rounded-xl text-[10px] focus:outline-none focus:border-emerald-500/50 transition-all font-bold uppercase tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {[
                      { name: "Ahmed Khan", initials: "AK", color: "bg-emerald-500", tour: "Hunza Valley Tour", msg: "Is guide included?", time: "2m ago", active: true, unread: true },
                      { name: "Sara Ali", initials: "SA", color: "bg-zinc-700", tour: "Lahore City Tour", msg: "What is the pickup point?", time: "1h ago", active: false, unread: false },
                      { name: "Usman Tariq", initials: "UT", color: "bg-zinc-700", tour: "Naran Kaghan Tour", msg: "Can I bring my family?", time: "3h ago", active: false, unread: false },
                      { name: "Fatima Malik", initials: "FM", color: "bg-zinc-700", tour: "Hunza Valley Tour", msg: "Payment confirmed?", time: "1d ago", active: false, unread: false }
                    ].map((chat, i) => (
                      <button 
                        key={i} 
                        className={`company-chat-item w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all border-l-[3px] ${chat.active ? "company-chat-item-active is-active" : "company-chat-item-idle"}`}
                      >
                        <div className={`w-9 h-9 rounded-lg ${chat.color} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0`}>
                          {chat.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-2 mb-0.5">
                            <p className="company-chat-name text-xs font-bold truncate">{chat.name}</p>
                            <span className="company-chat-time text-[8px] font-bold uppercase tracking-wider shrink-0">{chat.time}</span>
                          </div>
                          <p className="company-chat-tour text-[8px] font-bold uppercase tracking-wider mb-0.5 truncate">{chat.tour}</p>
                          <div className="flex justify-between items-center gap-2">
                            <p className="company-chat-preview text-[10px] truncate">{chat.msg}</p>
                            {chat.unread && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Window Area */}
                <div className="company-chat-window lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[580px] relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  {/* Window Header */}
                  <div className="company-chat-header p-4 border-b flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-black">AK</div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-900" />
                      </div>
                      <div>
                        <h3 className="company-chat-header-name text-base font-black tracking-tight leading-none mb-1 uppercase italic">Ahmed Khan</h3>
                        <p className="company-chat-header-meta text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          Live • Hunza Valley Tour
                        </p>
                      </div>
                    </div>
                    <button className="company-chat-menu-btn p-2 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Message Bubble Feed */}
                  <div className="company-chat-feed flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
                    <div className="flex justify-start">
                      <div className="company-chat-incoming max-w-[78%] px-4 py-3 rounded-2xl rounded-tl-sm">
                        <p className="company-chat-incoming-text text-sm leading-relaxed">Is guide included in the tour price?</p>
                        <p className="company-chat-time mt-2 text-[9px] font-semibold uppercase text-right tracking-wide">10:45 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="company-chat-outgoing max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm">
                        <p className="company-chat-outgoing-text text-sm leading-relaxed font-semibold">Yes! A certified guide is included throughout the journey.</p>
                        <p className="company-chat-outgoing-time mt-2 text-[9px] font-semibold uppercase text-right tracking-wide">10:47 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="company-chat-incoming max-w-[78%] px-4 py-3 rounded-2xl rounded-tl-sm">
                        <p className="company-chat-incoming-text text-sm leading-relaxed">What about meals?</p>
                        <p className="company-chat-time mt-2 text-[9px] font-semibold uppercase text-right tracking-wide">10:50 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="company-chat-outgoing max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm">
                        <p className="company-chat-outgoing-text text-sm leading-relaxed font-semibold">Breakfast and dinner are included. Lunch is scheduled at local scenic spots on your own.</p>
                        <p className="company-chat-outgoing-time mt-2 text-[9px] font-semibold uppercase text-right tracking-wide">10:52 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="company-chat-compose p-4 border-t relative z-10">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="company-chat-input flex-1 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                      <button className="w-11 h-11 bg-emerald-500 text-white flex items-center justify-center rounded-xl hover:bg-emerald-600 transition-all active:scale-95">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Settings Placeholder ── */}
          {activeSection === "Settings" && (
            <section className="bg-zinc-900/50 border border-white/5 p-32 text-center space-y-8 rounded-[48px] backdrop-blur-md">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <Settings size={44} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white m-0 tracking-tighter uppercase italic">Configuration Sync</h2>
                <p className="text-emerald-500/50 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Adjusting operational parameters...</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
