"use client";
import { useEffect, useState } from "react";
import { fetchWeather, WeatherData } from "@/lib/weather";

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather(lat: number, lon: number) {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setLoading(false);
    }

    if (!navigator.geolocation) {
      loadWeather(33.6844, 73.0479);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => loadWeather(position.coords.latitude, position.coords.longitude),
      () => loadWeather(33.6844, 73.0479)
    );
  }, []);

  if (loading) return (
    <div className="card-premium h-[140px] flex items-center justify-center">
      <div className="loading-spinner h-8 w-8" />
    </div>
  );

  if (!weather && !loading) return null;

  if (!weather) return null;

  return (
    <div className="card-premium flex items-center justify-between !p-8 relative overflow-hidden group border-[var(--border)] shadow-[var(--shadow-lg)]">
      {/* Background Accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-2 border border-[var(--border)] shadow-sm">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
            alt={weather.condition} 
            loading="lazy"
            className="w-16 h-16 drop-shadow-md"
          />
        </div>
        <div>
          <p className="stat-label mb-1 text-[12px] uppercase tracking-widest">{weather.city || "Local Weather"}</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-[36px] font-black text-[var(--foreground)] leading-none tracking-tighter">{weather.temp}°</h2>
            <span className="text-[16px] font-bold text-emerald-500">{weather.condition}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8 relative z-10">
        <div className="text-right">
          <p className="stat-label text-[11px]">Humidity</p>
          <p className="text-[18px] font-black text-[var(--foreground)]">{weather.humidity}%</p>
        </div>
        <div className="text-right">
          <p className="stat-label text-[11px]">Wind Speed</p>
          <p className="text-[18px] font-black text-[var(--foreground)]">{weather.windSpeed} km/h</p>
        </div>
      </div>
    </div>
  );
}
