"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchBookings, fetchCompanyByOwner } from "@/lib/db";
import { formatPKR } from "@/lib/data";

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
      if (!profile?.id) return;
      setLoading(true);
      try {
        const company = await fetchCompanyByOwner(profile.id);
        if (company) {
          const bookings = await fetchBookings({ companyId: company.id });
          
          // Aggregate bookings by user
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
    if (!authLoading) load();
  }, [profile, authLoading]);

  if (loading || authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="topbar">
        <div>
          <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>Company Panel</div>
          <h1 className="topbar-title">👥 Customers</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-teal">{customers.length} Customers</span>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom:24 }}>
        {[
          { label:"Total Customers", value:customers.length, color:"var(--teal)", icon:"👥" },
          { label:"Frequent Travelers", value:customers.filter(c=>c.tours > 1).length, color:"var(--emerald)", icon:"✅" },
          { label:"Total Customer Value", value:formatPKR(customers.reduce((s,c)=>s+c.spent,0)), color:"var(--gold)", icon:"💰" },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        {customers.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
            No customer data available. Customers will appear here once they book your tours.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Customer</th><th>Contact</th><th>Tours Taken</th><th>Total Spent</th><th>Last Booking</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map((c,i)=>(
                  <tr key={i}>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div className="avatar" style={{ width:34,height:34,fontSize:13,flexShrink:0 }}>{c.name.charAt(0)}</div>
                        <div style={{ fontWeight:600 }}>{c.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize:13 }}>{c.email}</div>
                      <div style={{ fontSize:12,color:"var(--text-muted)" }}>{c.phone}</div>
                    </td>
                    <td style={{ fontWeight:700,color:"var(--teal)" }}>{c.tours}</td>
                    <td style={{ fontWeight:700,color:"var(--gold)" }}>{formatPKR(c.spent)}</td>
                    <td style={{ color:"var(--text-secondary)",fontSize:13 }}>{new Date(c.lastBooking).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:"flex",gap:6 }}>
                        <button className="btn btn-secondary btn-sm">View History</button>
                        <button className="btn btn-secondary btn-sm">📧 Message</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
