"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type TouristDestination = {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
};

const NORTHERN_PAKISTAN_CENTER: [number, number] = [35.35, 74.65];

const TOURIST_DESTINATIONS: TouristDestination[] = [
  {
    id: "hunza-valley",
    name: "Hunza Valley",
    description: "A scenic mountain valley known for forts, apricot blossoms, and views of Rakaposhi.",
    coordinates: [36.3167, 74.65],
  },
  {
    id: "skardu",
    name: "Skardu",
    description: "Gateway to high peaks, lakes, cold desert landscapes, and adventure routes.",
    coordinates: [35.2971, 75.6333],
  },
  {
    id: "fairy-meadows",
    name: "Fairy Meadows",
    description: "A famous alpine meadow with dramatic views of Nanga Parbat.",
    coordinates: [35.3875, 74.5789],
  },
];

const destinationIcon = L.divIcon({
  className: "smart-tour-leaflet-marker",
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#16a34a;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ResizeController() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function SafePopup({ destination }: { destination: TouristDestination }) {
  return (
    <div className="min-w-[190px] p-1">
      <h3 className="m-0 text-sm font-black text-slate-950">{destination.name}</h3>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
        {destination.description}
      </p>
    </div>
  );
}

export default function NorthernPakistanLeafletMapInternal() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={NORTHERN_PAKISTAN_CENTER}
        zoom={7}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        className="h-[clamp(380px,70vh,720px)] w-full"
        aria-label="Interactive OpenStreetMap map of northern Pakistan tourist destinations"
      >
        <ResizeController />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {TOURIST_DESTINATIONS.map((destination) => (
          <Marker
            key={destination.id}
            position={destination.coordinates}
            icon={destinationIcon}
          >
            <Popup>
              <SafePopup destination={destination} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
