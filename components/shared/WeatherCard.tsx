"use client";

import { useCallback, useEffect, useState } from "react";
import type { DestinationSafetyIntel } from "@/lib/safety-intelligence";
import { Cloud, Droplets, Eye, Gauge, Wind } from "lucide-react";

interface WeatherCardProps {
  destinationId: string;
  intel?: DestinationSafetyIntel | null;
  refreshKey?: number;
  onIntelLoaded?: (intel: DestinationSafetyIntel) => void;
}

export function WeatherCard({
  destinationId,
  intel: intelProp,
  refreshKey = 0,
  onIntelLoaded,
}: WeatherCardProps) {
  const [intel, setIntel] = useState<DestinationSafetyIntel | null>(intelProp ?? null);
  const [loading, setLoading] = useState(!intelProp);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (intelProp) {
      setIntel(intelProp);
      setLoading(false);
      onIntelLoaded?.(intelProp);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/safety/intelligence?destination=${destinationId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Weather fetch failed");
      const data = await res.json();
      setIntel(data.intel);
      onIntelLoaded?.(data.intel);
    } catch {
      setError("Could not load live weather.");
      setIntel(null);
    } finally {
      setLoading(false);
    }
  }, [destinationId, intelProp, onIntelLoaded]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (intelProp) setIntel(intelProp);
  }, [intelProp]);

  if (loading) {
    return (
      <div className="card-premium h-[180px] flex items-center justify-center">
        <div className="loading-spinner h-8 w-8" />
      </div>
    );
  }

  if (error || !intel) {
    return (
      <div className="card-premium p-8 text-center">
        <p className="text-sm text-rose-600 font-semibold">{error ?? "No weather data"}</p>
      </div>
    );
  }

  const { weather } = intel;
  const updatedLabel = new Date(intel.lastUpdated).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="card-premium !p-8 relative overflow-hidden group border-[var(--border)] shadow-[var(--shadow-lg)]">
      <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-2 border border-[var(--border)] shadow-sm">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.condition}
              className="w-16 h-16"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
              Live weather · {intel.destination.name}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-[36px] font-black text-[var(--foreground)] leading-none tracking-tighter">
                {weather.temp}°C
              </h2>
              <span className="text-sm font-bold text-[var(--muted-foreground)]">
                feels {weather.feelsLike}°C
              </span>
              <span className="text-[16px] font-bold text-emerald-600 capitalize">{weather.description}</span>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-2 font-medium">
              Updated {updatedLabel} · {intel.dataSourceLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Metric icon={<Droplets size={16} />} label="Humidity" value={`${weather.humidity}%`} />
          <Metric icon={<Wind size={16} />} label="Wind" value={`${weather.windSpeedKmh} km/h`} />
          <Metric icon={<Eye size={16} />} label="Visibility" value={`${weather.visibilityKm} km`} />
          <Metric icon={<Gauge size={16} />} label="Safety score" value={`${intel.score}/100`} />
        </div>
      </div>

      {intel.forecast.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[var(--border)] relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
            <Cloud size={12} /> Next hours (forecast)
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {intel.forecast.slice(0, 6).map((slot) => (
              <div
                key={slot.time}
                className="shrink-0 px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] min-w-[120px]"
              >
                <p className="text-[10px] font-bold text-[var(--muted-foreground)]">
                  {new Date(slot.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-lg font-black text-[var(--foreground)]">{slot.temp}°</p>
                <p className="text-[10px] capitalize text-[var(--muted-foreground)]">{slot.description}</p>
                <p className="text-[10px] font-bold text-amber-600 mt-1">{slot.pop}% rain chance</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-1 mb-1">
        {icon} {label}
      </p>
      <p className="text-lg font-black text-[var(--foreground)]">{value}</p>
    </div>
  );
}
