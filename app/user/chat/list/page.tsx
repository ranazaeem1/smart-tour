"use client";
import { Inbox } from "@/components/shared/Inbox";
import { useAuth } from "@/components/AuthProvider";

export default function UserInboxPage() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <span className="loading-spinner" />
    </div>
  );

  return <Inbox role="user" currentUserId={profile.id} />;
}
