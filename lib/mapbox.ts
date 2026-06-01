import mapboxgl from "mapbox-gl";
import { API_ENDPOINTS, MAPBOX_ACCESS_TOKEN } from "@/config/apis";
import type { Coordinates, RouteSummary } from "@/utils/routeCalculation";

export type GeocodedDestination = Coordinates & {
  name: string;
  placeName: string;
};

export function configureMapbox() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  return mapboxgl;
}

export async function geocodeDestination(query: string): Promise<GeocodedDestination | null> {
  const trimmed = query.trim();
  if (!trimmed || !MAPBOX_ACCESS_TOKEN) return null;

  const url = new URL(`${API_ENDPOINTS.mapboxGeocoding}/${encodeURIComponent(trimmed)}.json`);
  url.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
  url.searchParams.set("limit", "1");
  url.searchParams.set("language", "en");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Destination search failed.");

  const payload = await response.json();
  const feature = payload.features?.[0];
  if (!feature?.center) return null;

  return {
    lng: feature.center[0],
    lat: feature.center[1],
    name: feature.text || trimmed,
    placeName: feature.place_name || trimmed,
  };
}

export async function fetchDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<RouteSummary> {
  if (!MAPBOX_ACCESS_TOKEN) throw new Error("Mapbox token is missing.");

  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = new URL(`${API_ENDPOINTS.mapboxDirections}/${coords}`);
  url.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Route calculation failed.");

  const payload = await response.json();
  const route = payload.routes?.[0];
  if (!route?.geometry) throw new Error("No route was found for this destination.");

  return {
    geometry: route.geometry,
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
  };
}
