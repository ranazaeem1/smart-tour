"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'user' | 'company';
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  currentRole: 'user' | 'company';
  otherPartyName: string;
  onClose: () => void;
  isPage?: boolean;
}

export function ChatWindow({
  conversationId,
  currentRole,
  otherPartyName,
  onClose,
  isPage = false,
}: ChatWindowProps) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data ?? []);
      setLoading(false);
    }
    loadMessages();

    (supabase.from('messages') as any)
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_role', currentRole);

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          if ((payload.new as Message).sender_role !== currentRole) {
            (supabase.from('messages') as any)
              .update({ is_read: true })
              .eq('id', (payload.new as Message).id);
          }
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [conversationId, currentRole]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !currentUserId) return;
    setSending(true);

    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      sender_role: currentRole,
      content: input.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    try {
      const { error } = await (supabase.from('messages') as any).insert([{
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_role: currentRole,
        content: optimisticMsg.content,
      }]);

      if (error) throw error;

      await (supabase.from('conversations') as any)
        .update({
          last_message: optimisticMsg.content,
          last_message_at: optimisticMsg.created_at,
        })
        .eq('id', conversationId);

      await (supabase as any).rpc('increment_unread', { 
        conversation_id: conversationId, 
        role: currentRole === 'user' ? 'company' : 'user' 
      });

    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInput(optimisticMsg.content);
    } finally {
      setSending(false);
    }
  }

  const wrapperStyle: React.CSSProperties = isPage ? {
    width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#090c10"
  } : {
    position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: 20
  };

  const containerStyle: React.CSSProperties = isPage ? {
    flex: 1, display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.05)"
  } : {
    width: "100%", maxWidth: 460, height: "80vh", borderRadius: 24, background: "#0D1117",
    border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden"
  };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        {/* Chat Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>
            {otherPartyName?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{otherPartyName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>Active Now</span>
            </div>
          </div>
          {!isPage && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 20 }}>✕</button>
          )}
        </div>

        {/* Messages List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span className="loading-spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "20%", opacity: 0.4 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_role === currentRole;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{
                      padding: "10px 16px", borderRadius: 18, fontSize: 14, lineHeight: 1.5,
                      background: isMine ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.06)",
                      color: isMine ? "#fff" : "rgba(255,255,255,0.9)",
                      border: isMine ? "none" : "1px solid rgba(255,255,255,0.05)",
                      borderBottomRightRadius: isMine ? 4 : 18,
                      borderBottomLeftRadius: isMine ? 18 : 4
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, padding: "0 4px" }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMine && (msg.is_read ? " · Read" : " · Sent")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Message Input Area */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "2px 4px" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Message..."
                style={{
                  width: "100%", minHeight: 44, maxHeight: 120, padding: "10px 12px", background: "transparent",
                  border: "none", color: "#fff", outline: "none", fontSize: 14, resize: "none"
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "transform 0.2s", opacity: (!input.trim() || sending) ? 0.5 : 1
              }}
            >
              {sending ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : "↗"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
