"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ClipboardList,
  Mail,
  MapPin,
  MessageSquare,
  Mountain,
  Shield,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  buildMonthlyRevenueStats,
  fetchBookings,
  fetchCompanies,
  fetchPlatformStats,
  fetchReviews,
  fetchRevenueStats,
  updateCompanyStatus,
} from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";

type Company = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  logo: string | null;
  status: string;
  verified: boolean;
  rating: number;
  total_tours: number;
  total_bookings: number;
  total_revenue: number;
  created_at: string;
};

type Booking = {
  id: string;
  travel_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  tours: { title: string; destination: string } | null;
  profiles: { full_name: string | null; email: string } | null;
  companies?: { name: string } | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  sentiment: string;
  created_at: string;
  tours: { title: string } | null;
  profiles: { full_name: string | null } | null;
};

const companyFilters = ["all", "pending", "approved"] as const;

export default function AdminDashboard() {
  const [companyFilter, setCompanyFilter] = useState<(typeof companyFilters)[number]>("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; bookings: number }[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCompanies: 0, activeTours: 0, platformRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        await fetchPlatformStats().catch(() => null);

        const [companiesData, bookingsData, reviewsData, revenueData, statsData] = await Promise.all([
          fetchCompanies().catch(() => []),
          fetchBookings().catch(() => []),
          fetchReviews().catch(() => []),
          fetchRevenueStats().catch(() => []),
          fetchPlatformStats().catch(() => ({ totalUsers: 0, totalCompanies: 0, activeTours: 0, platformRevenue: 0 })),
        ]);

        setCompanies(companiesData as Company[]);
        setBookings((bookingsData as Booking[]).slice(0, 6));
        setReviews((reviewsData as Review[]).slice(0, 4));
        setStats(statsData);

        const hasRevenueData = revenueData.some((m) => m.revenue > 0 || m.bookings > 0);
        setMonthlyRevenue(hasRevenueData ? revenueData : buildMonthlyRevenueStats(bookingsData as any[]));
      } catch (err) {
        console.error("[AdminDashboard] load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    const updated = await updateCompanyStatus(id, "approved");
    if (updated) setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status: "approved" } : c)));
    setApprovingId(null);
  };

  const handleSuspend = async (id: string) => {
    if (!confirm("Suspend this company?")) return;
    setApprovingId(id);
    const updated = await updateCompanyStatus(id, "suspended");
    if (updated) setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status: "suspended" } : c)));
    setApprovingId(null);
  };

  const pendingCompanies = companies.filter(c => c.status === "pending").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const filteredCompanies = companyFilter === "all" ? companies : companies.filter(c => c.status === companyFilter);
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);
  const hasMonthlyRevenue = monthlyRevenue.some(m => m.revenue > 0 || m.bookings > 0);
  const topRevenueMonth = monthlyRevenue.reduce((best, m) => (m.revenue > best.revenue ? m : best), { month: "-", revenue: 0, bookings: 0 });

  const adminStats = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users size={20} />, color: "#0F172A", bg: "bg-slate-100", dot: "#0F172A" },
    { label: "Companies", value: stats.totalCompanies, icon: <Building2 size={20} />, color: "#10B981", bg: "bg-emerald-50", dot: "#10B981" },
    { label: "Revenue", value: formatPKR(stats.platformRevenue), icon: <Wallet size={20} />, color: "#F59E0B", bg: "bg-amber-50", dot: "#F59E0B" },
    { label: "Active Tours", value: stats.activeTours, icon: <Mountain size={20} />, color: "#3B82F6", bg: "bg-blue-50", dot: "#3B82F6" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${s.bg}`} style={{ color: s.color }}>{s.icon}</div>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.dot }} />
            </div>
            <div className="text-3xl font-black mb-1 text-slate-950">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Ledger</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Platform Revenue</h2>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Total</p>
              <p className="text-sm font-black text-emerald-700">{formatPKR(stats.platformRevenue)}</p>
            </div>
          </div>

          {!hasMonthlyRevenue ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Wallet size={28} className="mx-auto mb-3 text-slate-400" />
              <p className="font-black text-slate-950">No monthly revenue yet</p>
              <p className="text-sm font-bold text-slate-500 mt-1">Bookings with travel dates will appear here.</p>
            </div>
          ) : (
            <div className="dashboard-revenue-frame">
              {monthlyRevenue.map(m => (
                <div key={m.month} className="dashboard-revenue-column">
                  <span className="dashboard-revenue-chip">{m.revenue > 0 ? formatPKR(m.revenue) : ""}</span>
                  <div
                    className="dashboard-revenue-bar"
                    style={{ height: `${Math.max((m.revenue / maxRevenue) * 150, m.revenue > 0 ? 10 : 3)}px`, opacity: m.revenue > 0 ? 1 : 0.2 }}
                    title={`${formatPKR(m.revenue)} - ${m.bookings} bookings`}
                  />
                  <span className="dashboard-revenue-month">{m.month}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peak Month</p>
              <p className="text-sm font-black text-slate-950 mt-1">{topRevenueMonth.month}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bookings</p>
              <p className="text-sm font-black text-slate-950 mt-1">{monthlyRevenue.reduce((sum, m) => sum + m.bookings, 0)}</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Action Center</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">System Alerts</h2>
            </div>
            <span className="badge badge-teal !rounded-full !px-4 !py-1.5 !text-[9px]">
              {pendingCompanies + pendingBookings > 0 ? `${pendingCompanies + pendingBookings} pending` : "All clear"}
            </span>
          </div>

          <div className="space-y-4">
            {pendingCompanies > 0 && (
              <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-amber-100 flex items-center justify-center text-amber-600">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-950 m-0">{pendingCompanies} company registration{pendingCompanies > 1 ? "s" : ""}</h3>
                  <p className="text-sm font-bold text-slate-500 truncate">Pending approval in company management.</p>
                </div>
                <Link href="/admin/companies" className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">Review</Link>
              </article>
            )}
            {pendingBookings > 0 && (
              <article className="rounded-3xl border border-blue-200 bg-blue-50 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-950 m-0">{pendingBookings} booking{pendingBookings > 1 ? "s" : ""}</h3>
                  <p className="text-sm font-bold text-slate-500 truncate">Awaiting confirmation from operators.</p>
                </div>
                <Link href="/admin/bookings" className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">View</Link>
              </article>
            )}
            {pendingCompanies === 0 && pendingBookings === 0 && (
              <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 m-0">All systems operational</h3>
                  <p className="text-sm font-bold text-slate-500">No pending approvals or booking actions.</p>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Partner Registry</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Tour Companies</h2>
          </div>
          <div className="flex w-full lg:w-auto overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {companyFilters.map(f => (
              <button
                key={f}
                className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  companyFilter === f ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"
                }`}
                onClick={() => setCompanyFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {filteredCompanies.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 font-bold">No companies found.</p>
            </div>
          ) : (
            filteredCompanies.map(c => (
              <article key={c.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-7">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                        {c.logo || c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-slate-950 truncate m-0">{c.name}</h3>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#{c.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-[2] w-full">
                    <InfoTile icon={<Mail size={16} />} label="Email" value={c.email} />
                    <InfoTile icon={<MapPin size={16} />} label="City" value={c.city || "-"} />
                    <InfoTile icon={<Mountain size={16} />} label="Tours" value={`${c.total_tours} live`} />
                    <InfoTile icon={<Wallet size={16} />} label="Revenue" value={c.total_revenue > 0 ? formatPKR(c.total_revenue) : "-"} />
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col items-center xl:items-end gap-3 w-full xl:w-auto">
                    <span className={`badge ${getStatusColor(c.status)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>{c.status}</span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                      <Star size={14} fill="currentColor" />
                      {c.rating > 0 ? c.rating : "N/A"}
                    </div>
                    {c.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 disabled:opacity-60" onClick={() => handleApprove(c.id)} disabled={approvingId === c.id}>
                          <Check size={15} /> Approve
                        </button>
                        <button className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all" onClick={() => handleSuspend(c.id)} disabled={approvingId === c.id} aria-label="Reject company">
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Booking Flow</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Recent Bookings</h2>
          </div>
          <Link href="/admin/bookings" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all">View All</Link>
        </div>

        <div className="space-y-5">
          {bookings.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 font-bold">No bookings yet.</p>
            </div>
          ) : (
            bookings.map(b => (
              <article key={b.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr_auto] gap-6 xl:items-center">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-950 truncate m-0">{b.profiles?.full_name || "Guest Traveler"}</h3>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{b.profiles?.email || "No email"}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InfoTile icon={<Mountain size={16} />} label="Tour" value={b.tours?.title || "-"} />
                    <InfoTile icon={<Calendar size={16} />} label="Date" value={b.travel_date || "-"} />
                    <InfoTile icon={<Wallet size={16} />} label="Amount" value={formatPKR(b.total_price)} />
                  </div>
                  <div className="flex xl:flex-col gap-2 xl:items-end">
                    <span className={`badge ${getStatusColor(b.status)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>{b.status}</span>
                    <span className={`badge ${getStatusColor(b.payment_status)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>{b.payment_status}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Traveler Feedback</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950">Reviews & Sentiment</h2>
          </div>
          <Link href="/admin/reviews" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all">All Reviews</Link>
        </div>

        <div className="space-y-5">
          {reviews.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 font-bold">No reviews yet.</p>
            </div>
          ) : (
            reviews.map(r => (
              <article key={r.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                      {(r.profiles?.full_name || "U").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-slate-950 truncate m-0">{r.profiles?.full_name || "Anonymous"}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{r.tours?.title || "Unknown Tour"}</p>
                    </div>
                  </div>
                  <div className="flex-[2] rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-sm font-bold leading-relaxed text-slate-700">{r.comment}</p>
                  </div>
                  <div className="flex flex-row xl:flex-col items-center xl:items-end gap-3">
                    <span className={`badge ${getStatusColor(r.sentiment)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>{r.sentiment}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(r.created_at).toLocaleDateString("en-PK")}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0">
      <div className="text-emerald-500 mb-2">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
