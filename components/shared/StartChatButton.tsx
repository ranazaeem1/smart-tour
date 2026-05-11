"use client";
import { useRouter } from "next/navigation";

interface StartChatButtonProps {
  bookingId: string;
  userId: string;
  companyId: string;
  otherPartyName: string;
  currentRole: "user" | "company";
}

export function StartChatButton({ bookingId, userId, companyId, otherPartyName, currentRole }: StartChatButtonProps) {
  const router = useRouter();

  const handleStartChat = () => {
    // Navigate to chat with params
    const basePath = currentRole === "company" ? "/company/chat" : "/user/chat";
    router.push(`${basePath}?bookingId=${bookingId}&companyId=${companyId}&userId=${userId}&name=${encodeURIComponent(otherPartyName)}`);
  };

  return (
    <button 
      onClick={handleStartChat}
      className="btn btn-secondary"
      style={{ 
        display: "flex", alignItems: "center", gap: 8, 
        fontWeight: 700, background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      💬 Chat
    </button>
  );
}
