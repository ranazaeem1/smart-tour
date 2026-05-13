"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function findOrCreateConversation() {
      if (authLoading || !profile) return;

      const bookingId = searchParams.get("bookingId");
      const companyId = searchParams.get("companyId");
      const name = searchParams.get("name");

      if (!companyId) {
        // If no specific chat parameters, go to Inbox
        router.replace("/user/chat/list");
        return;
      }

      // Try to find an existing conversation between this user and company
      const { data: existing, error: findError } = await (supabase
        .from("conversations") as any)
        .select("id")
        .eq("user_id", profile.id)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existing) {
        router.replace(`/user/chat/${existing.id}?name=${encodeURIComponent(name || "")}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await (supabase.from("conversations") as any)
        .insert({
          user_id: profile.id,
          company_id: companyId,
          last_message: "Chat started",
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (newConv) {
        router.replace(`/user/chat/${newConv.id}?name=${encodeURIComponent(name || "")}`);
      } else {
        console.error("Failed to create conversation:", createError);
        router.push("/user/dashboard");
      }
    }

    findOrCreateConversation();
  }, [authLoading, profile, searchParams, router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <div style={{ textAlign: "center" }}>
        <span className="loading-spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Opening chat...</p>
      </div>
    </div>
  );
}

export default function UserChatInitPage() {
  return (
    <Suspense fallback={null}>
      <ChatRedirect />
    </Suspense>
  );
}
