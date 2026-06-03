"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CloudSun,
  Compass,
  Gauge,
  LocateFixed,
  Navigation,
  RefreshCw,
  Route,
  Search,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Thermometer,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { SafetyLeafletRouteMap } from "@/components/shared/SafetyLeafletRouteMap";
import { fetchDrivingRoute, geocodeDestination, type GeocodedDestination } from "@/lib/osm";
import { supabase } from "@/lib/supabase";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import { useLiveWeather } from "@/hooks/useLiveWeather";
import { useSafetyScores } from "@/hooks/useSafetyScores";
import { calculateRouteProgress, type RouteSummary } from "@/utils/routeCalculation";

type TripRecord = {
  id: string;
  storage: "supabase" | "local";
};

function formatTime(value?: string | null) {
  if (!value) return "Not updated";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scoreColor(kind: "green" | "amber" | "red" | "orange" | "blue") {
  const colors = {
    green: "from-emerald-500 to-green-600",
    amber: "from-amber-400 to-orange-500",
    red: "from-red-500 to-rose-600",
    orange: "from-orange-400 to-amber-600",
    blue: "from-sky-500 to-blue-600",
  };
  return colors[kind];
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">{label}</p>
      <p className="mt-2 font-mono text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "orange" | "blue";
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <span className="text-sm font-black text-slate-950">{label}</span>
        <span className="font-mono text-sm font-black text-slate-900">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-md bg-slate-100">
        <div
          className={`h-full rounded-md bg-gradient-to-r ${scoreColor(tone)} transition-all duration-700`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function StatusMessage({ tone, children }: { tone: "error" | "warning" | "info"; children: React.ReactNode }) {
  const classes = {
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${classes[tone]}`}>
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export default function SafetyPage() {
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError, refresh: refreshLocation } = useLiveLocation();
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<GeocodedDestination | null>(null);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [searching, setSearching] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [savingTrip, setSavingTrip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  const weatherTarget = destination ?? location;
  const { weather, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useLiveWeather(weatherTarget);
  const { scores, loading: scoresLoading, error: scoresError, refetch: refetchScores } = useSafetyScores(destination);

  const progress = useMemo(
    () => (tracking ? calculateRouteProgress(location, route?.geometry ?? null) : 0),
    [location, route, tracking]
  );

  const calculateRoute = useCallback(
    async (nextDestination: GeocodedDestination) => {
      if (!location) {
        setRouteError("Allow location access before calculating a route.");
        return null;
      }

      try {
        const nextRoute = await fetchDrivingRoute(location, nextDestination);
        setRoute(nextRoute);
        setRouteError(null);
        return nextRoute;
      } catch (error) {
        setRoute(null);
        setRouteError(error instanceof Error ? error.message : "Route calculation failed.");
        return null;
      }
    },
    [location]
  );

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setRouteError("Enter a destination to search.");
      return;
    }

    setSearching(true);
    setRouteError(null);

    try {
      const found = await geocodeDestination(trimmed);
      if (!found) {
        setDestination(null);
        setRoute(null);
        setRouteError("Destination not found. Try a more specific place name.");
        return;
      }

      setDestination(found);
      await calculateRoute(found);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "Destination search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLocation().catch(() => null);
      if (destination) {
        await Promise.all([refetchWeather(true), refetchScores(), calculateRoute(destination)]);
      } else {
        await refetchWeather(true);
      }
      setLastUpdated(new Date().toISOString());
    } finally {
      setRefreshing(false);
    }
  };

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      await refreshLocation().catch(() => null);
      setSosOpen(true);
    } finally {
      setSosLoading(false);
    }
  };

  const startTracking = async () => {
    if (!location || !destination || !route) return;

    setSavingTrip(true);
    const tripPayload = {
      user_id: user?.id ?? null,
      origin_lat: location.lat,
      origin_lng: location.lng,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      route_geojson: route.geometry,
      distance_km: route.distanceKm,
      estimated_duration_minutes: route.durationMinutes,
      current_location_lat: location.lat,
      current_location_lng: location.lng,
      progress_percentage: progress,
      status: "active",
      started_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await (supabase.from("trip_routes") as any)
        .insert(tripPayload)
        .select("id")
        .single();

      if (error) throw error;
      setTrip({ id: data.id, storage: "supabase" });
      setTracking(true);
    } catch {
      const localTrip = {
        id: `local-${Date.now()}`,
        storage: "local" as const,
        ...tripPayload,
      };
      window.localStorage.setItem("smart-tour-active-trip", JSON.stringify(localTrip));
      setTrip({ id: localTrip.id, storage: "local" });
      setTracking(true);
      setRouteError(null);
    } finally {
      setSavingTrip(false);
    }
  };

  useEffect(() => {
    if (!tracking || !trip?.id || !location) return;

    const updatePayload = {
      current_location_lat: location.lat,
      current_location_lng: location.lng,
      progress_percentage: progress,
      status: progress >= 100 ? "completed" : "active",
      completed_at: progress >= 100 ? new Date().toISOString() : null,
    };

    if (trip.storage === "local") {
      const current = window.localStorage.getItem("smart-tour-active-trip");
      let parsed = {};
      try {
        parsed = current ? JSON.parse(current) : {};
      } catch {
        parsed = {};
      }
      window.localStorage.setItem("smart-tour-active-trip", JSON.stringify({ ...parsed, ...updatePayload }));
      return;
    }

    void (supabase.from("trip_routes") as any).update(updatePayload).eq("id", trip.id);
  }, [location, progress, tracking, trip?.id, trip?.storage]);

  const destinationLabel = destination?.placeName || "Search a destination";

  return (
    <div className="space-y-8 bg-white text-slate-950">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Safety & Risk Map</h1>
            <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-slate-700">
              Real-time weather, scores, and risk alerts for your destination - updated from live API data.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <button
              type="button"
              onClick={handleSOS}
              disabled={sosLoading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:opacity-60"
            >
              <ShieldAlert size={16} className={sosLoading ? "animate-pulse" : ""} />
              {sosLoading ? "Locating" : "SOS alert"}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing" : "Refresh now"}
            </button>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
              <Signal size={14} className="text-emerald-600" />
              Updated {formatTime(lastUpdated)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-8 grid gap-3 rounded-3xl bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="destination-search">
            Search destination
          </label>
          <input
            id="destination-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any destination in Pakistan or worldwide..."
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={searching}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            <Search size={16} />
            {searching ? "Searching" : "Search"}
          </button>
        </form>

        <div className="mt-4 grid gap-3">
          {locationError && <StatusMessage tone="warning">{locationError}</StatusMessage>}
          {routeError && <StatusMessage tone="error">{routeError}</StatusMessage>}
          {scoresError && <StatusMessage tone="warning">{scoresError}</StatusMessage>}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Selected destination</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{destinationLabel}</h2>
          </div>
          <p className="text-sm font-bold text-slate-700">
            {locationLoading ? "Locating you..." : location ? `Accuracy ${location.accuracy ?? 0} m` : "Location pending"}
          </p>
        </div>
        <SafetyLeafletRouteMap userLocation={location} destination={destination} route={route} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Weather</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{destination?.name || "Current location"}</h2>
            </div>
            <CloudSun className="text-emerald-600" size={28} />
          </div>

          {weatherLoading && !weather ? (
            <div className="h-40 rounded-2xl bg-slate-50 p-6 text-sm font-black text-slate-700">Loading weather...</div>
          ) : weather ? (
            <>
              <div className="flex items-end gap-3">
                <p className="font-mono text-6xl font-black text-slate-950">{weather.temperature}C</p>
                <p className="mb-2 text-sm font-black capitalize text-slate-700">{weather.condition}</p>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Thermometer size={16} className="text-emerald-600" />
                Feels like {weather.feelsLike}C
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <InfoBox label="Humidity" value={`${weather.humidity}%`} />
                <InfoBox label="Wind" value={`${weather.windSpeedKmh} km/h`} />
                <InfoBox label="Visibility" value={`${weather.visibilityKm} km`} />
                <InfoBox label="Updated" value={formatTime(weather.updatedAt)} />
              </div>
            </>
          ) : (
            <StatusMessage tone="warning">{weatherError || "Weather data will appear after location or destination is available."}</StatusMessage>
          )}
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Safety scores</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{scores.destination}</h2>
            </div>
            {scoresLoading ? <RefreshCw className="animate-spin text-emerald-600" /> : <ShieldCheck className="text-emerald-600" />}
          </div>
          <div className="space-y-5">
            <ScoreBar label="Overall Safety Score" value={scores.overallSafetyScore} tone="green" />
            <ScoreBar label="Weather Risk Factor" value={scores.weatherRiskFactor} tone="amber" />
            <ScoreBar label="Crime Risk" value={scores.crimeRisk} tone="red" />
            <ScoreBar label="Terrain Difficulty" value={scores.terrainDifficulty} tone="orange" />
            <ScoreBar label="Accessibility Score" value={scores.accessibilityScore} tone="blue" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">
            Updated {formatTime(scores.lastUpdated)}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Route information</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Live route</h2>
            </div>
            <Route className="text-emerald-600" size={28} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Distance" value={route ? `${route.distanceKm} km` : "--"} />
            <InfoBox label="Duration" value={route ? `${route.durationMinutes} min` : "--"} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Gauge size={16} className="text-emerald-600" />
                Journey progress
              </span>
              <span className="font-mono text-sm font-black text-slate-950">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-md bg-white">
              <div className="h-full rounded-md bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            type="button"
            onClick={startTracking}
            disabled={!destination || !route || !location || savingTrip || tracking}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {tracking ? <Activity size={16} /> : <LocateFixed size={16} />}
            {tracking ? "Tracking active" : savingTrip ? "Saving trip" : "Start live tracking"}
          </button>

          <div className="mt-5 space-y-2 text-sm font-bold text-slate-700">
            <p className="flex items-center gap-2">
              <Navigation size={15} className="text-emerald-600" />
              Origin: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Waiting for GPS"}
            </p>
            <p className="flex items-center gap-2">
              <Compass size={15} className="text-red-500" />
              Destination: {destination ? `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}` : "Not selected"}
            </p>
          </div>
        </article>
      </section>

      {sosOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-950">SOS Alert Ready</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
                  Your current location has been captured for emergency sharing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close SOS alert"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">Current coordinates</p>
              <p className="mt-2 font-mono text-lg font-black text-slate-950">
                {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Location unavailable"}
              </p>
              {locationError && <p className="mt-2 text-xs font-bold text-amber-700">{locationError}</p>}
            </div>

            <button
              type="button"
              onClick={() => setSosOpen(false)}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-red-500 px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-600"
            >
              Dismiss SOS panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
