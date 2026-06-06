/**
 * @file contact/page.tsx
 * @description Contact page for Smart Tour.
 */

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, HelpCircle, Briefcase } from "lucide-react";
import Footer from "@/components/Footer";
import LandingNav from "@/components/LandingNav";
import { emailPattern, normalizeEmail, stripNumbers, textOnlyPattern } from "@/lib/formValidation";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="legal-light-page contact-page min-h-screen font-sans selection:bg-emerald-500/30">
      <LandingNav />

      <main data-nav-theme="light" className="legal-light-main pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade">
            <h1 className="legal-light-heading text-4xl md:text-6xl font-black tracking-tight leading-none mb-6 uppercase italic">
              Contact <span className="text-emerald-500">Us</span>
            </h1>
            <p className="legal-light-copy text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Have questions about your trip, our AI planner, or want to list your company? We are here to help you 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-fade-up">
            
            {/* Contact Info Column */}
            <div className="lg:col-span-2 space-y-6">
              {[

                { icon: <Mail />, title: "Direct Support", content: "support@smarttour.pk | Available 24/7" },
                { icon: <Phone />, title: "Phone Support", content: "+92 3068489696 | Mon-Fri 9am-6pm" },
              ].map((item, i) => (
                <div key={i} className="legal-light-card p-7 rounded-[24px] group hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="legal-light-heading text-lg font-black mb-2 uppercase tracking-tighter italic">{item.title}</h3>
                  <p className="legal-light-copy text-sm font-medium leading-relaxed">{item.content}</p>
                </div>
              ))}

              <div className="legal-light-card p-7 rounded-[24px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-6">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="text-lg font-light text-emerald-500 mb-2 uppercase tracking-tighter italic">Partner With Us</h3>
                  <p className="legal-light-copy text-sm font-medium leading-relaxed mb-8">
                    Join our trusted network of global travel operators and expand your business with SmartTour intelligence.
                  </p>
                  <Link href="/auth/login" className="inline-flex text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                    Join Partner Portal
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-3 legal-light-card rounded-[24px] p-7 md:p-10 shadow-2xl">
              <h2 className="legal-light-heading text-2xl md:text-3xl font-black uppercase italic tracking-tight mb-8">Send us a <span className="text-emerald-500">Message</span></h2>
              
              {success ? (
                <div className="py-20 text-center space-y-6 animate-fade">
                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8">
                    <Send size={32} />
                  </div>
                  <h4 className="legal-light-heading text-2xl font-black uppercase italic">Message Sent!</h4>
                  <p className="legal-light-copy font-medium">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                  <button 
                    suppressHydrationWarning
                    className="px-10 py-4 bg-slate-100 border border-slate-200 text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    onClick={() => setSuccess(false)}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Your Name</label>
                      <input 
                        suppressHydrationWarning
                        className="legal-light-input w-full rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500/50 transition-all" 
                        placeholder="Ali Hassan" required pattern={textOnlyPattern} title="Use letters only." value={form.name} onChange={e => setForm({...form, name: stripNumbers(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Email Address</label>
                      <input 
                        suppressHydrationWarning
                        className="legal-light-input w-full rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500/50 transition-all" 
                        type="email" inputMode="email" pattern={emailPattern} placeholder="ali@example.com" required value={form.email} onChange={e => setForm({...form, email: normalizeEmail(e.target.value)})} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Subject</label>
                    <input 
                      suppressHydrationWarning
                      className="legal-light-input w-full rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500/50 transition-all" 
                      placeholder="How can we help?" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Message</label>
                    <textarea 
                      suppressHydrationWarning
                      className="legal-light-input w-full rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-emerald-500/50 transition-all min-h-[160px] resize-none" 
                      placeholder="Tell us about your inquiry..." required value={form.message} onChange={e => setForm({...form, message: e.target.value})} 
                    />
                  </div>

                  <button 
                    suppressHydrationWarning
                    type="submit" 
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3" 
                    disabled={loading}
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Message <Send size={14} /></>}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
