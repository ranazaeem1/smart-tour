import { NorthernPakistanLeafletMap } from "@/components/shared/NorthernPakistanLeafletMap";

export default function LeafletOsmMapPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            OpenStreetMap + Leaflet
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Northern Pakistan Interactive Map
          </h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-slate-700">
            Explore popular tourist destinations with secure interactive markers. This map uses free OpenStreetMap
            tiles and does not require any API key.
          </p>
        </header>

        <NorthernPakistanLeafletMap />
      </div>
    </main>
  );
}
