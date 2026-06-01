"use client";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "@/components/shared/ChatWindow";

export default function CompanyChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params);
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");
  const { profile, loading: authLoading } = useAuth();
  const [otherPartyName, setOtherPartyName] = useState(nameFromUrl || "Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConv() {
      if (!profile) return;

      if (nameFromUrl) {
        setOtherPartyName(nameFromUrl);
        setLoading(false);
        return;
      }

      const { data: conv, error: convError } = await (supabase as any)
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (convError || !conv) {
        setOtherPartyName("Traveller");
        setLoading(false);
        return;
      }

      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('full_name, email')
        .eq('id', conv.user_id)
        .maybeSingle();
      setOtherPartyName(
        profileData?.full_name?.trim() ||
          profileData?.email?.split('@')[0] ||
          'Traveller'
      );

      setLoading(false);
    }

    if (!authLoading) loadConv();
  }, [conversationId, profile, authLoading, nameFromUrl]);

  if (authLoading || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 80px)", position: "relative", margin: "-20px" }}>
      <ChatWindow
        conversationId={conversationId}
        currentRole="company"
        otherPartyName={otherPartyName}
        onClose={() => window.history.back()}
        isPage={true}
      />
    </div>
  );
}
