/**
 * @file Footer.tsx
 * @description Professional dark footer component for the Smart Tour platform.
 */

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="site-footer bg-slate-950 text-white py-20 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="Smart Tour logo" className="w-12 h-12 rounded-full object-contain group-hover:scale-105 transition-transform" />
              <span className="site-footer-brand font-black text-xl tracking-tight uppercase"><span className="site-footer-brand-smart">Smart</span><span className="text-emerald-500">Tour</span></span>
            </Link>
            <p className="site-footer-copy text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Your trusted partner in travel planning and booking. Discover the extraordinary with AI-powered intelligence.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="site-footer-heading text-[11px] font-black text-white uppercase tracking-[0.16em] mb-8">Company</h3>
            <ul className="space-y-4">
              <li><button suppressHydrationWarning onClick={() => handleNavigation('#about')} className="site-footer-link text-slate-400 hover:text-emerald-400 transition-colors text-sm font-semibold">About Us</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="site-footer-heading text-[11px] font-black text-white uppercase tracking-[0.16em] mb-8">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="site-footer-link text-slate-400 hover:text-emerald-400 transition-colors text-sm font-semibold">Privacy Policy</Link></li>
              <li><Link href="/terms" className="site-footer-link text-slate-400 hover:text-emerald-400 transition-colors text-sm font-semibold">Terms of Service</Link></li>
              <li><Link href="/contact" className="site-footer-link text-slate-400 hover:text-emerald-400 transition-colors text-sm font-semibold">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="site-footer-meta text-slate-500 text-xs font-semibold">
            &copy; {currentYear} SmartTour. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
