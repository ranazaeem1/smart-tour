"use client";

import { useEffect, useState } from "react";
import { BarChart3, Calendar, MapPin, Search, Star, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import { buildMonthlyRevenueStats, fetchAllUsers, fetchBookings, fetchRevenueStats, fetchTours, isRevenueBooking } from "@/lib/db";
import { formatPKR } from "@/lib/data";

interface MonthStat {
  month: string;
  revenue: number;
  bookings: number;
}

interface TopDestination {
  name: string;
  bookings: number;
  pct: number;
}

export default function AdminAnalyticsPage() {
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([]);
  const [topDestinations, setTopDestinations] = useState<TopDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgBookingValue, setAvgBookingValue] = useState(0);
  const [bestRatedTour, setBestRatedTour] = useState("-");
  const [avgDuration, setAvgDuration] = useState("-");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [revenueStats, bookings, users, tours] = await Promise.all([
          fetchRevenueStats(),
          fetchBookings(),
          fetchAllUsers(),
          fetchTours({ admin: true }),
        ]);

        const monthlyData = revenueStats as MonthStat[];
        const hasMonthlyData = monthlyData.some(m => m.bookings > 0 || m.revenue > 0);
        setMonthlyStats(hasMonthlyData ? monthlyData : buildMonthlyRevenueStats(bookings as any[]));

        setTotalUsers(users.length);
        setTotalTours(tours.length);

        const revenueBookings = (bookings as any[]).filter(isRevenueBooking);
        const revenue = revenueBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
        setTotalRevenue(revenue);
        setAvgBookingValue(revenueBookings.length > 0 ? Math.round(revenue / revenueBookings.length) : 0);

        const destCount: Record<string, number> = {};
        (bookings as any[]).forEach((booking) => {
          const dest = booking.tours?.destination;
          if (dest) destCount[dest] = (destCount[dest] || 0) + 1;
        });

        const sortedDests = Object.entries(destCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const maxDest = sortedDests[0]?.[1] || 1;
        setTopDestinations(sortedDests.map(([name, count]) => ({
          name,
          bookings: count,
          pct: Math.round((count / maxDest) * 100),
        })));

        const sortedTours = [...(tours as any[])].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setBestRatedTour(sortedTours[0]?.title || "-");

        const duration =
          tours.length > 0
            ? `${((tours as any[]).reduce((sum, tour) => sum + (tour.duration || 0), 0) / tours.length).toFixed(1)} days`
            : "-";
        setAvgDuration(duration);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalBookings = monthlyStats.reduce((sum, month) => sum + month.bookings, 0);
  const maxBookings = Math.max(...monthlyStats.map(month => month.bookings), 1);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: <Users size={20} />, color: "#0F172A", bg: "bg-slate-100" },
    { label: "Total Tours", value: totalTours, icon: <MapPin size={20} />, color: "#10B981", bg: "bg-emerald-50" },
    { label: "Bookings", value: totalBookings, icon: <TrendingUp size={20} />, color: "#3B82F6", bg: "bg-blue-50" },
    { label: "Revenue", value: formatPKR(totalRevenue), icon: <Wallet size={20} />, color: "#F59E0B", bg: "bg-amber-50" },
  ];

  const metricGroups = [
    {
      title: "User Growth",
      icon: <Users size={16} />,
      stats: [
        { label: "Total Users", val: totalUsers.toString() },
        { label: "Total Tours", val: totalTours.toString() },
        { label: "Platform Revenue", val: formatPKR(totalRevenue) },
      ],
    },
    {
      title: "Tour Performance",
      icon: <Star size={16} />,
      stats: [
        { label: "Best Rated", val: bestRatedTour },
        { label: "Avg Duration", val: avgDuration },
        { label: "Total Tours", val: totalTours.toString() },
      ],
    },
    {
      title: "Revenue Health",
      icon: <Wallet size={16} />,
      stats: [
        { label: "Avg Booking", val: formatPKR(avgBookingValue) },
        { label: "Total Revenue", val: formatPKR(totalRevenue) },
        { label: "Total Bookings", val: totalBookings.toString() },
      ],
    },
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
            <BarChart3 size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight m-0">Analytics Overview</h1>
        </div>

        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black"
            placeholder="Search analytics..."
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-5">
              <div className={`p-3 rounded-xl ${stat.bg}`} style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <div className="text-3xl font-black mb-1 text-slate-950">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Booking Trend</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950 mb-6">Monthly Bookings</h2>

          {monthlyStats.every(month => month.bookings === 0) ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Calendar size={28} className="mx-auto mb-3 text-slate-400" />
              <p className="font-black text-slate-950">No booking data yet</p>
              <p className="text-sm font-bold text-slate-500 mt-1">Confirmed bookings will appear here.</p>
            </div>
          ) : (
            <div className="analytics-bookings-frame">
              {monthlyStats.map(month => (
                <div key={month.month} className="analytics-bookings-column">
                  <span className="analytics-bookings-count">{month.bookings || ""}</span>
                  <div
                    className="analytics-bookings-bar"
                    style={{ height: `${Math.max((month.bookings / maxBookings) * 150, month.bookings > 0 ? 10 : 3)}px`, opacity: month.bookings > 0 ? 1 : 0.2 }}
                    title={`${month.bookings} bookings`}
                  />
                  <span className="analytics-bookings-month">{month.month}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Destination Rank</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight m-0 text-slate-950 mb-6">Top Destinations</h2>

          <div className="space-y-4">
            {topDestinations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <Trophy size={28} className="mx-auto mb-3 text-slate-400" />
                <p className="font-black text-slate-950">No destination data yet</p>
              </div>
            ) : (
              topDestinations.map((dest, index) => (
                <article key={dest.name} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="text-base font-black text-slate-950 truncate m-0">{dest.name}</h3>
                        <span className="text-xs font-black text-emerald-600 whitespace-nowrap">{dest.bookings} bookings</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${dest.pct}%` }} />
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {metricGroups.map(group => (
          <section key={group.title} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="text-emerald-500">{group.icon}</div>
              <h3 className="text-lg font-black text-slate-950 m-0">{group.title}</h3>
            </div>
            <div className="space-y-3">
              {group.stats.map(row => (
                <div key={row.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                  <span className="text-sm font-black text-slate-950 text-right truncate">{row.val}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
