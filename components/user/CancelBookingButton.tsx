"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CancelBookingButtonProps {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in again.");

      const { error } = await (supabase.from('bookings') as any)
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      alert("Booking cancelled successfully.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", animation: "fadeIn 0.2s" }}>
        <span style={{ fontSize: 11, color: "var(--coral)", fontWeight: 600 }}>Sure?</span>
        <button 
          onClick={handleCancel}
          disabled={loading}
          style={{ 
            background: "var(--coral)", color: "#fff", border: "none", 
            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" 
          }}
        >
          {loading ? "..." : "Yes"}
        </button>
        <button 
          onClick={() => setShowConfirm(false)}
          style={{ 
            background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", 
            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" 
          }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn btn-ghost"
      style={{ 
        color: "var(--coral)", borderColor: "rgba(244,63,94,0.2)", 
        padding: "6px 14px", fontSize: 12, fontWeight: 700, borderRadius: 12 
      }}
    >
      Cancel Booking
    </button>
  );
}
