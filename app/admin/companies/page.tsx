"use client";

import { useEffect, useState } from "react";
import { fetchCompanies, updateCompanyStatus } from "@/lib/db";
import { formatPKR } from "@/lib/data";
import {
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Mountain,
  Search,
  Star,
  UserX,
  Wallet,
  XCircle,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  ntn_number?: string | null;
  applicant_name?: string | null;
  applicant_email?: string | null;
  applicant_phone?: string | null;
  city?: string | null;
  logo?: string | null;
  status: CompanyStatus;
  verified: boolean;
  rating: number;
  total_tours: number;
  total_bookings: number;
  total_revenue: number;
  created_at: string;
}

type CompanyStatus = "pending" | "approved" | "suspended" | "rejected";

const filters = ["all", "approved", "pending", "suspended"];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchCompanies();
        if (data) setCompanies(data as Company[]);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CompanyStatus) => {
    setActionId(id);
    try {
      const updated = await updateCompanyStatus(id, newStatus);
      if (updated) {
        setCompanies(prev =>
          prev.map(c => (c.id === id ? { ...c, status: newStatus, verified: newStatus === "approved" } : c))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionId(null);
    }
  };

  const filtered = companies
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.ntn_number || "").includes(term) ||
        (c.applicant_name || "").toLowerCase().includes(term) ||
        (c.city || "").toLowerCase().includes(term)
      );
    });

  const stats = [
    { label: "Total Partners", value: companies.length, icon: <Building2 size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Approved", value: companies.filter(c => c.status === "approved").length, icon: <CheckCircle size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Pending", value: companies.filter(c => c.status === "pending").length, icon: <Clock size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Suspended", value: companies.filter(c => c.status === "suspended").length, icon: <XCircle size={20} />, color: "#EF4444", bg: "bg-rose-50" },
  ];

  const statusClass = (status: CompanyStatus) => {
    if (status === "approved") return "badge-emerald";
    if (status === "pending") return "badge-amber";
    return "badge-rose";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Partner Registry</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Company Management</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search company, applicant, NTN, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${s.bg}`} style={{ color: s.color }}>
                {s.icon}
              </div>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            </div>
            <div className="text-3xl font-black mb-1 text-slate-950">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex w-full overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
          {filters.map(f => (
            <button
              key={f}
              className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 font-bold">No company partnerships found.</p>
            </div>
          ) : (
            filtered.map(c => (
              <article key={c.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                <div className="flex flex-col xl:flex-row xl:items-center gap-7">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                        {c.logo || c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-black text-slate-950 truncate m-0">{c.name}</h2>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#{c.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-[2] w-full">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Mail size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.email}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Building2 size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">NTN License</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.ntn_number || "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <MapPin size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Phone</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.phone || "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <Calendar size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</p>
                      <p className="text-sm font-bold text-slate-700">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-PK") : "-"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full xl:w-[520px]">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                      <Mail size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.applicant_name || "User"}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                      <Mail size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.applicant_email || c.email}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                      <Mountain size={16} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User Phone</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{c.applicant_phone || "-"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col items-center xl:items-end gap-3 w-full xl:w-auto">
                    <span className={`badge ${statusClass(c.status)} !rounded-full !px-4 !py-1.5 !text-[9px]`}>
                      {c.status}
                    </span>
                    <div className="flex flex-col items-center xl:items-end gap-1">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                        <Star size={14} fill="currentColor" />
                        {c.rating || "N/A"}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-black">
                        <Wallet size={14} />
                        {formatPKR(c.total_revenue)}
                      </div>
                    </div>
                    {c.status === "pending" && (
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
                        onClick={() => handleStatusUpdate(c.id, "approved")}
                        disabled={actionId === c.id}
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </button>
                    )}
                    {c.status === "approved" && (
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-50 px-5 text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-200 transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-60"
                        onClick={() => handleStatusUpdate(c.id, "suspended")}
                        disabled={actionId === c.id}
                      >
                        <UserX size={15} />
                        Suspend
                      </button>
                    )}
                    {(c.status === "suspended" || c.status === "rejected") && (
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
                        onClick={() => handleStatusUpdate(c.id, "approved")}
                        disabled={actionId === c.id}
                      >
                        <CheckCircle2 size={15} />
                        Restore
                      </button>
                    )}
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
