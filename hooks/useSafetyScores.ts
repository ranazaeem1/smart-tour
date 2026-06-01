"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SAFETY_ZONES } from "@/lib/data";
import { distanceKm, type Coordinates } from "@/utils/routeCalculation";

export type SafetyScores = {
  destination: string;
  overallSafetyScore: number;
  weatherRiskFactor: number;
  crimeRisk: number;
  terrainDifficulty: number;
  accessibilityScore: number;
  lastUpdated: string;
};

const DEFAULT_SCORES: SafetyScores = {
  destination: "Regional estimate",
  overallSafetyScore: 82,
  weatherRiskFactor: 28,
  crimeRisk: 18,
  terrainDifficulty: 42,
  accessibilityScore: 76,
  lastUpdated: new Date().toISOString(),
};

function clampScore(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function estimateScores(destinationName?: string): SafetyScores {
  const matchingZone = SAFETY_ZONES.find((zone) =>
    destinationName ? destinationName.toLowerCase().includes(zone.area.toLowerCase().split(" ")[0]) : false
  );
  const overall = matchingZone?.score ?? DEFAULT_SCORES.overallSafetyScore;

  return {
    ...DEFAULT_SCORES,
    destination: matchingZone?.area ?? destinationName ?? DEFAULT_SCORES.destination,
    overallSafetyScore: overall,
    weatherRiskFactor: Math.max(12, 100 - overall),
    crimeRisk: Math.max(8, Math.round((100 - overall) * 0.8)),
    terrainDifficulty: destinationName?.toLowerCase().match(/skardu|hunza|fairy|deosai|gilgit/)
      ? 68
      : DEFAULT_SCORES.terrainDifficulty,
    accessibilityScore: Math.max(35, overall - 8),
    lastUpdated: new Date().toISOString(),
  };
}

export function useSafetyScores(destination: (Coordinates & { name?: string }) | null) {
  const [scores, setScores] = useState<SafetyScores>(DEFAULT_SCORES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!destination) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await (supabase.from("safety_data") as any)
        .select("*")
        .limit(100);

      if (queryError) throw queryError;

      const rows = Array.isArray(data) ? data : [];
      const closest = rows
        .filter((row) => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)))
        .map((row) => ({
          row,
          distance: distanceKm(destination, { lat: Number(row.latitude), lng: Number(row.longitude) }),
        }))
        .sort((a, b) => a.distance - b.distance)[0]?.row;

      if (!closest) {
        const fallback = estimateScores(destination.name);
        setScores(fallback);
        return fallback;
      }

      const nextScores: SafetyScores = {
        destination: closest.destination ?? destination.name ?? "Selected destination",
        overallSafetyScore: clampScore(closest.overall_safety_score, 82),
        weatherRiskFactor: clampScore(closest.weather_risk_factor, 28),
        crimeRisk: clampScore(closest.crime_risk, 18),
        terrainDifficulty: clampScore(closest.terrain_difficulty, 42),
        accessibilityScore: clampScore(closest.accessibility_score, 76),
        lastUpdated: closest.last_updated ?? new Date().toISOString(),
      };

      setScores(nextScores);
      return nextScores;
    } catch {
      const fallback = estimateScores(destination.name);
      setScores(fallback);
      setError("Live safety scores are unavailable. Showing regional estimates.");
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { scores, loading, error, refetch };
}
