"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchSafetyZones } from "@/lib/db";
import { Shield, AlertTriangle, Info, MapPin, X, ChevronRight } from "lucide-react";

// Fix for default marker icons in Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

// Northern Pakistan Coordinates (Hunza/Skardu region)
const HUNZA_COORDS: [number, number] = [36.3167, 74.6500];

// Custom Icons for different safety types
const createIcon = (color: string) => L.divIcon({
  className: 'custom-map-icon',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${color}80;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Helper component to center map on selection
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function SafetyMapInternal() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [mapConfig, setMapConfig] = useState({
    center: HUNZA_COORDS,
    zoom: 10
  });

  useEffect(() => {
    fixLeafletIcons();
    async function load() {
      try {
        const data = await fetchSafetyZones();
        if (data && data.length > 0) {
          setZones(data);
        }
      } catch (err) {
        console.error("Failed to load safety zones:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleZoneSelect = useCallback((zone: any) => {
    setSelectedZone(zone);
    if (zone.latitude && zone.longitude) {
      setMapConfig({ center: [zone.latitude, zone.longitude], zoom: 14 });
    }
  }, []);

  const icons = useMemo(() => ({
    safe: createIcon('#10B981'),
    caution: createIcon('#F59E0B'),
    hazard: createIcon('#EF4444'),
  }), []);

  if (loading) {
    return (
      <div className="card h-[650px] flex flex-col items-center justify-center bg-slate-900 border-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="loading-spinner h-12 w-12 mb-6 relative z-10" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse relative z-10">Synchronizing Safety Grid...</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-0 overflow-hidden flex h-[650px] border-none shadow-2xl relative bg-slate-900">
      {/* Sidebar Overlay */}
      <div className="w-[420px] h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-[1000]">
        <div className="p-10 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-black text-white m-0 tracking-tight">Safety Network</h3>
          </div>
          <p className="text-slate-400 text-xs font-medium leading-relaxed opacity-70">
            Real-time geological and weather monitoring across Northern Pakistan expeditions.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {zones.length === 0 ? (
            <div className="text-center py-20 px-8 opacity-40">
              <Info className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-sm font-black uppercase tracking-widest">No Active Alerts</p>
              <p className="text-[11px] mt-1">All regions currently reporting stable conditions.</p>
            </div>
          ) : (
            zones.map(zone => (
              <div 
                key={zone.id}
                onClick={() => handleZoneSelect(zone)}
                className={`p-6 rounded-[24px] cursor-pointer transition-all duration-500 group relative border ${
                  selectedZone?.id === zone.id 
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`badge ${
                    zone.score >= 90 ? 'badge-emerald' : 
                    zone.score >= 70 ? 'badge-amber' : 'badge-rose'
                  }`}>
                    {zone.score}% Stability
                  </span>
                  {selectedZone?.id === zone.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <h4 className="text-lg font-black text-white mb-1 group-hover:translate-x-1 transition-transform">{zone.area_name}</h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  <MapPin size={12} className="text-slate-500" />
                  <span>{zone.region || "Northern Territory"}</span>
                </div>
                
                {selectedZone?.id === zone.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-fade">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {zone.description || "Stable conditions for alpine travel and photography."}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-white/5">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full btn btn-emerald py-4 flex items-center justify-center gap-3 shadow-emerald-500/20"
          >
            <AlertTriangle size={18} />
            Report Hazard
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-950">
        <MapContainer 
          center={mapConfig.center} 
          zoom={mapConfig.zoom} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM'
          />
          
          <MapController center={mapConfig.center} zoom={mapConfig.zoom} />

          {zones.map(zone => (
            <Marker 
              key={zone.id} 
              position={[zone.latitude || HUNZA_COORDS[0], zone.longitude || HUNZA_COORDS[1]]} 
              icon={zone.score >= 90 ? icons.safe : zone.score >= 70 ? icons.caution : icons.hazard}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup className="custom-map-popup">
                <div className="p-4 min-w-[200px]">
                  <h4 className="text-white font-black text-base mb-1">{zone.area_name}</h4>
                  <p className="text-slate-400 text-[11px] mb-4 font-medium leading-relaxed">{zone.description || "Stable conditions reported."}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{zone.score}% SECURE</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold text-slate-500">LIVE FEED</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-8 right-8 glass-dark p-6 rounded-[24px] z-[1000] space-y-4 min-w-[200px]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Map Legend</p>
          <div className="flex items-center gap-3 group">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">Optimal Conditions</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_#F59E0B]" />
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">Weather Warning</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_#EF4444]" />
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">Access Denied</span>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="card-premium max-w-[500px] w-full p-12 relative z-10 bg-slate-900 border-white/5 text-center shadow-2xl animate-scale">
            <button className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="h-20 w-20 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner ring-1 ring-rose-500/30">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Report Incident</h2>
            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed opacity-70">
              Help your fellow explorers by providing real-time terrain or weather updates.
            </p>
            
            <div className="space-y-6 text-left">
              <div className="input-group">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Affected Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. Khunjerab Pass" 
                  className="input !bg-white/5 !border-white/10 !text-white focus:!border-emerald-500" 
                />
              </div>
              
              <div className="input-group">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Detailed Description</label>
                <textarea 
                  placeholder="What is the current status?"
                  rows={4}
                  className="input !bg-white/5 !border-white/10 !text-white focus:!border-emerald-500 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-secondary !bg-white/5 !border-white/10 !text-slate-400 hover:!text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-emerald shadow-lg shadow-emerald-500/20"
              >
                Submit Feed
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-map-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #fff !important;
          border-radius: 24px !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(20px);
          padding: 0 !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
        }
        .custom-map-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        .custom-map-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-container {
          background: #020617 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
