"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "120px", paddingBottom: "80px", background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: "var(--navy)", marginBottom: 16 }}>
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
              Have questions about your trip, our AI planner, or want to list your company? We are here to help you 24/7.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            
            {/* Contact Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Our Headquarters</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                  SmartTour Basecamp<br />
                  F-8 Markaz, Islamabad<br />
                  Pakistan
                </p>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Direct Contact</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                  <strong>Email:</strong> support@smarttour.pk<br />
                  <strong>Phone:</strong> +92 (51) 123-4567<br />
                  <strong>Hours:</strong> Mon-Fri, 9am - 6pm (PKT)
                </p>
              </div>

              <div className="card" style={{ padding: 24, background: "var(--gradient-card)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Partner With Us</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  Are you a tour operator looking to expand your reach? Join our trusted network of travel partners.
                </p>
                <a href="/auth/login" className="btn btn-secondary btn-sm" style={{ width: "fit-content" }}>Join as Partner</a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: "var(--text-primary)" }}>Send us a Message</h2>
              
              {success ? (
                <div className="alert alert-success" style={{ padding: 24, textAlign: "center", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 40 }}>✅</div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Message Sent!</h4>
                  <p style={{ fontSize: 14, margin: 0 }}>Thanks for reaching out. We will get back to you within 24 hours.</p>
                  <button className="btn btn-secondary" onClick={() => setSuccess(false)} style={{ marginTop: 16 }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="input-group">
                      <label className="input-label">Your Name</label>
                      <input className="input" placeholder="Ali Hassan" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input className="input" type="email" placeholder="ali@example.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Subject</label>
                    <input className="input" placeholder="How can we help?" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Message</label>
                    <textarea 
                      className="input" 
                      placeholder="Tell us about your inquiry..." 
                      rows={5} 
                      required 
                      value={form.message} 
                      onChange={e => setForm({...form, message: e.target.value})}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", padding: "14px", marginTop: 8 }} disabled={loading}>
                    {loading ? <span className="loading-spinner" /> : "Send Message"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
