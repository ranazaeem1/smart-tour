"use client";
import { useEffect, useRef } from "react";
import { Check, PhoneCall } from "lucide-react";

/**
 * @file BookingSuccessModal.tsx
 * @description ISSUE #7 — Booking success popup displayed after a user successfully books a tour.
 * Shows confirmation and the "company will contact you" message.
 */

interface BookingSuccessModalProps {
  onClose: () => void;
  tourTitle?: string;
}

export function BookingSuccessModal({ onClose, tourTitle }: BookingSuccessModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(undefined);

  // Auto-close after 7 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onClose, 7000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 10, 20, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="animate-fade"
        style={{
          maxWidth: 440,
          width: "100%",
          background: "rgba(16, 185, 129, 0.05)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: 28,
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(16,185,129,0.15), 0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Animated Success Icon */}
        <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 28px" }}>
          {/* Pulse ring */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              animation: "sos-pulse 2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: 88,
              height: 88,
              background: "linear-gradient(135deg, #10B981, #059669)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(16,185,129,0.5)",
              position: "relative",
            }}
          >
            <Check size={44} color="white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.2 }}>
          Booking Confirmed
        </h2>

        {/* Tour name */}
        {tourTitle && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
            {tourTitle}
          </p>
        )}

        {/* ── ISSUE #7 MESSAGE ── Key message box */}
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1.6, marginBottom: 10 }}>
            Your booking has been received successfully.
          </p>
          <p style={{ color: "#10B981", fontWeight: 700, fontSize: 15 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <PhoneCall size={16} /> The company will contact you soon. Stay Connected!
            </span>
          </p>
        </div>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24 }}>
          You can track your booking status in{" "}
          <span style={{ color: "#FFFFFF" }}>My Bookings</span>
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Check size={16} /> View My Bookings
          </span>
        </button>
      </div>
    </div>
  );
}
