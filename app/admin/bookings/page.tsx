"use client";
import { useEffect, useState } from "react";
import { fetchBookings, updateBookingStatus } from "@/lib/db";
import { BOOKINGS, formatPKR, getStatusColor } from "@/lib/data";
import { ClipboardList, CheckCircle, Clock, CheckCircle2, Search, Filter, MoreVertical, CreditCard, Users, Calendar } from "lucide-react";

interface Booking {
  id: string;
  travel_date?: string;
  date?: string;
  group_size?: number;
  groupSize?: number;
  total_price?: number;
  totalPrice?: number;
  status: string;
  payment_status?: string;
  paymentStatus?: string;
  tours?: { title: string; destination: string } | null;
  tourTitle?: string;
  destination?: string;
  profiles?: { full_name: string | null; email: string } | null;
  userName?: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchBookings();
        if (data && data.length > 0) {
          setBookings(data as Booking[]);
        } else {
          setBookings(BOOKINGS as unknown as Booking[]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getTitle = (b: Booking) => b.tours?.title || (b as any).tourTitle || "—";
  const getDate = (b: Booking) => b.travel_date || (b as any).date || "—";
  const getGroup = (b: Booking) => b.group_size || (b as any).groupSize || 0;
  const getPrice = (b: Booking) => b.total_price || (b as any).totalPrice || 0;
  const getPayment = (b: Booking) => b.payment_status || (b as any).paymentStatus || "pending";
  const getName = (b: Booking) => b.profiles?.full_name || (b as any).userName || "—";

  const handleConfirm = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, "confirmed");
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed", payment_status: "paid" } : b));
    } catch (err) {
      console.error("Booking confirmation error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const name = getName(b).toLowerCase();
      const title = getTitle(b).toLowerCase();
      return name.includes(search.toLowerCase()) || title.includes(search.toLowerCase());
    });

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: <ClipboardList size={18} />, color: "#FFFFFF" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, icon: <CheckCircle size={18} />, color: "#10B981" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: <Clock size={18} />, color: "#F59E0B" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: <CheckCircle2 size={18} />, color: "#8B5CF6" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div className="animate-fade space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Inventory Management</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Reservation Ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
            <input 
              className="input !pl-10 !py-2.5 !text-xs w-full sm:w-[300px] !bg-zinc-900/50" 
              placeholder="Search customers, tours, or IDs..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Stats Grid - FIXED ALIGNMENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl transition-all hover:border-emerald-500/20 hover:bg-zinc-900/60">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-xl bg-white/5" style={{ color: s.color }}>{s.icon}</div>
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Filters</span>
          </div>
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
            {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
              <button 
                key={f} 
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${filter === f ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-500 hover:text-white"}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Data Grid */}
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="bg-white/2">
                <th className="px-6 py-4 text-left">Customer Details</th>
                <th className="px-6 py-4 text-left">Expedition</th>
                <th className="px-6 py-4 text-left">Schedule</th>
                <th className="px-6 py-4 text-left">Volume</th>
                <th className="px-6 py-4 text-left">Valuation</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-white/5 rounded-full text-zinc-700"><ClipboardList size={32} /></div>
                      <p className="text-zinc-500 font-bold">No reservations match your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="group hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-white/5">
                        {getName(b).charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-none mb-1">{getName(b)}</div>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">#{b.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-zinc-300 leading-tight">{getTitle(b)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar size={12} className="text-zinc-600" />
                      <span className="text-[11px] font-medium">{getDate(b)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-zinc-600" />
                      <span className="text-xs font-black">{getGroup(b)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={12} className="text-zinc-600" />
                      <span className="text-xs font-black text-emerald-500">{formatPKR(getPrice(b))}</span>
                    </div>
                    <div className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border w-fit ${getPayment(b) === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                      {getPayment(b)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(b.status)} !px-2 !py-1 !rounded-md !text-[8px]`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {b.status === "pending" && (
                        <button 
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-600/20"
                          onClick={() => handleConfirm(b.id)}
                          disabled={updatingId === b.id}
                        >
                          {updatingId === b.id ? "..." : "Confirm"}
                        </button>
                      )}
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-600 hover:text-white">
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
