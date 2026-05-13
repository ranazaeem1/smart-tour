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
    <footer className="bg-slate-950 text-white py-20 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-bold text-white text-xl tracking-tighter uppercase italic">Smart<span className="text-emerald-500">Tour</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Your trusted partner in travel planning and booking. Discover the extraordinary with AI-powered intelligence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">Quick Links</h3>
            <ul className="space-y-4">
              <li><button onClick={() => handleNavigation('#tours')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Tours</button></li>
              <li><button onClick={() => handleNavigation('#destinations')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Destinations</button></li>
              <li><button onClick={() => handleNavigation('/user/dashboard')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Dashboard</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">Company</h3>
            <ul className="space-y-4">
              <li><button onClick={() => handleNavigation('#about')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">About Us</button></li>
              <li><button onClick={() => handleNavigation('/company/dashboard')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">For Companies</button></li>
              <li><button onClick={() => handleNavigation('/admin/dashboard')} className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Admin</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-[13px] font-bold uppercase tracking-widest">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            &copy; {currentYear} SmartTour. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <button onClick={() => handleNavigation('/user/dashboard')} className="hover:text-emerald-400 transition-colors">Dashboard</button>
            <button onClick={() => handleNavigation('/company/dashboard')} className="hover:text-emerald-400 transition-colors">Company Panel</button>
            <button onClick={() => handleNavigation('/admin/dashboard')} className="hover:text-emerald-400 transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
