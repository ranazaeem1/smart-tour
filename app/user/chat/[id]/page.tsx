"use client";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "@/components/shared/ChatWindow";
import Link from "next/link";

export default function UserChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params);
  const { profile, loading: authLoading } = useAuth();
  const [otherPartyName, setOtherPartyName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConv() {
      if (!profile) return;
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          companies:company_id (name)
        `)
        .eq('id', conversationId)
        .single();

      if (!error && data) {
        setOtherPartyName((data as any).companies?.name || "Tour Company");
      }
      setLoading(false);
    }
    
    if (!authLoading) loadConv();
  }, [conversationId, profile, authLoading]);

  if (authLoading || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 100px)", position: "relative", margin: "-20px" }}>
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
