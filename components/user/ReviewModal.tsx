"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createReview } from "@/lib/db";

interface ReviewModalProps {
  bookingId: string;
  tourId: string;
  onClose: () => void;
}

export function ReviewModal({ bookingId, tourId, onClose }: ReviewModalProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);

    try {
      // Determine sentiment based on rating
      const sentiment = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";

      const review = await createReview({
        tour_id: tourId,
        user_id: profile.id,
        booking_id: bookingId,
        rating,
        comment,
        sentiment,
      });

      if (review) {
        onClose();
        alert("Thank you for your review!");
      } else {
        throw new Error("Failed to submit review.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)"
    }}>
      <div className="glass-card" style={{ 
        width: "100%", maxWidth: 500, padding: 40, borderRadius: 24, 
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Leave a Review</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase" }}>
              How was your experience?
            </label>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  style={{
                    fontSize: 28, background: "none", border: "none", cursor: "pointer",
                    transition: "transform 0.2s", transform: rating >= num ? "scale(1.1)" : "scale(1)",
                    opacity: rating >= num ? 1 : 0.3,
                    filter: rating >= num ? "grayscale(0)" : "grayscale(1)"
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 10, fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>
              {rating === 5 ? "Amazing! 😍" : rating === 4 ? "Great! 😊" : rating === 3 ? "Good 😐" : rating === 2 ? "Bad ☹️" : "Terrible 😡"}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>
              Your Feedback
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell us about the tour, guide, and destinations..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, lineHeight: 1.6, outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : "Submit Review →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
