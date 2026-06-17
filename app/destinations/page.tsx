/**
 * @file destinations/page.tsx
 * @description Destinations showcase page for Smart Tour.
 * @author Smart Tour Team
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, MapPin } from "lucide-react";

const DESTINATIONS = [
  { img: "/images/neelum.png", name: "Neelum Valley", region: "Azad Kashmir", price: "35K", rating: "4.7", tags: ["Forests", "Rivers", "Waterfalls"] },
  { img: "/images/fairy-meadows.png", name: "Fairy Meadows", region: "Gilgit-Baltistan", price: "30K", rating: "4.9", tags: ["Adventure", "Camping", "Nanga Parbat"] },
  { img: "/images/hunza.png", name: "Hunza Valley", region: "Gilgit-Baltistan", price: "40K", rating: "4.9", tags: ["Culture", "History", "Peaks"] },
  { img: "/images/malam-jabba.png", name: "Malam Jabba", region: "KPK", price: "26K", rating: "4.8", tags: ["Snow", "Skiing", "Chairlift"] },
  { img: "/images/naran.png", name: "Naran & Kaghan", region: "KPK", price: "20K", rating: "4.6", tags: ["Lakes", "Rafting", "Roadtrip"] },
];

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "120px", paddingBottom: "100px", background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: "var(--navy)", marginBottom: 16 }}>
              Explore <span className="text-gradient">Destinations</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto" }}>
              From the crystal clear lakes of Skardu to the ancient cultures of Hunza, 
              discover the breathtaking beauty of northern Pakistan.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 32 }}>
            {DESTINATIONS.map((d, i) => (
              <div key={d.name} className="card" style={{ overflow: "hidden", border: "none", transition: "transform 0.3s ease" }}>
                <div style={{ position: "relative", height: 260 }}>
                  <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 14 }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" /> {d.rating}
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--teal)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
                    <MapPin size={12} /> {d.region}
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>{d.name}</h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {d.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8, color: "var(--text-secondary)", fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <div>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Starting from</span>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "var(--navy)" }}>PKR {d.price}</div>
                    </div>
                    <Link href="/auth/login" className="btn btn-primary btn-sm">Explore Tours</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 80, padding: "60px", background: "var(--navy)", borderRadius: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(20, 210, 190, 0.15), transparent 70%)" }} />
             <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 16, position: "relative" }}>Can't decide where to go?</h2>
             <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, marginBottom: 32, position: "relative" }}>Let our AI build the perfect itinerary based on your preferences.</p>
             <Link href="/auth/login" className="btn btn-primary btn-lg" style={{ position: "relative" }}>Ask AI Travel Assistant</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
