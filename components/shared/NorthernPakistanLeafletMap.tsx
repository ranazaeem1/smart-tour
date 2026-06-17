"use client";

import dynamic from "next/dynamic";

const NorthernPakistanLeafletMapInternal = dynamic(
  () => import("./NorthernPakistanLeafletMapInternal"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[clamp(380px,70vh,720px)] w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-600">Loading map...</p>
      </div>
    ),
  }
);

export function NorthernPakistanLeafletMap() {
  return <NorthernPakistanLeafletMapInternal />;
}
