"use client";
import { useEffect, useState } from "react";
import { fetchRevenueStats, fetchBookings, fetchAllUsers, fetchTours } from "@/lib/db";
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

  // Derived metrics
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgBookingValue, setAvgBookingValue] = useState(0);
  const [bestRatedTour, setBestRatedTour] = useState("—");
  const [avgDuration, setAvgDuration] = useState("—");

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

        // Monthly chart data
        setMonthlyStats(revenueStats as MonthStat[]);

        // Platform-wide metrics
        setTotalUsers(users.length);
        setTotalTours(tours.length);

        const revenue = (bookings as any[]).reduce(
          (sum: number, b: any) => sum + (b.total_price || 0),
          0
        );
        setTotalRevenue(revenue);
        setAvgBookingValue(
          bookings.length > 0 ? Math.round(revenue / bookings.length) : 0
        );

        // Top destinations from bookings
        const destCount: Record<string, number> = {};
        (bookings as any[]).forEach((b: any) => {
          const dest = b.tours?.destination;
          if (dest) destCount[dest] = (destCount[dest] || 0) + 1;
        });

        const sortedDests = Object.entries(destCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const maxDest = sortedDests[0]?.[1] || 1;
        setTopDestinations(
          sortedDests.map(([name, count]) => ({
            name,
            bookings: count,
            pct: Math.round((count / maxDest) * 100),
          }))
        );

        // Tour performance
        const sorted = [...(tours as any[])].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        setBestRatedTour(sorted[0]?.title || "—");

        const avgDur =
          tours.length > 0
            ? (
                (tours as any[]).reduce(
                  (s: number, t: any) => s + (t.duration || 0),
                  0
                ) / tours.length
              ).toFixed(1) + " days"
            : "—";
        setAvgDuration(avgDur);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxBookings = Math.max(...monthlyStats.map((m) => m.bookings), 1);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <span className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Platform Insights */}

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">📅 Monthly Bookings</h2>
          </div>
          {monthlyStats.every((m) => m.bookings === 0) ? (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              No booking data yet
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                height: 180,
                paddingBottom: 28,
              }}
            >
              {monthlyStats.map((m) => (
                <div
                  key={m.month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 2 }}>
                    {m.bookings || ""}
                  </div>
                  <div
                    style={{
                      width: "70%",
                      borderRadius: "4px 4px 0 0",
                      background: `linear-gradient(180deg,var(--teal),var(--teal-dark))`,
                      height: `${((m.bookings || 0) / maxBookings) * 140}px`,
                      minHeight: m.bookings > 0 ? 4 : 1,
                      opacity: m.bookings > 0 ? 1 : 0.15,
                    }}
                  />
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {m.month}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            🏆 Top Destinations
          </h2>
          {topDestinations.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>
              No destination data yet
            </div>
          ) : (
            topDestinations.map((d) => (
              <div key={d.name} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: "var(--teal)" }}>{d.bookings} bookings</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid-3" style={{ gap: 24 }}>
        {[
          {
            title: "User Growth",
            stats: [
              { label: "Total Users", val: totalUsers.toString() },
              { label: "Total Tours", val: totalTours.toString() },
              { label: "Platform Revenue", val: formatPKR(totalRevenue) },
            ],
          },
          {
            title: "Tour Performance",
            stats: [
              { label: "Best Rated", val: bestRatedTour },
              { label: "Avg Duration", val: avgDuration },
              { label: "Total Tours", val: totalTours.toString() },
            ],
          },
          {
            title: "Revenue Health",
            stats: [
              { label: "Avg Booking", val: formatPKR(avgBookingValue) },
              { label: "Total Revenue", val: formatPKR(totalRevenue) },
              {
                label: "Total Bookings",
                val: monthlyStats
                  .reduce((s, m) => s + m.bookings, 0)
                  .toString(),
              },
            ],
          },
        ].map((s) => (
          <div key={s.title} className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{s.title}</h3>
            {s.stats.map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: "var(--teal)" }}>{r.val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
