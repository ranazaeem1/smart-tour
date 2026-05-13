"use client";
import dynamic from "next/dynamic";

/**
 * @file SafetyMap.tsx
 * @description Dynamic wrapper for the Leaflet-based Safety Map.
 * Prevents "window is not defined" errors during Server-Side Rendering (SSR).
 */

const SafetyMapInternal = dynamic(
  () => import("./SafetyMapInternal"),
  { 
    ssr: false,
    loading: () => (
      <div className="glass-card" style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Initializing Safety Network...</p>
        </div>
      </div>
    )
  }
);

export function SafetyMap() {
  return <SafetyMapInternal />;
}
