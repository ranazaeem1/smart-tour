"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { 
  Users, 
  CheckCircle2, 
  Wallet, 
  History, 
  MessageSquare, 
  Activity, 
  Mail, 
  Phone, 
  ArrowRight,
  User,
  Calendar
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  tours: number;
  spent: number;
  lastBooking: string;
  status: string;
}

export default function CompanyCustomersPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  useEffect(() => {
    async function load() {
      if (profile?.id) {
        setLoading(true);
        try {
          const company = await fetchCompanyByOwner(profile.id);
          if (company) {
            const bookings = await fetchBookings({ companyId: company.id });
            
            const userMap: Record<string, CustomerData> = {};
            
            bookings.forEach((b: any) => {
              const userId = b.user_id;
              if (!userMap[userId]) {
                userMap[userId] = {
                  name: b.profiles?.full_name || "Unknown User",
                  email: b.profiles?.email || "N/A",
                  phone: b.profiles?.phone || "N/A",
                  tours: 0,
                  spent: 0,
                  lastBooking: b.created_at,
                  status: "active"
                };
              }
              userMap[userId].tours += 1;
              userMap[userId].spent += b.total_price || 0;
              if (new Date(b.created_at) > new Date(userMap[userId].lastBooking)) {
                userMap[userId].lastBooking = b.created_at;
              }
            });
            
            setCustomers(Object.values(userMap).sort((a, b) => b.spent - a.spent));
          }
        } catch (err) {
          console.error("Failed to load customers:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Accessing CRM Database...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── CRM Hero Header ── */}
      <section className="bg-slate-950 rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 rounded-full mb-4 border border-slate-500/20">
              <Users size={12} className="text-slate-400" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">CRM & Relationship Hub</span>
            </div>
            <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Customer Directory
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">Manage your relationships with travelers and monitor lifetime value.</p>
          </div>

          <div className="text-right hidden md:block">
            <span className="badge badge-emerald !bg-emerald-500/20 !text-emerald-400 border border-emerald-500/30 font-black">
              {customers.length} ACTIVE RELATIONSHIPS
            </span>
          </div>
        </div>
      </section>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <StatCard 
          label="Total Customers"
          value={customers.length}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard 
          label="Frequent Travelers"
          value={customers.filter(c => c.tours > 1).length}
          icon={CheckCircle2}
          color="bg-slate-900"
        />
        <StatCard 
          label="Lifetime Value"
          value={formatPKR(customers.reduce((s, c) => s + c.spent, 0))}
          icon={Wallet}
          color="bg-amber-500"
        />
      </div>

      {/* ── Customer Ledger ── */}
      <section className="card-premium !p-0 overflow-hidden">
        <div className="p-8 border-b border-[var(--border)]">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] m-0">Directory Ledger</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {customers.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-[var(--muted-foreground)] font-black uppercase tracking-[0.2em] text-xs">No customer data synchronized.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Traveler</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Contact Protocol</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest text-center">Expeditions</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Lifetime Revenue</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Last Deployment</th>
                  <th className="px-8 py-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-[var(--muted)]/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] font-black shadow-lg">
                          {c.name.charAt(0)}
                        </div>
                        <p className="text-sm font-black text-[var(--foreground)] m-0">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <Mail size={12} className="text-emerald-500" />
                          <span className="text-[11px] font-medium">{c.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <Phone size={12} className="text-emerald-500" />
                          <span className="text-[11px] font-medium">{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-emerald-500">{c.tours} Units</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-emerald-500 m-0">{formatPKR(c.spent)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <Calendar size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{new Date(c.lastBooking).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-slate-900 hover:text-white rounded-xl border border-[var(--border)] transition-all">
                          <History size={16} />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-slate-900 hover:text-white rounded-xl border border-[var(--border)] transition-all">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
