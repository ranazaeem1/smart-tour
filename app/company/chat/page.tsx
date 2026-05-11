"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fetchCompanyByOwner } from "@/lib/db";

function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    async function findOrCreateConversation() {
      if (authLoading || !profile) return;

      const userId = searchParams.get("userId"); // When company starts chat with user
      const name = searchParams.get("name");

      if (!userId) {
        console.error("Missing userId in chat redirect");
        router.push("/company/dashboard");
        return;
      }

      // 1. Get the actual company ID linked to this owner
      const company = await fetchCompanyByOwner(profile.id);
      if (!company) {
        console.error("No company found for this owner");
        router.push("/company/dashboard");
        return;
      }
      
      const companyId = company.id;

      // 2. Try to find an existing conversation
      const { data: existing, error: findError } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existing) {
        router.replace(`/company/chat/${existing.id}?name=${encodeURIComponent(name || "")}`);
        return;
      }

      // 3. Create new
      const { data: newConv, error: createError } = await (supabase.from("conversations") as any)
        .insert({
          user_id: userId,
          company_id: companyId,
          last_message: "Chat started",
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (newConv) {
        router.replace(`/company/chat/${newConv.id}?name=${encodeURIComponent(name || "")}`);
      } else {
        console.error("Failed to create conversation:", createError);
        router.push("/company/dashboard");
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

export default function CompanyChatInitPage() {
  return (
    <Suspense fallback={null}>
      <ChatRedirect />
    </Suspense>
  );
}
