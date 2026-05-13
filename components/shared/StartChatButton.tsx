"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

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
    const basePath = currentRole === "company" ? "/company/chat" : "/user/chat";
    router.push(`${basePath}?bookingId=${bookingId}&companyId=${companyId}&userId=${userId}&name=${encodeURIComponent(otherPartyName)}`);
  };

  return (
    <button 
      onClick={handleStartChat}
      className="btn btn-secondary !px-4 !py-2 !h-auto flex items-center gap-2 group hover:scale-105 active:scale-95 transition-all bg-white/5 border border-white/10 hover:bg-white/10"
    >
      <MessageSquare size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Initiate Signal</span>
    </button>
  );
}
