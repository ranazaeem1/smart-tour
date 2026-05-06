"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ReviewModalProps {
  bookingId: string;
  tourId: string;
  onClose: () => void;
}

export function ReviewModal({ bookingId, tourId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase.from('reviews') as any).insert([{
        booking_id: bookingId,
        tour_id: tourId,
        user_id: user.id,
        rating,
        comment,
        sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative'
      }]);

      if (error) throw error;
      alert("Review submitted successfully!");
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)"
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: "100%", maxWidth: 480, padding: 40, borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.2)", position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
      }}>
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 20 }}
        >✕</button>

        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Share Experience</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 14 }}>How was your journey? Your feedback helps us improve.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Your Rating</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 32, transition: "transform 0.2s",
                    transform: (hoverRating || rating) >= star ? "scale(1.2)" : "scale(1)",
                    color: (hoverRating || rating) >= star ? "#fbbf24" : "rgba(255,255,255,0.1)"
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
              {rating === 5 ? "Exceptional!" : rating === 4 ? "Great Experience" : rating === 3 ? "Good" : rating === 2 ? "Could be better" : "Poor"}
            </p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 8 }}>Review Details</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the tour, the guide, and the destinations..."
              style={{
                width: "100%", height: 140, padding: 16, borderRadius: 16,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 15, lineHeight: 1.6, resize: "none", outline: "none",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "14px", borderRadius: 14 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2, padding: "14px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? <span className="loading-spinner" /> : "Submit Review →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
