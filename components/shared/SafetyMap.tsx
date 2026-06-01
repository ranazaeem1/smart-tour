"use client";

import dynamic from "next/dynamic";
import type { SafetyZoneSnapshot } from "@/lib/safety-intelligence";

const SafetyMapInternal = dynamic(
  () => import("./SafetyMapInternal"),
  {
    ssr: false,
    loading: () => (
      <div
        className="glass-card"
        style={{
          height: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15, 23, 42, 0.4)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading live safety map...</p>
        </div>
      </div>
    ),
  }
);

interface SafetyMapProps {
  zones: SafetyZoneSnapshot[];
  selectedDestinationId?: string;
  loading?: boolean;
}

export function SafetyMap({ zones, selectedDestinationId, loading }: SafetyMapProps) {
  return (
    <SafetyMapInternal
      zones={zones}
      selectedDestinationId={selectedDestinationId}
      loading={loading}
    />
  );
}
