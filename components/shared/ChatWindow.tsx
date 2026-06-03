"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { 
  Send, 
  X, 
  ChevronLeft, 
  CheckCheck, 
  MoreVertical,
  Activity,
  ShieldCheck,
  User,
  Building2
} from "lucide-react";

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
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUserId(user?.id ?? null);
  }, [user?.id]);

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

  return (
    <div className={`flex flex-col h-full animate-fade ${!isPage ? 'fixed inset-0 z-[1000] items-center justify-center bg-slate-950/80 backdrop-blur-xl p-3 md:p-6' : ''}`}>
      <div className={`flex flex-col bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden relative ${
        isPage ? 'h-full' : 'w-full max-w-[680px] h-[80vh] max-h-[640px] rounded-[var(--radius-xl)]'
      }`}>
        
        {/* ── Chat Header ── */}
        <header className="px-4 py-3 bg-slate-950 border-b border-white/5 flex items-center justify-between z-20 shrink-0 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3">
            {isPage && (
              <button 
                onClick={() => window.history.back()}
                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-base font-black text-white shadow-lg shadow-emerald-500/20">
                {currentRole === 'user' ? <Building2 size={18} /> : <User size={18} />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            
            <div className="min-w-0">
              <p className="uppercase tracking-widest text-[9px] opacity-40 text-white font-black mb-0.5">Active Signal</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white truncate">{otherPartyName}</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                   <ShieldCheck size={8} className="text-emerald-500" />
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button className="hidden md:flex w-8 h-8 items-center justify-center bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5">
                <MoreVertical size={16} />
             </button>
            {!isPage && (
              <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {/* ── Message Grid ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative bg-[#020617]">
          {/* subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50 relative z-10">
              <div className="loading-spinner h-8 w-8 !border-white/10 !border-t-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Syncing Relay...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full relative z-10">
               <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Activity size={28} className="text-emerald-500 opacity-50" />
              </div>
              <h3 className="text-base font-black text-white mb-1 uppercase tracking-widest text-center">No messages yet</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em] text-center">Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="relative z-10 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_role === currentRole;
                const showTime = idx === 0 || new Date(messages[idx-1].created_at).getTime() < new Date(msg.created_at).getTime() - 1800000; // 30 mins
                
                return (
                  <div key={msg.id} className="space-y-2">
                    {showTime && (
                      <div className="flex items-center justify-center gap-4">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                          {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                    )}
                    
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1`}>
                        <div className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-lg transition-all duration-300 ${
                          isMine 
                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-tr-none border border-emerald-500/20' 
                            : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-2xl rounded-tl-none group-hover:bg-white/10'
                        }`}>
                          <p className="m-0 font-medium">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <div className="flex items-center gap-1">
                               {msg.is_read ? (
                                 <CheckCheck size={11} className="text-emerald-500" />
                               ) : (
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                               )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>

        {/* ── Transmission Console ── */}
        <footer className="px-4 py-3 bg-slate-950 border-t border-white/5 shrink-0 z-20">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-500 overflow-hidden relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="w-full min-h-[44px] max-h-[120px] py-3 px-4 bg-transparent border-none text-white outline-none text-sm font-medium resize-none custom-scrollbar placeholder:text-slate-600"
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 ${
                (!input.trim() || sending) 
                  ? 'bg-white/5 text-slate-700 border border-white/5' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/30'
              }`}
            >
              {sending ? <div className="loading-spinner h-4 w-4 !border-white/30 !border-t-white" /> : <Send size={18} />}
            </button>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
