"use client";
import { useEffect, useState } from "react";
import { fetchCompanies, updateCompanyStatus } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";
import { Building2, CheckCircle, Clock, XCircle, Search, Filter, MoreVertical, Star } from "lucide-react";

interface Company {
  id: string; name: string; email: string; phone?: string | null;
  city?: string | null; logo?: string | null; status: CompanyStatus;
  verified: boolean; rating: number; total_tours: number;
  total_bookings: number; total_revenue: number; created_at: string;
}

type CompanyStatus = "pending" | "approved" | "suspended" | "rejected";

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
        if (data) {
          setCompanies(data as Company[]);
        }
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
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, verified: newStatus === 'approved' } : c));
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionId(null);
    }
  };

  const filtered = companies
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = [
    { label: "Total Partners", value: companies.length, icon: <Building2 size={20} />, color: "var(--foreground)" },
    { label: "Approved", value: companies.filter(c => c.status === "approved").length, icon: <CheckCircle size={20} />, color: "var(--emerald)" },
    { label: "Pending", value: companies.filter(c => c.status === "pending").length, icon: <Clock size={20} />, color: "var(--gold)" },
    { label: "Suspended", value: companies.filter(c => c.status === "suspended").length, icon: <XCircle size={20} />, color: "var(--rose)" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight inline-flex items-center gap-2"><Building2 size={24} /> Company Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] font-medium">Verify and manage tour operator partnerships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} />
            <input 
              className="input !pl-10 !py-2.5 !text-xs w-[240px]" 
              placeholder="Search companies..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[var(--muted)]/50" style={{ color: s.color }}>{s.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Network</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="card !p-0 overflow-hidden">
        {/* Table Filter Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/10">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--muted-foreground)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Filter Status</span>
          </div>
          <div className="flex gap-1 bg-[var(--muted)]/50 p-1 rounded-xl">
            {["all", "approved", "pending", "suspended"].map(f => (
              <button 
                key={f} 
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th>Tours</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-[var(--muted-foreground)] font-medium">
                    No company partnerships found matching your criteria.
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--gradient-main)] flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {c.logo || c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-[11px] text-[var(--muted-foreground)] font-medium">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">🇵🇰 {c.city || "Pakistan"}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Since {new Date(c.created_at).getFullYear()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-black text-sm">{c.total_tours}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] ml-1">Live</span>
                  </td>
                  <td>
                    <div className="font-black text-xs text-[var(--emerald)]">{formatPKR(c.total_revenue)}</div>
                    <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-tighter">Gross Earnings</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black">{c.rating || "N/A"}</span>
                      <Star size={14} className="text-[var(--gold)]" fill="currentColor" />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      {c.status === "pending" && (
                        <button 
                          className="btn btn-emerald !px-4 !py-2 !text-[10px]"
                          onClick={() => handleStatusUpdate(c.id, "approved")}
                          disabled={actionId === c.id}
                        >
                          Approve
                        </button>
                      )}
                      {c.status === "approved" && (
                        <button 
                          className="btn btn-secondary !px-4 !py-2 !text-[10px] border-rose-500/20 hover:border-rose-500/40 text-rose-500"
                          onClick={() => handleStatusUpdate(c.id, "suspended")}
                          disabled={actionId === c.id}
                        >
                          Suspend
                        </button>
                      )}
                      {(c.status === "suspended" || c.status === "rejected") && (
                        <button 
                          className="btn btn-emerald !px-4 !py-2 !text-[10px]"
                          onClick={() => handleStatusUpdate(c.id, "approved")}
                          disabled={actionId === c.id}
                        >
                          Restore
                        </button>
                      )}
                      <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)]">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
