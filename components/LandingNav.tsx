"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingNav() {
  const router = useRouter();
  const [navOnDark, setNavOnDark] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
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
        const luminance = getLuminance(window.getComputedStyle(current).backgroundColor);
        if (luminance !== null) {
          setNavOnDark(luminance < 0.45);
          return;
        }
        current = current.parentElement;
      }
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
    if (path.startsWith("#")) {
      const element = document.getElementById(path.substring(1));
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(path);
    }
  };

  const navItems = [
    { label: "Destinations", href: "/#destinations" },
    { label: "Tours", href: "/#tours" },
    { label: "AI Planner", href: "/#planner" },
    { label: "About", href: "/#about" },
  ];

  return (
    <nav ref={navRef} className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500">
      <div className={`landing-nav-shell ${navOnDark ? "nav-on-dark" : "nav-on-light"} rounded-[32px] px-8 sm:px-10 h-20 sm:h-24 flex justify-between items-center shadow-2xl`}>
        <Link href="/" className="landing-nav-brand flex items-center gap-2 cursor-pointer group">
          <img src="/logo.svg" alt="Smart Tour logo" className="w-11 h-11 rounded-full object-contain group-hover:scale-105 transition-transform" />
          <span className="text-xl font-black tracking-tighter uppercase italic">
            <span className="landing-brand-primary">Smart</span><span className="landing-brand-accent">Tour</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="landing-nav-link text-[10px] font-black hover:text-emerald-500 uppercase tracking-[0.2em] transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            suppressHydrationWarning
            onClick={() => handleNavigation("/auth/login")}
            className="landing-nav-link hidden sm:block text-[10px] font-black hover:text-emerald-500 uppercase tracking-[0.2em] transition-all"
          >
            Login
          </button>
          <button
            suppressHydrationWarning
            onClick={() => handleNavigation("/auth/login")}
            className="px-8 py-3.5 btn-neon text-[10px] rounded-2xl"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
