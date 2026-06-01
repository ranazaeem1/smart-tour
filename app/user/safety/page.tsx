"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import {
  Activity,
  AlertTriangle,
  CloudSun,
  Compass,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  Signal,
  Thermometer,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { MAPBOX_ACCESS_TOKEN } from "@/config/apis";
import { configureMapbox, fetchDrivingRoute, geocodeDestination, type GeocodedDestination } from "@/lib/mapbox";
import { supabase } from "@/lib/supabase";
import { useLiveLocation, type LiveLocation } from "@/hooks/useLiveLocation";
import { useLiveWeather } from "@/hooks/useLiveWeather";
import { useSafetyScores } from "@/hooks/useSafetyScores";
import { calculateRouteProgress, routeBounds, type Coordinates, type RouteSummary } from "@/utils/routeCalculation";

const DEFAULT_CENTER: Coordinates = { lat: 33.6844, lng: 73.0479 };
const ROUTE_SOURCE_ID = "smart-tour-route";
const ROUTE_LAYER_ID = "smart-tour-route-line";

type TripRecord = {
  id: string;
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
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreColor(tone)} transition-all duration-700`}
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

function MapCanvas({
  userLocation,
  destination,
  route,
}: {
  userLocation: LiveLocation | null;
  destination: GeocodedDestination | null;
  route: RouteSummary | null;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_ACCESS_TOKEN || mapRef.current) return;

    try {
      const mapbox = configureMapbox();
      mapRef.current = new mapbox.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
        zoom: 5,
        attributionControl: false,
      });

      mapRef.current.addControl(new mapbox.NavigationControl({ visualizePitch: true }), "bottom-right");
      mapRef.current.on("error", () => setMapError("Mapbox could not load the map tiles."));
    } catch {
      setMapError("Mapbox could not initialize.");
    }

    return () => {
      userMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const mapbox = configureMapbox();
    if (!userMarkerRef.current) {
      userMarkerRef.current = new mapbox.Marker({ color: "#22C55E" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapbox.Popup().setText("Your current location"))
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    if (!destination && !route) {
      map.easeTo({ center: [userLocation.lng, userLocation.lat], zoom: 11 });
    }
  }, [destination, route, userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !destination) return;

    const mapbox = configureMapbox();
    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new mapbox.Marker({ color: "#EF4444" })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapbox.Popup().setText(destination.placeName))
        .addTo(map);
    } else {
      destinationMarkerRef.current.setLngLat([destination.lng, destination.lat]);
    }
  }, [destination]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || !userLocation || !destination) return;

    const updateRoute = () => {
      const source = map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      const data: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      };

      if (source) {
        source.setData(data);
      } else {
        map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data });
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#16A34A",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      }

      const bounds = routeBounds(route.geometry, userLocation, destination);
      map.fitBounds([bounds.southwest, bounds.northeast], { padding: 70, maxZoom: 13, duration: 900 });
    };

    if (map.isStyleLoaded()) updateRoute();
    else map.once("load", updateRoute);
  }, [destination, route, userLocation]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <div>
          <MapPin className="mx-auto mb-4 text-amber-700" size={32} />
          <h2 className="text-xl font-black text-slate-950">Mapbox token missing</h2>
          <p className="mt-2 max-w-md text-sm font-bold text-amber-900">
            Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local, then restart the dev server to enable the interactive map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
      <div ref={containerRef} className="h-full w-full" role="application" aria-label="Interactive safety route map" />
      {mapError && (
        <div className="absolute left-4 top-4 max-w-sm rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 shadow-lg">
          {mapError}
        </div>
      )}
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
        setRouteError(MAPBOX_ACCESS_TOKEN ? "Destination not found. Try a more specific place name." : "Mapbox token is missing.");
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

  const startTracking = async () => {
    if (!location || !destination || !route) return;

    setSavingTrip(true);
    try {
      const { data, error } = await (supabase.from("trip_routes") as any)
        .insert({
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
        })
        .select("id")
        .single();

      if (error) throw error;
      setTrip(data as TripRecord);
      setTracking(true);
    } catch {
      setRouteError("Live tracking could not be saved. Check your Supabase trip_routes table and RLS policy.");
    } finally {
      setSavingTrip(false);
    }
  };

  useEffect(() => {
    if (!tracking || !trip?.id || !location) return;

    void (supabase.from("trip_routes") as any)
      .update({
        current_location_lat: location.lat,
        current_location_lng: location.lng,
        progress_percentage: progress,
        status: progress >= 100 ? "completed" : "active",
        completed_at: progress >= 100 ? new Date().toISOString() : null,
      })
      .eq("id", trip.id);
  }, [location, progress, tracking, trip?.id]);

  const destinationLabel = destination?.placeName || "Search a destination";

  return (
    <div className="space-y-8 bg-white text-slate-950">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live data
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Safety & Risk Map</h1>
            <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-slate-700">
              Real-time weather, scores, and risk alerts for your destination - updated from live API data.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
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
          {!MAPBOX_ACCESS_TOKEN && <StatusMessage tone="warning">Mapbox is not configured yet. Add the token to enable search, map rendering, and routes.</StatusMessage>}
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
        <MapCanvas userLocation={location} destination={destination} route={route} />
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
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
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
    </div>
  );
}
