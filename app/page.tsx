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
  ArrowRight, 
  Brain, 
  Shield, 
  Coins, 
  CloudSun, 
  MapPin, 
  Check,
  Menu,
  X
} from "lucide-react";
import Footer from "@/components/Footer";

const LANDING_FEATURED_TOURS = [
  {
    id: "landing-neelum",
    title: "Neelum Valley Escape",
    destination: "Neelum Valley",
    category: "Nature",
    duration: 5,
    price: 35000,
    image_url: "/images/neelum.png",
  },
  {
    id: "landing-fairy-meadows",
    title: "Fairy Meadows Basecamp",
    destination: "Fairy Meadows",
    category: "Adventure",
    duration: 4,
    price: 30000,
    image_url: "/images/fairy-meadows.png",
  },
  {
    id: "landing-hunza",
    title: "Hunza Valley Explorer",
    destination: "Hunza Valley",
    category: "Culture",
    duration: 7,
    price: 40000,
    image_url: "/images/hunza.png",
  },
  {
    id: "landing-malam-jabba",
    title: "Malam Jabba Ski Safari",
    destination: "Malam Jabba",
    category: "Snow",
    duration: 4,
    price: 26000,
    image_url: "/images/malam-jabba.png",
  },
  {
    id: "landing-naran",
    title: "Naran Kaghan Retreat",
    destination: "Naran & Kaghan",
    category: "Family",
    duration: 4,
    price: 20000,
    image_url: "/images/naran.png",
  },
];

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tours = LANDING_FEATURED_TOURS;
  const loading = false;
  const [navOnDark, setNavOnDark] = useState(true);
  const [heroSearch, setHeroSearch] = useState({ location: "", price: "", date: "" });
  const [heroSearchError, setHeroSearchError] = useState<string | null>(null);
  const navRef = React.useRef<HTMLElement | null>(null);

  const minSearchDate = React.useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  React.useEffect(() => {
    const getLuminance = (color: string) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return null;

      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      if (alpha === 0) return null;

      const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const updateNavTheme = () => {
      const nav = navRef.current;
      const sampleX = window.innerWidth / 2;
      const sampleY = nav ? nav.getBoundingClientRect().bottom + 8 : 112;
      const elements = document.elementsFromPoint(sampleX, sampleY) as HTMLElement[];

      const sampledElement = elements.find((element) => !nav?.contains(element));
      const sectionTheme = sampledElement?.closest<HTMLElement>("[data-nav-theme]")?.dataset.navTheme;

      if (sectionTheme) {
        setNavOnDark(sectionTheme === "dark");
        return;
      }

      let current: HTMLElement | null = sampledElement || document.body;
      while (current) {
        const styles = window.getComputedStyle(current);
        const luminance = getLuminance(styles.backgroundColor);

        if (luminance !== null) {
          setNavOnDark(luminance < 0.45);
          return;
        }

        current = current.parentElement;
      }

      setNavOnDark(false);
    };

    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);
    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, []);

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

  const setHeroLocation = (value: string) => {
    setHeroSearchError(null);
    setHeroSearch((current) => ({
      ...current,
      location: value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " "),
    }));
  };

  const setHeroPrice = (value: string) => {
    setHeroSearchError(null);
    setHeroSearch((current) => ({
      ...current,
      price: value.replace(/\D/g, "").slice(0, 9),
    }));
  };

  const setHeroDate = (value: string) => {
    setHeroSearchError(null);
    setHeroSearch((current) => ({ ...current, date: value }));
  };

  const handleHeroExplore = () => {
    const location = heroSearch.location.trim();
    const price = heroSearch.price.trim();

    if (location && !/^[A-Za-z\s]+$/.test(location)) {
      setHeroSearchError("Location should contain alphabets only.");
      return;
    }

    if (price && !/^\d+$/.test(price)) {
      setHeroSearchError("Budget should contain numbers only.");
      return;
    }

    if (heroSearch.date && heroSearch.date < minSearchDate) {
      setHeroSearchError("Previous dates are locked. Please select today or a future date.");
      return;
    }

    const params = new URLSearchParams();
    if (location) params.set("destination", location);
    if (price) params.set("budget", price);
    if (heroSearch.date) params.set("date", heroSearch.date);

    router.push(`/user/tours${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* 
        ================================================================
        1. NAVBAR
        ================================================================
      */}
      <nav ref={navRef} className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[95%] max-w-7xl z-50 transition-all duration-500">
        <div className={`landing-nav-shell ${navOnDark ? "nav-on-dark" : "nav-on-light"} rounded-3xl sm:rounded-[32px] px-4 sm:px-8 lg:px-10 h-16 sm:h-20 lg:h-24 flex justify-between items-center shadow-2xl`}>
          
          {/* LOGO */}
          <Link href="/" className="landing-nav-brand flex items-center gap-2 cursor-pointer group">
            <img src="/logo.svg" alt="Smart Tour logo" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain group-hover:scale-105 transition-transform" />
            <span className="text-base sm:text-xl font-black tracking-tighter uppercase italic">
              <span className="landing-brand-primary">Smart</span><span className="landing-brand-accent">Tour</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "Destinations", href: "#destinations" },
              { label: "AI Planner", href: "#planner" },
              { label: "About", href: "#about" },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="landing-nav-link text-[10px] font-black hover:text-emerald-500 uppercase tracking-[0.2em] transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              suppressHydrationWarning
              onClick={() => handleNavigation('/auth/login')}
              className="landing-nav-link hidden sm:block text-[10px] font-black hover:text-emerald-500 uppercase tracking-[0.2em] transition-all"
            >
              Login
            </button>
            <button 
              suppressHydrationWarning
              onClick={() => handleNavigation('/auth/login')}
              className="hidden min-[380px]:inline-flex px-5 sm:px-8 py-3 sm:py-3.5 btn-neon text-[9px] sm:text-[10px] rounded-2xl"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-current transition-all active:scale-95"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            {[
              { label: "Destinations", href: "#destinations" },
              { label: "AI Planner", href: "#planner" },
              { label: "About", href: "#about" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-[10px] font-black text-zinc-300 hover:bg-white/10 hover:text-emerald-500 uppercase tracking-[0.2em]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button
              suppressHydrationWarning
              onClick={() => handleNavigation('/auth/login')}
              className="w-full py-4 bg-emerald-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em]"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      <main className="relative">
        {/* 
          ================================================================
          2. HERO SECTION
          ================================================================
        */}
        <section data-nav-theme="dark" className="relative w-full min-h-[760px] sm:min-h-screen pt-24 sm:pt-20 pb-10 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[10s] scale-105"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop")',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="hero-title-wrap relative mb-6 animate-fade-up">
              <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter italic m-0">
                <span className="hero-title-line hero-title-line-left" style={{ color: "#FFFFFF" }}>WANDERLUST</span>
                <span className="hero-title-line hero-title-line-right" style={{ color: "#10B981" }}>AWAITS</span>
              </h1>
            </div>
            <p className="hero-subtitle text-lg sm:text-xl mb-12 max-w-2xl mx-auto font-medium animate-fade-up delay-100">
              Let's start your journey with us, your dream will come true
            </p>
            <div className="bg-white border border-slate-200 rounded-[28px] sm:rounded-3xl p-2 grid grid-cols-1 sm:grid-cols-[1fr_0.75fr_1fr_auto] items-stretch gap-2 sm:gap-0 w-full max-w-3xl mx-auto mb-8 animate-fade-up delay-200 shadow-2xl shadow-black/20">
              <input suppressHydrationWarning type="text" inputMode="text" pattern="[A-Za-z\s]*" placeholder="Where to?" value={heroSearch.location} onChange={(event) => setHeroLocation(event.target.value)} className="min-w-0 bg-white text-slate-950 placeholder:text-slate-500 px-6 py-4 sm:py-3 outline-none text-sm font-bold rounded-2xl sm:rounded-l-full sm:rounded-r-none" aria-label="Destination location" />
              <input suppressHydrationWarning type="text" inputMode="numeric" pattern="[0-9]*" placeholder="PKR" value={heroSearch.price} onChange={(event) => setHeroPrice(event.target.value)} className="min-w-0 bg-white text-slate-950 placeholder:text-slate-500 px-6 py-4 sm:py-3 outline-none text-sm font-bold border-t sm:border-t-0 sm:border-l border-slate-200 rounded-2xl sm:rounded-none" aria-label="Budget in PKR" />
              <input suppressHydrationWarning type="date" min={minSearchDate} value={heroSearch.date} onChange={(event) => setHeroDate(event.target.value)} className="min-w-0 bg-white text-slate-950 placeholder:text-slate-500 px-6 py-4 sm:py-3 outline-none text-sm font-bold border-t sm:border-t-0 sm:border-l border-slate-200 rounded-2xl sm:rounded-none" aria-label="Travel date" />
              <button suppressHydrationWarning onClick={handleHeroExplore} className="btn btn-emerald w-full sm:w-auto min-h-[52px] px-8 rounded-2xl whitespace-nowrap shadow-xl shadow-emerald-500/30 text-xs active:scale-95">EXPLORE NOW</button>
            </div>
            {heroSearchError && (
              <p className="mt-3 text-center text-xs font-black uppercase tracking-widest text-rose-200">
                {heroSearchError}
              </p>
            )}
          </div>
        </section>

        {/* 
          ================================================================
          3. FEATURED EXPERIENCES / TOURS GRID
          ================================================================
        */}
        <div id="destinations" className="scroll-mt-20" />
        <section id="tours" data-nav-theme="dark" className="py-16 sm:py-24 lg:py-32 bg-black text-white scroll-mt-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="mb-12 sm:mb-16 lg:mb-24 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-5 sm:mb-8 uppercase italic leading-none">Featured <br /><span className="text-emerald-500">Experiences</span></h2>
              <p className="text-base sm:text-xl text-zinc-400 font-medium leading-relaxed">Discover the untouched beauty of northern Pakistan with our premium, AI-verified tours.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="loading-spinner border-t-emerald-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 lg:gap-10">
                {tours.map((tour) => (
                  <div key={tour.id} className="group relative bg-[#050505] rounded-[28px] sm:rounded-[40px] overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-700 shadow-2xl" onClick={() => handleNavigation('/auth/login')}>
                    
                    {/* Image Header with Hero Text */}
                    <div className="relative h-[230px] sm:h-[300px] lg:h-[320px] overflow-hidden">
                      <img 
                        src={tour.image_url || "https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?w=800&h=600&fit=crop"} 
                        alt={tour.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" 
                      />
                      
                      {/* Category Badge */}
                      <div className="absolute top-6 right-6">
                        <span className="bg-[#10B981] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                          {tour.category || 'Adventure'}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 sm:p-8 lg:p-10 space-y-7 sm:space-y-10">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{tour.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div className="flex items-center gap-2">
                            <CloudSun size={14} className="text-emerald-500" />
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{tour.duration} Days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-500" />
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{tour.destination}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col min-[420px]:flex-row min-[420px]:justify-between min-[420px]:items-end gap-5">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Investment</p>
                          <p className="text-3xl font-black text-emerald-500 tracking-tighter">PKR {tour.price.toLocaleString()}</p>
                        </div>
                        <button suppressHydrationWarning className="inline-flex w-full min-[420px]:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95">
                          View Tour
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-24">
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          4. AI Planner (The Smart Edge)
          ================================================================
        */}
        <section id="planner" data-nav-theme="dark" className="planner-dark-section landing-dark-section py-16 sm:py-24 lg:py-32 px-4 sm:px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <h2 className="planner-dark-title text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] sm:leading-[0.9] mb-6 sm:mb-10 uppercase italic">Smarter <br /><span className="text-emerald-500">Adventures</span></h2>
                <p className="planner-dark-copy text-base sm:text-lg font-medium leading-relaxed mb-8 sm:mb-12 max-w-lg">Every feature is designed to make your northern Pakistan adventure safer, smarter, and unforgettable using state-of-the-art AI.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {[
                    { icon:<Brain className="text-emerald-500"/>, title:"AI Itinerary", desc:"Personalized plans based on your budget & time." },
                    { icon:<Shield className="text-rose-500"/>, title:"Safety Tracking", desc:"Real-time risk scoring for every route." },
                    { icon:<Coins className="text-gold"/>, title:"Budget AI", desc:"Visual breakdown of all travel expenses." },
                    { icon:<CloudSun className="text-blue-400"/>, title:"Weather Intel", desc:"Avoid mountain storms with smart alerts." },
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <div className="planner-dark-icon w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:border-emerald-500/30 transition-all">{item.icon}</div>
                      <h4 className="planner-dark-card-title font-black mb-2">{item.title}</h4>
                      <p className="planner-dark-card-copy text-sm leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-[28px] sm:rounded-[48px] border border-white/10 shadow-3xl bg-zinc-900">
                <img src="/images/skardu.png" className="w-full h-[320px] sm:h-[460px] lg:h-full object-cover" alt="Skardu mountain lake" />
              </div>
            </div>
          </div>
        </section>

        {/* 
          ================================================================
          5. ABOUT SECTION
          ================================================================
        */}
        <section id="about" data-nav-theme="light" className="py-16 sm:py-24 lg:py-32 bg-slate-50 text-slate-900 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">About <span className="text-emerald-600">SmartTour</span></h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                  Smart Tour is Pakistan&apos;s first AI-powered travel platform dedicated to the northern regions.
                  Founded by a team of travel enthusiasts and tech innovators, we believe that everyone
                  deserves a safe, personalized, and unforgettable adventure.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "Expert Planning", desc: "AI-powered itinerary suggestions based on deep travel data." },
                    { title: "Best Prices", desc: "Competitive rates from our network of verified global operators." },
                    { title: "24/7 Support", desc: "Round-the-clock customer assistance wherever you are in the world." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-5 group">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform"><Check size={18} /></div>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{item.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[320px] sm:h-[420px] lg:h-[500px] rounded-[28px] sm:rounded-[48px] overflow-hidden shadow-2xl border-4 sm:border-8 border-white group">
                <img 
                  src="/images/swat.jpg" 
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
        <section data-nav-theme="dark" className="landing-cta py-16 sm:py-24 lg:py-32 bg-gradient-to-r from-emerald-500 to-emerald-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black !text-white mb-8 tracking-tighter uppercase italic">Ready to Explore?</h2>
            <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12 font-medium">Start planning your next adventure with SmartTour intelligence.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                suppressHydrationWarning
                onClick={() => handleNavigation('/auth/login')} 
                className="w-full sm:w-auto px-6 sm:px-14 py-5 rounded-[24px] bg-white !text-emerald-600 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-950/10 transition-all hover:bg-emerald-700 hover:!text-white active:scale-95"
              >
                Start Your Expedition
              </button>
              <button 
                suppressHydrationWarning
                onClick={() => scrollToSection('tours')}
                className="w-full sm:w-auto px-10 py-4 border-2 border-white text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs active:scale-95"
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
