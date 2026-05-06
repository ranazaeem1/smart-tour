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
        setOtherPartyName((data.companies as any)?.name || "Tour Company");
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
      {/* Back Button Overlay */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}>
        <Link href="/user/bookings" className="btn btn-ghost" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
          ← Back to Bookings
        </Link>
      </div>

      {/* 
        We use the existing ChatWindow but pass a prop or 
        let it know it's in "Page Mode" so it fills the parent.
      */}
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
