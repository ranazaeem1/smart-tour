"use client";

import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/lib/db";
import { Building2, Calendar, CheckCircle2, Mail, Phone, Search, Shield, UserCheck, Users, UserX } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  status?: string;
}

const filters = ["all", "user", "company", "admin", "suspended"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAllUsers();
      if (data) {
        const userProfiles = data as Partial<UserProfile>[];
        setUsers(userProfiles.map(u => ({ ...u, status: u.status || "active" })) as UserProfile[]);
      }
      setLoading(false);
    }

    load();
  }, []);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)));
  };

  const filtered = users
    .filter(u => filter === "all" || (filter === "suspended" ? u.status === "suspended" : u.role === filter))
    .filter(u => {
      if (!search) return true;
      const term = search.toLowerCase();
      const name = (u.full_name || "").toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(term) || email.includes(term);
    });

  const activeCount = users.filter(u => u.status !== "suspended").length;
  const suspendedCount = users.filter(u => u.status === "suspended").length;

  const stats = [
    { label: "Total Users", value: users.length, icon: <Users size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Active", value: activeCount, icon: <UserCheck size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Suspended", value: suspendedCount, icon: <UserX size={20} />, color: "#EF4444", bg: "bg-rose-50" },
    { label: "Companies", value: users.filter(u => u.role === "company").length, icon: <Building2 size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
  ];

  const roleClass = (role: string) => {
    if (role === "admin") return "badge-rose";
    if (role === "company") return "badge-purple";
    return "badge-emerald";
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
            <Users size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Identity Registry</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Users Management</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
              <p className="text-slate-500 font-bold">No users found.</p>
            </div>
          ) : (
            filtered.map(user => {
              const name = user.full_name || "Unnamed User";
              const suspended = user.status === "suspended";

              return (
                <article key={user.id} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 hover:shadow-xl transition-all">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-7">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl font-black text-slate-950 truncate m-0">{name}</h2>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#{user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-[2] w-full">
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <Mail size={16} className="text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <Phone size={16} className="text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{user.phone || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <Shield size={16} className="text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</p>
                        <span className={`badge ${roleClass(user.role)} !rounded-full !px-3 !py-1 !text-[9px]`}>{user.role}</span>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <Calendar size={16} className="text-emerald-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</p>
                        <p className="text-sm font-bold text-slate-700">{user.created_at ? new Date(user.created_at).toLocaleDateString("en-PK") : "-"}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col items-center xl:items-end gap-3 w-full xl:w-auto">
                      <span className={`badge ${suspended ? "badge-rose" : "badge-emerald"} !rounded-full !px-4 !py-1.5 !text-[9px]`}>
                        {suspended ? "Suspended" : "Active"}
                      </span>
                      <button
                        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          suspended ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white"
                        }`}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {suspended ? <CheckCircle2 size={15} /> : <UserX size={15} />}
                        {suspended ? "Restore" : "Suspend"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
