/**
 * @file page.tsx
 * @description The main landing page for Smart Tour. Showcases top tours, destinations, 
 * features, and provides direct entry points for users and companies.
 */

"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Star, 
  Brain, 
  Shield, 
  Coins, 
  CloudSun, 
  Smartphone, 
  MapPin, 
  ChevronRight, 
  Play,
  ArrowDown
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    if (path.startsWith('#')) {
      scrollToSection(path.substring(1));
    } else {
      router.push(path);
    }
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* 
        ================================================================
        1. NAVBAR
        ================================================================
      */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-bold text-white text-lg tracking-tight uppercase italic">Smart<span className="text-emerald-500">Tour</span></span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('destinations')} className="text-white/80 hover:text-white transition text-[13px] font-black uppercase tracking-widest">Destinations</button>
              <button onClick={() => scrollToSection('tours')} className="text-white/80 hover:text-white transition text-[13px] font-black uppercase tracking-widest">Tours</button>
              <button onClick={() => scrollToSection('planner')} className="text-white/80 hover:text-white transition text-[13px] font-black uppercase tracking-widest">AI Planner</button>
              <button onClick={() => scrollToSection('about')} className="text-white/80 hover:text-white transition text-[13px] font-black uppercase tracking-widest">About</button>
            </div>

            {/* AUTH BUTTONS */}
            <div className="hidden sm:flex items-center gap-4">
              <button onClick={() => handleNavigation('/auth/login')} className="px-6 py-2 text-white/80 hover:text-white transition text-[13px] font-black uppercase tracking-widest border border-white/10 rounded-xl hover:bg-white/5">Login</button>
              <button onClick={() => handleNavigation('/auth/login')} className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition shadow-xl shadow-emerald-500/20 active:scale-95">GET STARTED</button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 space-y-4 border-t border-white/10 animate-fade">
              <button onClick={() => scrollToSection('destinations')} className="block w-full text-left px-4 py-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest">Destinations</button>
              <button onClick={() => scrollToSection('tours')} className="block w-full text-left px-4 py-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest">Tours</button>
              <button onClick={() => scrollToSection('planner')} className="block w-full text-left px-4 py-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest">AI Planner</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-white/80 hover:text-white text-sm font-bold uppercase tracking-widest">About</button>
              <div className="pt-4 flex flex-col gap-3 px-4">
                <button onClick={() => handleNavigation('/auth/login')} className="w-full py-3 text-center text-white/80 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs">Login</button>
                <button onClick={() => handleNavigation('/auth/login')} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20">GET STARTED</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="relative">
        {/* 
          ================================================================
          2. HERO SECTION
          ================================================================
        */}
        <section className="relative w-full h-screen pt-20 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[10s] scale-105"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop")',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-full mb-8 animate-fade">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Next Gen Travel Intelligence</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter animate-fade-up italic">
              DISCOVER THE
              <br />
              <span className="text-emerald-500">EXTRAORDINARY</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium animate-fade-up delay-100">
              Let's start your journey with us, your dream will come true
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[32px] sm:rounded-full p-2 flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-3xl mx-auto mb-8 animate-fade-up delay-200">
              <input type="text" placeholder="Where to?" className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 sm:py-3 outline-none text-sm font-bold" />
              <input type="text" placeholder="PKR" className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 sm:py-3 outline-none text-sm font-bold border-t sm:border-t-0 sm:border-l border-white/10" />
              <input type="text" onFocus={(e) => (e.target.type = "date")} placeholder="Add dates" className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 sm:py-3 outline-none text-sm font-bold border-t sm:border-t-0 sm:border-l border-white/10" />
              <button onClick={() => scrollToSection('tours')} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black px-10 py-4 sm:py-3 rounded-full whitespace-nowrap transition shadow-xl shadow-emerald-500/30 text-xs uppercase tracking-widest active:scale-95">EXPLORE NOW</button>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          3. FEATURED EXPERIENCES / TOURS GRID
          ================================================================
        */}
        <section id="tours" className="py-32 bg-white text-slate-900 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 uppercase italic">Featured <span className="text-emerald-600">Experiences</span></h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl">Discover amazing destinations and create unforgettable memories with our curated selections.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { img:"https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?w=800&h=600&fit=crop", name:"Indonesia Paradise", price:"$500", dur:"3 Days, 2 Nights", badge:"HOT DEAL" },
                { img:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop", name:"Japan Adventure", price:"$800", dur:"5 Days, 4 Nights", badge:"PREMIUM" },
                { img:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop", name:"Mountain Escape", price:"$600", dur:"3 Days, 2 Nights", badge:"BESTSELLER" },
              ].map((d) => (
                <div key={d.name} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer" onClick={() => handleNavigation('/auth/login')}>
                  <div className="relative h-64 bg-slate-100 overflow-hidden">
                    <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">{d.badge}</div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{d.name}</h3>
                    <p className="text-slate-500 text-sm font-bold mb-6 flex items-center gap-2"><CloudSun size={14} className="text-emerald-500" /> {d.dur}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                      <span className="text-3xl font-black text-emerald-600">{d.price}</span>
                      <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-xs uppercase tracking-widest group/link">Know More <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-20">
              <button onClick={() => handleNavigation('/auth/login')} className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 uppercase tracking-[0.2em] text-xs active:scale-95">View All Tours</button>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          4. AI Planner (The Smart Edge)
          ================================================================
        */}
        <section id="planner" className="py-32 px-6 bg-black scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">The Future of Travel</p>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10 uppercase italic">Smarter <br /><span className="text-emerald-500">Adventures</span></h2>
                <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-12 max-w-lg">Every feature is designed to make your northern Pakistan adventure safer, smarter, and unforgettable using state-of-the-art AI.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { icon:<Brain className="text-emerald-500"/>, title:"AI Itinerary", desc:"Personalized plans based on your budget & time." },
                    { icon:<Shield className="text-rose-500"/>, title:"Safety Tracking", desc:"Real-time risk scoring for every route." },
                    { icon:<Coins className="text-gold"/>, title:"Budget AI", desc:"Visual breakdown of all travel expenses." },
                    { icon:<CloudSun className="text-blue-400"/>, title:"Weather Intel", desc:"Avoid mountain storms with smart alerts." },
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:border-emerald-500/30 transition-all">{item.icon}</div>
                      <h4 className="font-black text-white mb-2">{item.title}</h4>
                      <p className="text-zinc-500 text-sm leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-[48px] border border-white/10 shadow-3xl bg-zinc-900">
                <img src="/images/skardu.png" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110"><Play fill="white" size={24} /></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          5. ABOUT SECTION
          ================================================================
        */}
        <section id="about" className="py-32 bg-slate-50 text-slate-900 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">About <span className="text-emerald-600">SmartTour</span></h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                  We believe travel is more than just visiting places — it's about creating memories, 
                  meeting cultures, and discovering yourself. SmartTour makes it easy to plan, book, 
                  and experience the world on your terms.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "Expert Planning", desc: "AI-powered itinerary suggestions based on deep travel data." },
                    { title: "Best Prices", desc: "Competitive rates from our network of verified global operators." },
                    { title: "24/7 Support", desc: "Round-the-clock customer assistance wherever you are in the world." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-5 group">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">✓</div>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{item.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[500px] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group">
                <img 
                  src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=1000&fit=crop" 
                  alt="About SmartTour"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          6. CTA SECTION
          ================================================================
        */}
        <section className="py-32 bg-gradient-to-r from-emerald-500 to-emerald-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">Ready to Explore?</h2>
            <p className="text-xl text-white/90 mb-12 font-medium">Start planning your next adventure with SmartTour intelligence.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                onClick={() => handleNavigation('/auth/login')}
                className="px-10 py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-black/10 uppercase tracking-widest text-xs active:scale-95"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => scrollToSection('tours')}
                className="px-10 py-4 border-2 border-white text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs active:scale-95"
              >
                Browse Tours
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}