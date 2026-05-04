/**
 * @file terms/page.tsx
 * @description Terms of Service page for Smart Tour.
 * @author Smart Tour Team
 */

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "120px", paddingBottom: "100px", background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "var(--navy)", marginBottom: 16 }}>
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>
              Last updated: May 4, 2026
            </p>
          </div>

          <div className="card" style={{ padding: "40px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>1. Agreement to Terms</h2>
              <p>
                By accessing or using Smart Tour, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, 
                you may not access the service.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>2. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding Content provided by users), features and functionality are and will remain 
                the exclusive property of Smart Tour and its licensors. Our platform is protected by copyright, trademark, and other laws 
                of both Pakistan and foreign countries.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>4. Limitation of Liability</h2>
              <p>
                In no event shall Smart Tour, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
                indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, 
                goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section style={{ marginBottom: 40 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>5. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict 
                of law provisions.
              </p>
            </section>

            <div style={{ marginTop: 60, padding: 30, background: "var(--bg-secondary)", borderRadius: 16, textAlign: "center" }}>
              <p style={{ fontWeight: 700, marginBottom: 16 }}>Have questions about our Terms?</p>
              <Link href="/contact" className="btn btn-primary" style={{ margin: "0 auto" }}>Contact Legal Team</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
