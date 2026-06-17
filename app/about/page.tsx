/**
 * @file about/page.tsx
 * @description About Us page for Smart Tour.
 * @author Smart Tour Team
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "120px", paddingBottom: "100px", background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h1 style={{ fontSize: 56, fontWeight: 900, color: "var(--navy)", marginBottom: 16 }}>
              Our <span className="text-gradient">Mission</span>
            </h1>
            <p style={{ fontSize: 20, color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
              We are on a mission to revolutionize travel in northern Pakistan through 
              cutting-edge AI technology and deep local expertise.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 100 }}>
            <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
              <img src="/images/hunza.png" alt="Our Team" style={{ width: "100%", height: "auto", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>Who We Are</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>
                Smart Tour is Pakistan's first AI-powered travel platform dedicated to the northern regions. 
                Founded by a team of travel enthusiasts and tech innovators, we believe that everyone 
                deserves a safe, personalized, and unforgettable adventure.
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.8 }}>
                Our platform connects travelers directly with verified local tour operators while 
                providing real-time safety scores, budget planning, and AI-generated itineraries.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 100 }}>
            {[
              { icon: <Zap size={24} color="#0d9488" />, title: "AI Driven", desc: "Smarter planning with predictive analytics." },
              { icon: <Shield size={24} color="#7c3aed" />, title: "Safety First", desc: "Real-time risk assessment for every route." },
              { icon: <Users size={24} color="#1F2937" />, title: "Local Partners", desc: "Trusted relationships with mountain experts." },
              { icon: <Target size={24} color="#dc2626" />, title: "Personalized", desc: "Tours tailored to your budget and interests." },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: 30, textAlign: "center" }}>
                <div style={{ margin: "0 auto 16px", width: 56, height: 56, borderRadius: 16, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: 60, background: "var(--gradient-card)", borderRadius: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
             <h2 style={{ fontSize: 42, fontWeight: 900, color: "var(--text-primary)", marginBottom: 24 }}>Join Our Journey</h2>
             <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 40px" }}>
               Whether you're a traveler looking for adventure or a company looking to partner, 
               there's a place for you at Smart Tour.
             </p>
             <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
               <Link href="/auth/login" className="btn btn-primary btn-lg">Start Planning</Link>
               <Link href="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
