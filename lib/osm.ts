import type { Coordinates, RouteSummary } from "@/utils/routeCalculation";

export type GeocodedDestination = Coordinates & {
  name: string;
  placeName: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
};

type OsrmRoute = {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
};

export async function geocodeDestination(query: string): Promise<GeocodedDestination | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Destination search failed.");

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];
  if (!match) return null;

  const lat = Number(match.lat);
  const lng = Number(match.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat,
    lng,
    name: match.name || trimmed,
    placeName: match.display_name || trimmed,
  };
}

export async function fetchDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<RouteSummary> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${coords}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Route calculation failed.");

  const payload = (await response.json()) as { routes?: OsrmRoute[] };
  const route = payload.routes?.[0];
  if (!route?.geometry) throw new Error("No route was found for this destination.");

  return {
    geometry: route.geometry,
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
  };
}
