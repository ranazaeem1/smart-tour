"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get company name from companies table
        const { data: companies } = await supabase
          .from('companies')
          .select('name')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (companies?.name) {
          setCompanyName(companies.name);
        } else {
          // Fallback to user's full name from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();
          
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
  }, []);



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
    <div className="flex min-h-screen bg-[#F5F3FF]">
      {/* ── Sidebar ── */}
      <aside className="w-[224px] bg-[#1E1B4B] h-screen fixed left-0 top-0 flex flex-col z-[100]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="text-white font-black text-xl tracking-tighter">SmartTour</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Company</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-900/20" 
                    : "text-slate-300 hover:bg-[#2D2A6E] hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-purple-300"}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-black text-sm shadow-lg">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">My Company</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Operator</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest text-[11px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 ml-[224px] flex flex-col">
        {/* ── Top Bar ── */}
        <header className="h-[80px] bg-[#1E1B4B] border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-[90]">
          <div className="animate-fade">
            <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.2em] mb-1">{greeting} 👋</p>
            <h1 className="text-white text-2xl font-black tracking-tighter m-0">{activeSection === 'Dashboard' ? `${companyName}'s Operator Console` : activeSection}</h1>

          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-900/40 flex items-center gap-2">
                <Plus size={16} />
                Add New Tour
              </button>
              <button className="bg-white hover:bg-slate-50 text-[#1E1B4B] border border-slate-200 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2">
                <BarChart3 size={16} />
                View Reports
              </button>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex items-center gap-5">
              <button className="text-white hover:text-purple-300 transition-colors relative" aria-label="Notifications">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1E1B4B]" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-black text-sm shadow-xl ring-2 ring-white/10 cursor-pointer hover:scale-105 transition-transform">
                C
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10 animate-fade">
          {/* ── Dashboard Content ── */}
          {activeSection === "Dashboard" && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Tours", value: "12", icon: <Map size={28} />, color: "text-[#7C3AED]", bg: "bg-purple-50" },
                  { label: "Active Bookings", value: "48", icon: <CalendarCheck size={28} />, color: "text-slate-900", bg: "bg-slate-50" },
                  { label: "Total Revenue", value: "PKR 2,40,000", icon: <TrendingUp size={28} />, color: "text-[#10B981]", bg: "bg-emerald-50" },
                  { label: "Total Customers", value: "134", icon: <Users size={28} />, color: "text-[#F97316]", bg: "bg-orange-50" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        <h3 className={`${stat.color} text-2xl font-black tracking-tighter mt-1`}>{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-slate-900 text-lg font-black tracking-tight uppercase tracking-[0.1em]">Recent Bookings</h2>
                    <button onClick={() => setActiveSection("Bookings")} className="text-[#7C3AED] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                      View Ledger <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Traveler</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { id: "#BK001", name: "Ahmed Khan", status: "Confirmed", rev: "PKR 50,000", sColor: "text-emerald-600 bg-emerald-50" },
                          { id: "#BK002", name: "Sara Ali", status: "Pending", rev: "PKR 32,000", sColor: "text-amber-600 bg-amber-50" },
                          { id: "#BK003", name: "Usman Tariq", status: "Confirmed", rev: "PKR 54,000", sColor: "text-emerald-600 bg-emerald-50" }
                        ].map((b, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-xs font-black text-[#7C3AED]">{b.id}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-900">{b.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${b.sColor}`}>{b.status}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">{b.rev}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-slate-900 text-lg font-black tracking-tight uppercase tracking-[0.1em]">Intelligence</h2>
                  <div className="bg-[#1E1B4B] rounded-xl p-6 text-white relative overflow-hidden">
                    <TrendingUp className="absolute top-0 right-0 opacity-10 -translate-y-4 translate-x-4" size={150} />
                    <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest mb-2">Algorithm-Generated Insight</p>
                    <h3 className="text-xl font-bold tracking-tight mb-4">Your conversion rate increased by 8.4% this week.</h3>
                    <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all border border-white/10">Analyze Market</button>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── Manage Tours Content ── */}
          {activeSection === "Manage Tours" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 text-xl font-black tracking-tight">Expedition Catalog</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tour Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "Hunza Valley Tour", dest: "Hunza, Pakistan", dur: "5 Days", price: "PKR 25,000", status: "Active", sColor: "bg-emerald-100 text-emerald-600" },
                      { name: "Lahore City Tour", dest: "Lahore, Pakistan", dur: "2 Days", price: "PKR 8,000", status: "Active", sColor: "bg-emerald-100 text-emerald-600" },
                      { name: "Naran Kaghan Tour", dest: "KPK, Pakistan", dur: "4 Days", price: "PKR 18,000", status: "Full", sColor: "bg-rose-100 text-rose-600" }
                    ].map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.dest}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.dur}</td>
                        <td className="px-6 py-4 text-sm text-emerald-600 font-black">{t.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.sColor}`}>{t.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <button className="text-[#7C3AED] text-sm font-black hover:underline">Edit</button>
                          <button className="text-rose-500 text-sm font-black hover:underline">Delete</button>
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
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-slate-900 text-xl font-black tracking-tight">Global Reservations</h2>
                <div className="flex flex-wrap gap-2">
                  {["All Bookings", "Confirmed", "Pending", "Cancelled"].map((tab) => (
                    <button key={tab} onClick={() => setBookingTab(tab)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${bookingTab === tab ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-900/20" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}>{tab}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Traveler</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { id: "#BK001", name: "Ahmed Khan", date: "15 Jun 2025", rev: "PKR 50,000", status: "Confirmed", sColor: "bg-emerald-100 text-emerald-700" },
                      { id: "#BK002", name: "Sara Ali", date: "20 Jun 2025", rev: "PKR 32,000", status: "Pending", sColor: "bg-amber-100 text-amber-700" },
                      { id: "#BK004", name: "Fatima Malik", date: "30 Jun 2025", rev: "PKR 25,000", status: "Cancelled", sColor: "bg-rose-100 text-rose-700" }
                    ].map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-[#7C3AED]">{b.id}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">{b.name}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-bold uppercase tracking-tighter">{b.date}</td>
                        <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">{b.rev}</td>
                        <td className="px-6 py-4 text-right">
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
              <h2 className="text-slate-900 text-xl font-black tracking-tight">Revenue Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "This Month", val: "PKR 85,000", trend: "+12% from last month", bg: "bg-[#EDE9FE]", tColor: "text-purple-700", vColor: "text-purple-900", trColor: "text-emerald-600" },
                  { label: "Total Revenue", val: "PKR 2,40,000", trend: "Since joining", bg: "bg-emerald-50", tColor: "text-emerald-700", vColor: "text-emerald-800", trColor: "text-slate-500" },
                  { label: "Pending Payouts", val: "PKR 32,000", trend: "3 bookings pending", bg: "bg-orange-50", tColor: "text-orange-700", vColor: "text-orange-800", trColor: "text-slate-500" }
                ].map((r, i) => (
                  <div key={i} className={`${r.bg} border border-slate-200/10 rounded-xl p-6 shadow-sm`}>
                    <p className={`${r.tColor} text-[10px] font-black uppercase tracking-widest mb-1`}>{r.label}</p>
                    <h3 className={`${r.vColor} text-2xl font-black tracking-tighter`}>{r.val}</h3>
                    <p className={`${r.trColor} text-[10px] font-bold mt-3 italic uppercase tracking-widest`}>{r.trend}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Customers Content ── */}
          {activeSection === "Customers" && (
            <section className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-slate-900 text-xl font-black tracking-tight">Expedition Base</h2>
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search customer..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Traveler</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "Ahmed Khan", initials: "AK", color: "bg-purple-600", email: "ahmed@email.com", spent: "PKR 75,000" },
                      { name: "Sara Ali", initials: "SA", color: "bg-slate-900", email: "sara@email.com", spent: "PKR 32,000" }
                    ].map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest`}>{c.initials}</div>
                            <span className="text-xs font-bold text-slate-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-bold">{c.email}</td>
                        <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">{c.spent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Chats Content ── */}
          {activeSection === "Chats" && (
            <section className="space-y-6">
              <h2 className="text-slate-900 text-xl font-black tracking-tight m-0">Customer Communications</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat List Sidebar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search chats..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {[
                      { name: "Ahmed Khan", initials: "AK", color: "bg-purple-600", tour: "Hunza Valley Tour", msg: "Is guide included?", time: "2m ago", active: true, unread: true },
                      { name: "Sara Ali", initials: "SA", color: "bg-slate-900", tour: "Lahore City Tour", msg: "What is the pickup point?", time: "1h ago", active: false, unread: false },
                      { name: "Usman Tariq", initials: "UT", color: "bg-emerald-500", tour: "Naran Kaghan Tour", msg: "Can I bring my family?", time: "3h ago", active: false, unread: false },
                      { name: "Fatima Malik", initials: "FM", color: "bg-orange-500", tour: "Hunza Valley Tour", msg: "Payment confirmed?", time: "1d ago", active: false, unread: false }
                    ].map((chat, i) => (
                      <button 
                        key={i} 
                        className={`w-full flex items-center gap-4 p-5 text-left transition-all border-l-[3px] ${chat.active ? "bg-purple-50 border-[#7C3AED]" : "hover:bg-slate-50 border-transparent"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${chat.color} flex items-center justify-center text-white text-xs font-black shadow-lg shadow-black/10 flex-shrink-0`}>
                          {chat.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">{chat.name}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{chat.time}</span>
                          </div>
                          <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest mb-1 truncate">{chat.tour}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500 truncate">{chat.msg}</p>
                            {chat.unread && <div className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_10px_#7C3AED]" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Window Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                  {/* Window Header */}
                  <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg">AK</div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">Ahmed Khan</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active • Hunza Valley Tour</p>
                      </div>
                    </div>
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Message Bubble Feed */}
                  <div className="flex-1 bg-slate-50/50 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="flex justify-start">
                      <div className="max-w-[70%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <p className="text-sm text-slate-700 leading-relaxed">Is guide included in the tour price?</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase text-right tracking-widest">10:45 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[70%] bg-[#7C3AED] p-4 rounded-2xl rounded-tr-none shadow-xl shadow-purple-900/20 text-white">
                        <p className="text-sm leading-relaxed">Yes! A certified guide is included throughout the journey.</p>
                        <p className="text-[9px] font-black text-purple-200 mt-2 uppercase text-right tracking-widest">10:47 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[70%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <p className="text-sm text-slate-700 leading-relaxed">What about meals?</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase text-right tracking-widest">10:50 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[70%] bg-[#7C3AED] p-4 rounded-2xl rounded-tr-none shadow-xl shadow-purple-900/20 text-white">
                        <p className="text-sm leading-relaxed">Breakfast and dinner are included. Lunch is scheduled at local scenic spots on your own.</p>
                        <p className="text-[9px] font-black text-purple-200 mt-2 uppercase text-right tracking-widest">10:52 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="p-5 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <input 
                        type="text" 
                        placeholder="Compose signal..." 
                        className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all"
                      />
                      <button className="w-12 h-12 bg-[#7C3AED] text-white flex items-center justify-center rounded-2xl hover:bg-[#8B5CF6] transition-all active:scale-90 shadow-lg shadow-purple-900/40">
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Settings Placeholder ── */}
          {activeSection === "Settings" && (
            <section className="card-premium p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto border border-slate-200 shadow-inner">
                <Settings size={40} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 m-0 tracking-tight uppercase">Configuration Sync</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Adjusting operational parameters...</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
