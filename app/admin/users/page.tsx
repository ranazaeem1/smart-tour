"use client";
import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/lib/db";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string; email: string; full_name: string | null; role: string;
  avatar_url: string | null; phone: string | null; created_at: string;
  status?: string;
}

const MOCK_USERS = [
  { id: "1", email: "ali@gmail.com", full_name: "Ali Hassan", role: "user", avatar_url: null, phone: "0300-1234567", created_at: "2023-06-10", status: "active" },
  { id: "2", email: "sara@gmail.com", full_name: "Sara Khan", role: "user", avatar_url: null, phone: "0311-7654321", created_at: "2023-08-20", status: "active" },
  { id: "3", email: "umar@gmail.com", full_name: "Umar Farooq", role: "user", avatar_url: null, phone: "0333-9876543", created_at: "2022-12-05", status: "active" },
  { id: "4", email: "fatima@gmail.com", full_name: "Fatima Malik", role: "user", avatar_url: null, phone: "0321-1111222", created_at: "2023-03-14", status: "active" },
  { id: "5", email: "bilal@gmail.com", full_name: "Bilal Ahmed", role: "user", avatar_url: null, phone: "0345-5556666", created_at: "2024-01-30", status: "suspended" },
  { id: "6", email: "ayesha@gmail.com", full_name: "Ayesha Noor", role: "user", avatar_url: null, phone: "0312-3334445", created_at: "2023-10-01", status: "active" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAllUsers();
      if (data && data.length > 0) {
        setUsers(data as UserProfile[]);
      } else {
        setUsers(MOCK_USERS as UserProfile[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  };

  const filtered = users
    .filter(u => filter === "all" || (filter === "suspended" ? u.status === "suspended" : u.role === filter))
    .filter(u => {
      if (!search) return true;
      const name = (u.full_name || "").toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    });

  const activeCount = users.filter(u => u.status !== "suspended").length;
  const suspendedCount = users.filter(u => u.status === "suspended").length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin Panel</div>
          <h1 className="topbar-title">👥 User Management</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{users.length} Total Users</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Users", value: users.length, color: "var(--teal)", icon: "👥" },
          { label: "Active", value: activeCount, color: "var(--emerald)", icon: "✅" },
          { label: "Suspended", value: suspendedCount, color: "var(--rose)", icon: "🚫" },
          { label: "Companies", value: users.filter(u => u.role === "company").length, color: "var(--gold)", icon: "🏢" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label className="input-label">🔍 Search Users</label>
          <input className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs" style={{ alignSelf: "flex-end" }}>
          {["all", "user", "company", "admin", "suspended"].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No users found
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>
                        {(u.full_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600 }}>{u.full_name || "—"}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.phone || "—"}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-rose" : u.role === "company" ? "badge-purple" : "badge-teal"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-PK") : "—"}
                  </td>
                  <td>
                    <span className={`badge ${u.status === "suspended" ? "badge-rose" : "badge-emerald"}`}>
                      {u.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm">View</button>
                      <button
                        className={`btn btn-sm ${u.status === "suspended" ? "btn-primary" : "btn-danger"}`}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === "suspended" ? "✅ Restore" : "🚫 Suspend"}
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
