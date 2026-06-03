"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDestinationById, DEFAULT_DESTINATION_ID } from "@/lib/northern-pakistan-destinations";
import type { SafetyZoneSnapshot } from "@/lib/safety-intelligence";
import { Shield, AlertTriangle, Info, MapPin, X } from "lucide-react";

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-map-icon",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${color}80;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface SafetyMapInternalProps {
  zones: SafetyZoneSnapshot[];
  selectedDestinationId?: string;
  loading?: boolean;
}

export default function SafetyMapInternal({
  zones,
  selectedDestinationId = DEFAULT_DESTINATION_ID,
  loading = false,
}: SafetyMapInternalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<SafetyZoneSnapshot | null>(null);

  const selectedDestination = getDestinationById(selectedDestinationId);

  const mapConfig = useMemo(() => {
    const focus = zones.find((z) => z.area === selectedDestination?.name) || zones[0];
    if (focus?.latitude && focus?.longitude) {
      return { center: [focus.latitude, focus.longitude] as [number, number], zoom: 11 };
    }
    if (selectedDestination) {
      return {
        center: [selectedDestination.lat, selectedDestination.lon] as [number, number],
        zoom: 11,
      };
    }
    return { center: [36.3167, 74.65] as [number, number], zoom: 8 };
  }, [zones, selectedDestination]);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  useEffect(() => {
    const match = zones.find((z) => z.area === selectedDestination?.name);
    if (match) setSelectedZone(match);
  }, [zones, selectedDestination?.name]);

  const handleZoneSelect = useCallback((zone: SafetyZoneSnapshot) => {
    setSelectedZone(zone);
  }, []);

  const icons = useMemo(
    () => ({
      safe: createIcon("#10B981"),
      caution: createIcon("#F59E0B"),
      hazard: createIcon("#EF4444"),
    }),
    []
  );

  if (loading) {
    return (
      <div className="card h-[650px] flex flex-col items-center justify-center bg-slate-900 border-none">
        <div className="loading-spinner h-12 w-12 mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">
          Loading live weather grid...
        </p>
      </div>
    );
  }

  return (
    <div className="card-premium p-0 overflow-hidden flex h-[650px] border-none shadow-2xl relative bg-slate-900">
      <div className="w-[420px] h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-[1000]">
        <div className="p-10 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-black text-white m-0 tracking-tight">Safety Network</h3>
          </div>
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            Live scores from OpenWeather data for Northern Pakistan. Select a destination above to focus the map.
          </p>
          {selectedDestination && (
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4">
              Focus: {selectedDestination.name}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {zones.length === 0 ? (
            <div className="text-center py-20 px-8 opacity-40">
              <Info className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-sm font-black uppercase tracking-widest">Loading regions...</p>
            </div>
          ) : (
            zones.map((zone) => (
              <div
                key={zone.area}
                onClick={() => handleZoneSelect(zone)}
                className={`p-6 rounded-[24px] cursor-pointer transition-all border ${
                  selectedZone?.area === zone.area
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`badge ${
                      zone.score >= 85 ? "badge-emerald" : zone.score >= 70 ? "badge-amber" : "badge-rose"
                    }`}
                  >
                    {zone.score}% · {zone.status}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white mb-1">{zone.area}</h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase">
                  <MapPin size={12} />
                  <span>{zone.region}</span>
                </div>
                {selectedZone?.area === zone.area && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{zone.description}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-white/5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full btn btn-emerald py-4 flex items-center justify-center gap-3"
          >
            <AlertTriangle size={18} />
            Report Hazard
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950">
        <MapContainer
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OSM"
          />
          <MapController center={mapConfig.center} zoom={mapConfig.zoom} />

          {zones.map((zone) => (
            <Marker
              key={zone.area}
              position={[zone.latitude, zone.longitude]}
              icon={
                zone.score >= 85 ? icons.safe : zone.score >= 70 ? icons.caution : icons.hazard
              }
              eventHandlers={{ click: () => setSelectedZone(zone) }}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <h4 className="font-black text-sm">{zone.area}</h4>
                  <p className="text-xs mt-1">{zone.description}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2">{zone.score}% · live weather</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute bottom-8 right-8 glass-dark p-6 rounded-[24px] z-[1000] space-y-3 min-w-[200px]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live weather scores</p>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-300">85+ Safe</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[11px] text-slate-300">70–84 Caution</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[11px] text-slate-300">&lt;70 High risk</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="card-premium max-w-[500px] w-full p-12 relative z-10 bg-slate-900 text-center">
            <button className="absolute top-8 right-8 text-slate-500" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <AlertTriangle size={40} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Report Incident</h2>
            <p className="text-slate-400 text-sm mb-6">
              Community hazard reports will be reviewed by Smart Tour operators.
            </p>
            <button className="btn btn-emerald w-full" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
