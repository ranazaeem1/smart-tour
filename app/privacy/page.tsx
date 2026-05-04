/**
 * @file privacy/page.tsx
 * @description Privacy Policy page for Smart Tour.
 * @author Smart Tour Team
 */

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "120px", paddingBottom: "100px", background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "var(--navy)", marginBottom: 16 }}>
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              Last updated: May 4, 2026
            </p>
          </div>

          <div className="card" style={{ padding: "40px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>1. Introduction</h2>
              <p>
                Welcome to Smart Tour. We respect your privacy and want to protect your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>2. Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, login data, browser type and version.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>3. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                <li>To provide the AI-powered tour planning services.</li>
                <li>To manage your account and bookings.</li>
                <li>To improve our website, products/services, marketing, and customer relationships.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
                used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal 
                data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <div style={{ marginTop: 60, padding: 30, background: "var(--bg-secondary)", borderRadius: 16, textAlign: "center" }}>
              <p style={{ fontWeight: 700, marginBottom: 16 }}>Questions about our Privacy Policy?</p>
              <Link href="/contact" className="btn btn-primary" style={{ margin: "0 auto" }}>Contact Support</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
