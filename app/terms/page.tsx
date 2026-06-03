/**
 * @file terms/page.tsx
 * @description Terms of Service page for Smart Tour.
 */

"use client";
import Link from "next/link";
import { Scale, Gavel, UserCheck, AlertTriangle, Globe } from "lucide-react";
import Footer from "@/components/Footer";
import LandingNav from "@/components/LandingNav";

export default function TermsPage() {
  return (
    <div className="legal-light-page terms-page min-h-screen font-sans selection:bg-emerald-500/30">
      <LandingNav />

      <main data-nav-theme="light" className="legal-light-main pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-24 animate-fade">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
              <Scale size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Legal Framework</span>
            </div>
            <h1 className="legal-light-heading text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 uppercase italic">
              Terms of <span className="text-emerald-500">Service</span>
            </h1>
            <p className="legal-light-muted text-sm font-bold uppercase tracking-[0.2em]">
              Last updated: May 13, 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="legal-light-card rounded-[32px] p-8 md:p-16 space-y-20 animate-fade-up">
            
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <UserCheck size={24} />
                </div>
                <h2 className="legal-light-heading text-3xl font-black uppercase italic tracking-tight">1. Agreement</h2>
              </div>
              <p className="legal-light-copy text-lg leading-relaxed font-medium">
                By accessing or using Smart Tour, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, 
                you may not access the service.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Gavel size={24} />
                </div>
                <h2 className="legal-light-heading text-3xl font-black uppercase italic tracking-tight">2. Intellectual Property</h2>
              </div>
              <p className="legal-light-copy text-lg leading-relaxed font-medium">
                The Service and its original content, features, and functionality are the exclusive property of Smart Tour. Our platform is protected by copyright, trademark, and other laws of Pakistan.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="legal-light-heading text-3xl font-black uppercase italic tracking-tight">3. Limitation of Liability</h2>
              </div>
              <p className="legal-light-copy text-lg leading-relaxed font-medium">
                In no event shall Smart Tour, nor its directors or employees, be liable for any indirect, incidental, or consequential damages resulting from your access to or use of the Service.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Globe size={24} />
                </div>
                <h2 className="legal-light-heading text-3xl font-black uppercase italic tracking-tight">4. Governing Law</h2>
              </div>
              <p className="legal-light-copy text-lg leading-relaxed font-medium">
                These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict 
                of law provisions.
              </p>
            </section>

            {/* Contact Legal CTA */}
            <div className="pt-12 mt-12 border-t border-slate-200 text-center">
              <p className="legal-light-muted text-sm font-black uppercase tracking-widest mb-8">Have questions about our Terms?</p>
              <Link href="/contact" className="inline-flex px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                Consult Legal Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
