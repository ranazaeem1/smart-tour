/**
 * @file page.tsx
 * @description The main landing page for Smart Tour. Showcases top tours, destinations, 
 * features, and provides direct entry points for users and companies.
 * @author Smart Tour Team
 * @dependencies react, next/link, lucide-react
 */

// ==========================================
// Imports
// ==========================================
"use client";
import Link from "next/link";
import { ArrowRight, Map, Shield, Users, Star, Brain, Coins, CloudSun, Smartphone } from "lucide-react";
import Footer from "@/components/Footer";

// ==========================================
// Component: Home
// ==========================================

/**
 * Main Home Component
 * Renders the full unauthenticated landing page (hero section, featured tours, AI features).
 * 
 * @returns {JSX.Element} The rendered landing page
 */
export default function Home() {
  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <>
      {/* 
        ================================================================
        1. Top Navigation Bar (Absolute over Hero)
        ================================================================
      */}
      <header className="navbar" style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100, 
        background: "transparent", 
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        border: "none", 
        boxShadow: "none",
        padding: "14px 60px"
      }}>
        <Link href="/" className="nav-logo" style={{ gap: "8px", textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 3L28 28H4L16 3Z" fill="white" opacity="0.9" /><circle cx="16" cy="14" r="3" fill="white" /></svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: "700", color: "#fff", fontFamily: "Outfit, sans-serif", letterSpacing: "-0.5px" }}>SmartTour</span>
        </Link>
        <nav className="nav-links">
          <Link href="/destinations" className="nav-link" style={{ color: "#fff" }}>Destinations</Link>
          <Link href="#tours" className="nav-link" style={{ color: "#fff" }}>Tours</Link>
          <Link href="#features" className="nav-link" style={{ color: "#fff" }}>AI Planner</Link>
          <Link href="/about" className="nav-link" style={{ color: "#fff" }}>About</Link>
        </nav>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/auth/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Login</Link>
          <Link href="/auth/login" className="btn" style={{ padding: "8px 24px", fontSize: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: "999px", transition: "all 0.3s" }}>Get Started</Link>
        </div>
      </header>

      <main style={{ position: "relative" }}>
        {/* Floating Blobs Background Layer */}
        {/* Adds dynamic aesthetics to the background */}
        <div className="blobs-container" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <div className="blob blob-4"></div>
          <div className="blob blob-5"></div>
        </div>

        {/* 
          ================================================================
          2. Hero Section
          ================================================================
        */}
        <section className="hero" style={{ minHeight: "75vh", display: "flex", alignItems: "center", position: "relative", padding: "0", overflow: "hidden" }}>
          <div className="hero-bg" style={{ 
            backgroundImage: "url('/images/sunset-bg.png')", 
            backgroundSize: "cover", 
            backgroundPosition: "center", 
            position: "absolute", 
            inset: 0, 
            zIndex: -2,
            filter: "brightness(0.85) contrast(1.05)" 
          }}></div>
          <div className="hero-overlay" style={{ 
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)", 
            position: "absolute", 
            inset: 0, 
            zIndex: -1 
          }}></div>
          
          <div className="hero-content" style={{ margin: "0 auto", padding: "120px 40px 60px", width: "100%", maxWidth: "1200px", zIndex: 3, textAlign: "center" }}>
            <div style={{ margin: "0 auto 48px", animation: "fadeIn 1s ease" }}>
              <h1 style={{ fontSize: "72px", fontWeight: "900", lineHeight: "1", marginBottom: "12px", color: "white", letterSpacing: "2px", textTransform: "uppercase", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                DISCOVER THE
              </h1>
              <h2 style={{ fontSize: "72px", fontWeight: "900", lineHeight: "1", marginBottom: "32px", color: "#ffffff", letterSpacing: "2px", textTransform: "uppercase", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                EXTRAORDINARY
              </h2>
            </div>

            {/* Search Panel - Pill Shaped Frosted Glass */}
            {/* FIXME: Convert these inputs to fully functional controlled components for real search queries */}
            <div className="search-panel" style={{ 
              background: "rgba(255, 255, 255, 0.2)", 
              backdropFilter: "blur(40px)", 
              border: "1px solid rgba(255,255,255,0.4)", 
              borderRadius: "999px", 
              padding: "8px 8px 8px 32px", 
              display: "flex", 
              gap: "0px", 
              alignItems: "center", 
              margin: "0 auto 48px", 
              maxWidth: "900px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
              <div className="input-group" style={{ flex: 1.2, textAlign: "left" }}>
                <label className="input-label" style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", marginBottom: "4px", display: "flex", alignItems: "center", gap: 6, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Destination
                </label>
                <input className="input" placeholder="Where to?" style={{ background: "transparent", border: "none", padding: "0", borderRadius: "0", color: "#fff", width: "100%", fontSize: "16px", fontWeight: "600" }} />
              </div>
              <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.3)", margin: "0 20px" }}></div>
              <div className="input-group" style={{ flex: 1, textAlign: "left" }}>
                <label className="input-label" style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", marginBottom: "4px", display: "flex", alignItems: "center", gap: 6, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Budget
                </label>
                <input className="input" placeholder="PKR" style={{ background: "transparent", border: "none", padding: "0", borderRadius: "0", color: "#fff", width: "100%", fontSize: "16px", fontWeight: "600" }} />
              </div>
              <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.3)", margin: "0 20px" }}></div>
              <div className="input-group" style={{ flex: 1, textAlign: "left" }}>
                <label className="input-label" style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", marginBottom: "4px", display: "flex", alignItems: "center", gap: 6, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Dates
                </label>
                <input type="text" onFocus={(e) => e.target.type = "date"} placeholder="Add dates" className="input" style={{ background: "transparent", border: "none", padding: "0", borderRadius: "0", color: "#fff", width: "100%", fontSize: "16px", fontWeight: "600" }} />
              </div>
              <Link href="/auth/login" className="btn btn-primary" style={{ padding: "0 40px", height: "54px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", fontSize: "15px", background: "linear-gradient(135deg, #a1c4fd 0%, #ff9a9e 100%)", border: "none", color: "#111", textTransform: "uppercase", letterSpacing: "1px" }}>
                Explore Now
              </Link>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          3. Popular Destinations Section
          ================================================================
        */}
        <section id="destinations" style={{ background: "#fff", padding: "80px 60px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "left", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111", marginBottom: 14 }}>Featured Experiences</h2>
          </div>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }}>
            {[
              { img:"/images/hunza.png", name:"Hunza Valley", price:"From PKR 40K", desc:"Mountain & Culture" },
              { img:"/images/skardu.png", name:"Skardu", price:"From PKR 55K", desc:"Lakes & Desert" },
              { img:"/images/swat.jpg",  name:"Swat Valley",  price:"From PKR 25K", desc:"Hike & Wellness" },
              { img:"/images/fairy-meadows.png", name:"Fairy Meadows", price:"From PKR 30K", desc:"Adventure Track" },
            ].map((d, i)=>(
              <div key={d.name} className="dest-card" style={{ 
                borderRadius: 24, 
                overflow: "hidden", 
                position: "relative", 
                background: "#fff",
                boxShadow: `0 20px 40px ${i % 2 === 0 ? 'rgba(0, 255, 200, 0.15)' : 'rgba(255, 100, 200, 0.15)'}`,
                border: "1px solid rgba(0,0,0,0.03)",
                transition: "transform 0.3s ease"
              }}>
                <div style={{ padding: "12px 12px 0" }}>
                  <img src={d.img} alt={d.name} style={{ width:"100%", height:"200px", objectFit:"cover", borderRadius: "16px" }} />
                </div>
                <div style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: 18, color: "#111", marginBottom: 4, fontWeight: 800 }}>{d.name}</h4>
                  <div style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                    {d.desc} - {d.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 
          ================================================================
          4. Top Tours Section
          ================================================================
        */}
        <section id="tours" style={{ background:"var(--bg-primary)", padding:"80px 60px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:36 }}>
              <h2 style={{ fontSize:34, fontWeight:800, color:"var(--text-primary)" }}>
                Top <span className="text-gradient">Tour Packages</span>
              </h2>
              <Link href="/auth/login" style={{ color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:8, textDecoration:"none", fontWeight:500, fontSize:14 }}>
                View All Tours <ArrowRight size={16} />
              </Link>
            </div>
            {/* Dynamic Tours Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
              {[
                { img:"/images/hunza.png", co:"Northern Tour Co.", title:"Hunza Valley Explorer", tags:["Trekking","Culture","Photography"], price:"PKR 45K", dur:"7 days", rating:"4.9", badge:"BESTSELLER", badgeColor:"var(--coral)", badgeBg:"rgba(249,115,22,0.85)" },
                { img:"/images/skardu.png", co:"K2 Adventures", title:"Skardu & Deosai Plains", tags:["K2 View","Camping","Wildlife"], price:"PKR 65K", dur:"10 days", rating:"4.8", badge:null },
                { img:"/images/swat.jpg",  co:"Swat Tourism", title:"Swat Valley Heritage Tour", tags:["History","Nature","Family"], price:"PKR 38K", dur:"5 days", rating:"4.7", badge:"FEATURED", badgeColor:"#fff", badgeBg:"rgba(16,185,129,0.85)" },
              ].map(t=>(
                <div key={t.title} className="card" style={{ padding:16, borderRadius:20, display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ position:"relative", borderRadius:14, overflow:"hidden", height:210 }}>
                    <img src={t.img} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    {/* Optional Badge rendering */}
                    {t.badge && <div style={{ position:"absolute", top:10, left:10, background:t.badgeBg, color:t.badgeColor||"#fff", padding:"5px 11px", borderRadius:10, fontSize:11, fontWeight:800 }}>{t.badge}</div>}
                    <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.55)", color:"#fff", padding:"5px 9px", borderRadius:10, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" /> {t.rating}
                    </div>
                  </div>
                  <div>
                    <div style={{ color:"var(--text-muted)", fontSize:12, marginBottom:4, fontWeight:500 }}>{t.co}</div>
                    <h4 style={{ color:"var(--text-primary)", fontSize:18, fontWeight:700, marginBottom:12 }}>{t.title}</h4>
                    {/* Tags mapping */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {t.tags.map(g=><span key={g} style={{ color:"var(--text-secondary)", fontSize:12, background:"var(--bg-secondary)", padding:"5px 12px", borderRadius:14, border:"1px solid var(--border)" }}>{g}</span>)}
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto", paddingTop:14, borderTop:"1px solid var(--border)" }}>
                    <div>
                      <div style={{ color:"var(--navy)", fontSize:20, fontWeight:900 }}>{t.price}</div>
                      <div style={{ color:"var(--text-muted)", fontSize:12 }}>per person • {t.dur}</div>
                    </div>
                    <Link href="/auth/login" className="btn btn-primary btn-sm">Book Now</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          5. AI Features Section
          ================================================================
        */}
        <section id="features" style={{ background:"#fff", padding:"80px 60px", borderTop:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--teal)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:14, background:"rgba(13,148,136,0.08)", display:"inline-block", padding:"5px 16px", borderRadius:20 }}>PLATFORM FEATURES</div>
            <h2 style={{ fontSize:36, fontWeight:800, color:"var(--text-primary)", marginBottom:16 }}>Everything You Need</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:560, margin:"0 auto 48px auto", lineHeight:1.6 }}>
              Every feature is designed to make your northern Pakistan adventure safer, smarter, and unforgettable.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
              {[
                { icon:<Brain size={20} color="#2563eb"/>, bg:"rgba(37,99,235,0.1)", title:"AI Itinerary Planner", desc:"Get personalized day-by-day itineraries optimized for your budget, time, and interests." },
                { icon:<Shield size={20} color="#dc2626"/>, bg:"rgba(220,38,38,0.1)", title:"Safety & Risk Prediction", desc:"Real-time safety scores for every route and destination across northern Pakistan." },
                { icon:<Coins size={20} color="#d97706"/>, bg:"rgba(217,119,6,0.1)", title:"Budget Breakdown", desc:"Visual breakdown of your travel costs — accommodation, food, transport & activities." },
                { icon:<CloudSun size={20} color="#0891b2"/>, bg:"rgba(8,145,178,0.1)", title:"Weather Intelligence", desc:"Weather-aware itinerary planning so you never get caught in a mountain storm." },
                { icon:<Smartphone size={20} color="#059669"/>, bg:"rgba(5,150,105,0.1)", title:"Offline Smart Mode", desc:"Download your itinerary and use the app fully offline in areas with no signal." },
              ].map(f=>(
                <div key={f.title} className="card" style={{ padding:"28px 22px", textAlign:"left" }}>
                  <div style={{ width:44, height:44, background:f.bg, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>{f.icon}</div>
                  <h4 style={{ color:"var(--text-primary)", fontSize:17, fontWeight:700, marginBottom:10 }}>{f.title}</h4>
                  <p style={{ color:"var(--text-secondary)", fontSize:14, lineHeight:1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          6. Call To Action (CTA)
          ================================================================
        */}
        <section id="about" style={{ background:"var(--navy)", textAlign:"center", padding:"100px 20px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:500, background:"radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)", zIndex:0 }} />
          <div style={{ maxWidth:760, margin:"0 auto", position:"relative", zIndex:1 }}>
            <h2 style={{ fontSize:50, fontWeight:900, color:"#fff", marginBottom:20, lineHeight:1.2 }}>
              Ready to Explore <br />
              <span style={{ color:"var(--gold-light)" }}>Northern Pakistan?</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:18, marginBottom:44 }}>
              Join thousands of travelers who trust Smart Tour for their northern Pakistan adventures.
            </p>
            <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
              <Link href="/auth/login" className="btn btn-primary btn-lg">
                <Brain size={18} /> Start Planning Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}