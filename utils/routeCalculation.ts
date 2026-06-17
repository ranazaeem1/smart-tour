export type Coordinates = {
  lat: number;
  lng: number;
};

export type RouteSummary = {
  geometry: GeoJSON.LineString;
  distanceKm: number;
  durationMinutes: number;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function calculateRouteProgress(location: Coordinates | null, route: GeoJSON.LineString | null) {
  if (!location || !route?.coordinates.length) return 0;

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  route.coordinates.forEach(([lng, lat], index) => {
    const distance = distanceKm(location, { lat, lng });
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  if (route.coordinates.length <= 1) return 0;
  return Math.min(100, Math.max(0, Math.round((closestIndex / (route.coordinates.length - 1)) * 100)));
}

export function routeBounds(route: GeoJSON.LineString, origin: Coordinates, destination: Coordinates) {
  const lngs = [origin.lng, destination.lng, ...route.coordinates.map(([lng]) => lng)];
  const lats = [origin.lat, destination.lat, ...route.coordinates.map(([, lat]) => lat)];

  return {
    southwest: [Math.min(...lngs), Math.min(...lats)] as [number, number],
    northeast: [Math.max(...lngs), Math.max(...lats)] as [number, number],
  };
}
