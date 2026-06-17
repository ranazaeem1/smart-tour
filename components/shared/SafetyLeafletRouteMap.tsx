"use client";

import dynamic from "next/dynamic";
import type { LiveLocation } from "@/hooks/useLiveLocation";
import type { GeocodedDestination } from "@/lib/osm";
import type { RouteSummary } from "@/utils/routeCalculation";

const SafetyLeafletRouteMapInternal = dynamic(
  () => import("./SafetyLeafletRouteMapInternal"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-600">Loading map...</p>
      </div>
    ),
  }
);

export function SafetyLeafletRouteMap({
  userLocation,
  destination,
  route,
}: {
  userLocation: LiveLocation | null;
  destination: GeocodedDestination | null;
  route: RouteSummary | null;
}) {
  return (
    <SafetyLeafletRouteMapInternal
      userLocation={userLocation}
      destination={destination}
      route={route}
    />
  );
}
