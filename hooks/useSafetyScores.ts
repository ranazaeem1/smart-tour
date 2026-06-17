"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SAFETY_ZONES } from "@/lib/data";
import type { Coordinates } from "@/utils/routeCalculation";

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
      const { data, error: queryError } = await (supabase.from("safety_zones") as any)
        .select("*")
        .limit(100);

      if (queryError) throw queryError;

      const rows = Array.isArray(data) ? data : [];
      const closest = rows
        .filter((row) => typeof row.area === "string")
        .map((row) => ({
          row,
          distance: destination.name?.toLowerCase().includes(String(row.area).toLowerCase().split(" ")[0]) ? 0 : 1,
        }))
        .sort((a, b) => a.distance - b.distance)[0]?.row;

      if (!closest) {
        const fallback = estimateScores(destination.name);
        setScores(fallback);
        return fallback;
      }

      const nextScores: SafetyScores = {
        destination: closest.area ?? destination.name ?? "Selected destination",
        overallSafetyScore: clampScore(closest.score, 82),
        weatherRiskFactor: Math.max(8, 100 - clampScore(closest.score, 82)),
        crimeRisk: Math.max(6, Math.round((100 - clampScore(closest.score, 82)) * 0.75)),
        terrainDifficulty: destination.name?.toLowerCase().match(/skardu|hunza|fairy|deosai|gilgit/)
          ? 68
          : DEFAULT_SCORES.terrainDifficulty,
        accessibilityScore: Math.max(35, clampScore(closest.score, 82) - 8),
        lastUpdated: closest.updated_at ?? new Date().toISOString(),
      };

      setScores(nextScores);
      return nextScores;
    } catch {
      const fallback = estimateScores(destination.name);
      setScores(fallback);
      setError(null);
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
