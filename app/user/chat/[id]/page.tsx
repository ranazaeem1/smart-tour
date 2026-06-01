"use client";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "@/components/shared/ChatWindow";

export default function UserChatPage({ params }: { params: Promise<{ id: string }> }) {
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
        .select('company_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (convError || !conv) {
        setOtherPartyName("Company");
        setLoading(false);
        return;
      }

      const { data: companyData } = await (supabase as any)
        .from('companies')
        .select('name')
        .eq('id', conv.company_id)
        .maybeSingle();
      setOtherPartyName(companyData?.name || "Company");

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
        currentRole="user"
        otherPartyName={otherPartyName}
        onClose={() => window.history.back()}
        isPage={true}
      />
    </div>
  );
}
