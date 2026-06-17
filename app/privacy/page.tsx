/**
 * @file privacy/page.tsx
 * @description Privacy Policy page for Smart Tour.
 */

"use client";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";
import Footer from "@/components/Footer";
import LandingNav from "@/components/LandingNav";

export default function PrivacyPage() {
  return (
    <div className="legal-light-page privacy-page min-h-screen font-sans selection:bg-emerald-500/30">
      <LandingNav />

      <main data-nav-theme="light" className="legal-light-main pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade">
            <h1 className="legal-light-heading text-4xl md:text-6xl font-black tracking-tight leading-none mb-6 uppercase italic">
              Privacy <span className="text-emerald-500">Policy</span>
            </h1>
            <p className="legal-light-muted text-sm font-bold uppercase tracking-[0.2em]">
              Last updated: May 13, 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="legal-light-card rounded-[24px] p-7 md:p-12 space-y-14 animate-fade-up">
            
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <FileText size={24} />
                </div>
                <h2 className="legal-light-heading text-2xl font-black uppercase italic tracking-tight">1. Introduction</h2>
              </div>
              <p className="legal-light-copy text-base leading-relaxed font-medium">
                Welcome to Smart Tour. We respect your privacy and want to protect your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Eye size={24} />
                </div>
                <h2 className="legal-light-heading text-2xl font-black uppercase italic tracking-tight">2. Data We Collect</h2>
              </div>
              <p className="legal-light-copy text-base leading-relaxed font-medium mb-8">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Identity Data", desc: "Includes first name, last name, username or similar identifier." },
                  { title: "Contact Data", desc: "Includes email address and telephone numbers." },
                  { title: "Technical Data", desc: "Includes IP address, login data, browser type and version." },
                  { title: "Usage Data", desc: "Information about how you use our website and services." },
                ].map((item) => (
                  <div key={item.title} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                    <h4 className="legal-light-heading font-black mb-2 uppercase text-xs tracking-widest">{item.title}</h4>
                    <p className="legal-light-copy text-sm font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="legal-light-heading text-2xl font-black uppercase italic tracking-tight">3. How We Use Data</h2>
              </div>
              <p className="legal-light-copy text-base leading-relaxed font-medium">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide the AI-powered tour planning services, manage your account and bookings, and improve our website relationships.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Lock size={24} />
                </div>
                <h2 className="legal-light-heading text-2xl font-black uppercase italic tracking-tight">4. Data Security</h2>
              </div>
              <p className="legal-light-copy text-base leading-relaxed font-medium">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
                used or accessed in an unauthorized way, altered or disclosed.
              </p>
            </section>

            {/* Contact Support CTA */}
            <div className="pt-12 mt-12 border-t border-slate-200 text-center">
              <p className="legal-light-muted text-sm font-black uppercase tracking-widest mb-8">Questions about our Privacy Policy?</p>
              <Link href="/contact" className="inline-flex px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                Contact Support Hub
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
