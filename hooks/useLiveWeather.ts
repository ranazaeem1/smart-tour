"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_ENDPOINTS, OPENWEATHER_API_KEY, WEATHER_REFRESH_MS } from "@/config/apis";
import type { Coordinates } from "@/utils/routeCalculation";

export type LiveWeather = {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
  visibilityKm: number;
  updatedAt: string;
};

export function useLiveWeather(coordinates: Coordinates | null) {
  const cacheRef = useRef<{ key: string; weather: LiveWeather; fetchedAt: number } | null>(null);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (force = false) => {
      if (!coordinates) return null;
      if (!OPENWEATHER_API_KEY) {
        setError("OpenWeather API key is missing.");
        return null;
      }

      const key = `${coordinates.lat.toFixed(3)},${coordinates.lng.toFixed(3)}`;
      const cached = cacheRef.current;
      if (!force && cached?.key === key && Date.now() - cached.fetchedAt < WEATHER_REFRESH_MS) {
        setWeather(cached.weather);
        return cached.weather;
      }

      setLoading(true);
      setError(null);

      try {
        const url = new URL(API_ENDPOINTS.openWeatherCurrent);
        url.searchParams.set("lat", String(coordinates.lat));
        url.searchParams.set("lon", String(coordinates.lng));
        url.searchParams.set("units", "metric");
        url.searchParams.set("appid", OPENWEATHER_API_KEY);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Weather data is unavailable.");
        const data = await response.json();

        const nextWeather: LiveWeather = {
          temperature: Math.round(data.main?.temp ?? 0),
          feelsLike: Math.round(data.main?.feels_like ?? 0),
          condition: data.weather?.[0]?.description || "Unknown conditions",
          humidity: Math.round(data.main?.humidity ?? 0),
          windSpeedKmh: Math.round(((data.wind?.speed ?? 0) as number) * 3.6),
          visibilityKm: Math.round((((data.visibility ?? 0) as number) / 1000) * 10) / 10,
          updatedAt: new Date().toISOString(),
        };

        cacheRef.current = { key, weather: nextWeather, fetchedAt: Date.now() };
        setWeather(nextWeather);
        return nextWeather;
      } catch (weatherError) {
        setError(weatherError instanceof Error ? weatherError.message : "Weather data is unavailable.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [coordinates]
  );

  useEffect(() => {
    void refetch();
    const interval = setInterval(() => void refetch(true), WEATHER_REFRESH_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  return { weather, loading, error, refetch };
}
