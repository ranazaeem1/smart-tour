"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LiveLocation } from "@/hooks/useLiveLocation";
import type { GeocodedDestination } from "@/lib/osm";
import type { RouteSummary } from "@/utils/routeCalculation";

const DEFAULT_CENTER: [number, number] = [35.35, 74.65];

const userIcon = L.divIcon({
  className: "safety-user-marker",
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#22c55e;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destinationIcon = L.divIcon({
  className: "safety-destination-marker",
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#ef4444;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapController({
  userLocation,
  destination,
  route,
}: {
  userLocation: LiveLocation | null;
  destination: GeocodedDestination | null;
  route: RouteSummary | null;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (route?.geometry.coordinates.length) {
      const bounds = L.latLngBounds(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
      if (destination) bounds.extend([destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      return;
    }

    if (destination) {
      map.setView([destination.lat, destination.lng], 10, { animate: true });
      return;
    }

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 11, { animate: true });
    }
  }, [destination, map, route, userLocation]);

  return null;
}

export default function SafetyLeafletRouteMapInternal({
  userLocation,
  destination,
  route,
}: {
  userLocation: LiveLocation | null;
  destination: GeocodedDestination | null;
  route: RouteSummary | null;
}) {
  const routePositions = route?.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  return (
    <div className="relative h-96 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={7}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        className="h-full w-full"
        aria-label="Interactive OpenStreetMap safety route map"
      >
        <MapController userLocation={userLocation} destination={destination} route={route} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routePositions.length > 1 && (
          <Polyline positions={routePositions} pathOptions={{ color: "#16A34A", weight: 5, opacity: 0.9 }} />
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="m-0 text-sm font-black text-slate-950">Your current location</h3>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  Accuracy {userLocation.accuracy ?? 0} m
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="min-w-[190px] p-1">
                <h3 className="m-0 text-sm font-black text-slate-950">{destination.name}</h3>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{destination.placeName}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
