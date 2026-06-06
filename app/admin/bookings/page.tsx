"use client";

import { useEffect, useState } from "react";
import { fetchBookings, updateBookingStatus } from "@/lib/db";
import { formatPKR, getStatusColor } from "@/lib/data";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

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

const filters = ["all", "confirmed", "pending", "completed", "cancelled"];

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
        if (data) setBookings(data as Booking[]);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const getTitle = (b: Booking) => b.tours?.title || b.tourTitle || "-";
  const getDate = (b: Booking) => b.travel_date || b.date || "-";
  const getGroup = (b: Booking) => b.group_size || b.groupSize || 0;
  const getPrice = (b: Booking) => b.total_price || b.totalPrice || 0;
  const getPayment = (b: Booking) => b.payment_status || b.paymentStatus || "pending";
  const getName = (b: Booking) => b.profiles?.full_name || b.userName || "Traveler";
  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase() || "TR";

  const getAccent = (status: string) => {
    if (status === "confirmed" || status === "completed") return "bg-emerald-500";
    if (status === "pending") return "bg-amber-500";
    if (status === "cancelled") return "bg-rose-500";
    return "bg-slate-300";
  };

  const handleConfirm = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, "confirmed");
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: "confirmed", payment_status: "paid" } : b)));
    } catch (err) {
      console.error("Booking confirmation error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, "cancelled");
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: "cancelled" } : b)));
    } catch (err) {
      console.error("Booking rejection error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        getName(b).toLowerCase().includes(term) ||
        getTitle(b).toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term)
      );
    });

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: <ClipboardList size={18} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, icon: <CheckCircle size={18} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: <Clock size={18} />, color: "#F59E0B", bg: "bg-amber-50" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: <CheckCircle2 size={18} />, color: "#8B5CF6", bg: "bg-violet-50" },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Management</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Reservation Ledger</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search customers, tours, or IDs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-5 rounded-2xl transition-all hover:border-emerald-500/20 hover:shadow-xl">
            <div className="flex items-start justify-between mb-4">
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Filters</span>
          </div>

          <div className="flex w-full lg:w-auto overflow-x-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
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
        </div>

        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-400 mb-8 shadow-inner border border-slate-200">
                <ClipboardList size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-950 mb-2 tracking-tight">Zero Records</h2>
              <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed uppercase text-[10px] tracking-widest">
                No reservations match your criteria.
              </p>
            </div>
          ) : (
            filtered.map((booking, idx) => {
              const traveler = getName(booking);
              const payment = getPayment(booking);
              const status = booking.status;

              return (
                <article
                  key={booking.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex group hover:shadow-2xl transition-all duration-500 animate-fade"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={`w-2 shrink-0 ${getAccent(status)}`} />

                  <div className="flex-1 p-6 md:p-8 flex flex-col xl:flex-row items-center gap-7">
                    <div className="w-full xl:w-32 flex flex-col items-center xl:items-start text-center xl:text-left">
                      <span className={`badge ${getStatusColor(status)} !px-4 !py-1.5 !rounded-full !text-[9px] !font-black !uppercase !tracking-widest mb-3 w-full text-center border`}>
                        {status}
                      </span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">#{booking.id.slice(0, 8)}</p>
                    </div>

                    <div className="flex-1 min-w-0 text-center xl:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Details</p>
                      <div className="flex items-center justify-center xl:justify-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 font-black text-xs">
                          {traveler === "Traveler" ? <User size={18} /> : getInitials(traveler)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg font-black text-slate-950 truncate m-0 leading-tight">{traveler}</h4>
                          <p className="text-xs font-bold text-emerald-500 mt-1">Private Contact</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-[1.45] min-w-0 text-center xl:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expedition</p>
                      <h4 className="text-base font-black text-slate-950 truncate m-0 mb-3">{getTitle(booking)}</h4>
                      <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{getDate(booking)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Users size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{getGroup(booking)} Personnel</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-44 text-center xl:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valuation</p>
                      <p className="text-3xl font-black text-emerald-500 tracking-tighter">{formatPKR(getPrice(booking))}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${payment === "paid" ? "text-emerald-500" : "text-amber-500"}`}>
                        {payment}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
                      {status === "pending" && (
                        <>
                          <button
                            className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={updatingId === booking.id}
                            aria-label="Confirm booking"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            className="w-12 h-12 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg disabled:opacity-60"
                            onClick={() => handleReject(booking.id)}
                            disabled={updatingId === booking.id}
                            aria-label="Reject booking"
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}

                      <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-600 active:scale-95">
                        Initiate Signal
                        <ArrowRight size={14} />
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
