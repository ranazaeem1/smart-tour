'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface StartChatButtonProps {
  bookingId: string;
  userId: string;
  companyId: string;
  otherPartyName: string;
  currentRole: 'user' | 'company';
}

export function StartChatButton({
  bookingId,
  userId,
  companyId,
  otherPartyName,
  currentRole,
}: StartChatButtonProps) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function openChat() {
    setLoading(true);
    try {
      if (!companyId || !bookingId) {
        alert("Missing booking or company details.");
        setLoading(false);
        return;
      }

      console.log("[Chat] Searching for existing conversation for booking:", bookingId);
      let { data: existing, error: existingError } = await (supabase.from('conversations') as any)
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (existingError) {
        console.error("[Chat] Search error:", existingError);
        throw existingError;
      }

      if (!existing) {
        console.log("[Chat] No existing conversation. Creating new one...");
        const { data: created, error: createErr } = await (supabase.from('conversations') as any)
          .insert([{ 
            booking_id: bookingId, 
            user_id: userId, 
            company_id: companyId 
          }])
          .select('id')
          .single();

        if (createErr) {
          console.error("[Chat] Creation error:", createErr);
          throw createErr;
        }
        existing = created;
      }

      console.log("[Chat] Success! Redirecting to conversation:", existing!.id);
      router.push(`/${currentRole}/chat/${existing!.id}`);
    } catch (err: any) {
      console.error('[Chat Error]', err?.message || JSON.stringify(err));
      alert(`Could not open chat. ${err?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openChat}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
        borderRadius: 14, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
        color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s",
        boxShadow: "0 4px 12px rgba(59,130,246,0.1)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(59,130,246,0.2)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(59,130,246,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {loading ? (
        <span className="loading-spinner" style={{ width: 14, height: 14 }} />
      ) : (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )}
      Start Chat
    </button>
  );
}
