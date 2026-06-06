"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import { Calendar, CheckCircle2, History, Mail, MessageSquare, Phone, Search, Users, Wallet } from "lucide-react";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  tours: number;
  spent: number;
  lastBooking: string;
  status: string;
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: React.ReactNode; icon: any; tone: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <span className={`absolute top-5 right-5 h-2 w-2 rounded-full ${tone.includes("emerald") ? "bg-emerald-500" : tone.includes("amber") ? "bg-amber-500" : "bg-slate-900"}`} />
      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <Icon size={15} className="text-emerald-500 mb-3" />
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800 truncate">{value}</p>
    </div>
  );
}

export default function CompanyCustomersPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        if (!company) return;
        const bookings = await fetchBookings({ companyId: company.id });
        const userMap: Record<string, CustomerData> = {};

        bookings.forEach((booking: any) => {
          const userId = booking.user_id;
          if (!userMap[userId]) {
            userMap[userId] = {
              name: booking.profiles?.full_name || "Unknown User",
              email: booking.profiles?.email || "N/A",
              phone: booking.profiles?.phone || "N/A",
              tours: 0,
              spent: 0,
              lastBooking: booking.created_at,
              status: "active",
            };
          }
          userMap[userId].tours += 1;
          userMap[userId].spent += booking.total_price || 0;
          if (new Date(booking.created_at) > new Date(userMap[userId].lastBooking)) userMap[userId].lastBooking = booking.created_at;
        });

        setCustomers(Object.values(userMap).sort((a, b) => b.spent - a.spent));
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [profile, authLoading]);

  const filtered = useMemo(
    () => customers.filter(customer => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(search.toLowerCase())),
    [customers, search]
  );
  const totalValue = customers.reduce((sum, customer) => sum + customer.spent, 0);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Users size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Customer Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Customers</h1>
        </div>

        <div className="relative w-full xl:w-96">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder="Search customer, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Customers" value={customers.length} icon={Users} tone="bg-emerald-50 text-emerald-500" />
        <StatCard label="Repeat Travelers" value={customers.filter(c => c.tours > 1).length} icon={CheckCircle2} tone="bg-slate-100 text-slate-900" />
        <StatCard label="Lifetime Value" value={formatPKR(totalValue)} icon={Wallet} tone="bg-amber-50 text-amber-500" />
        <StatCard label="Avg Customer" value={customers.length ? formatPKR(Math.round(totalValue / customers.length)) : "PKR 0"} icon={History} tone="bg-slate-100 text-slate-900" />
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Users size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No customers found</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Customer records appear after bookings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((customer, index) => (
              <article key={`${customer.email}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                  <div className="flex items-center gap-4 min-w-0 xl:w-72">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-950">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-950 truncate">{customer.name}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">{customer.status}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
                    <DetailTile icon={Mail} label="Email" value={customer.email} />
                    <DetailTile icon={Phone} label="Phone" value={customer.phone} />
                    <DetailTile icon={CheckCircle2} label="Tours" value={`${customer.tours} booked`} />
                    <DetailTile icon={Wallet} label="Spent" value={formatPKR(customer.spent)} />
                    <DetailTile icon={Calendar} label="Last Booking" value={new Date(customer.lastBooking).toLocaleDateString()} />
                  </div>

                  <div className="flex gap-2 xl:justify-end">
                    <button className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-950 hover:text-white transition-all" aria-label="View history">
                      <History size={16} className="mx-auto" />
                    </button>
                    <button className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-950 hover:text-white transition-all" aria-label="Message customer">
                      <MessageSquare size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
