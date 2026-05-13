"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Send, 
  X, 
  ChevronLeft, 
  CheckCheck, 
  Clock, 
  Paperclip, 
  Smile, 
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

  return (
    <div className={`flex flex-col h-full animate-fade ${!isPage ? 'fixed inset-0 z-[1000] items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 md:p-10' : ''}`}>
      <div className={`flex flex-col bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden relative ${
        isPage ? 'flex-1' : 'w-full max-w-[900px] h-full rounded-[var(--radius-xl)]'
      }`}>
        
        {/* ── Chat Header ── */}
        <header className="px-8 py-6 bg-slate-950 border-b border-white/5 flex items-center justify-between z-20 shrink-0 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-6">
            {isPage && (
              <button 
                onClick={() => window.history.back()}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <div className="relative">
              <div className="w-12 h-12 rounded-[18px] bg-emerald-500 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-emerald-500/20">
                {currentRole === 'user' ? <Building2 size={24} /> : <User size={24} />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full animate-pulse" />
            </div>
            
            <div className="min-w-0">
              <h3 className="text-xl font-black text-white truncate m-0 leading-tight tracking-tight uppercase tracking-widest text-xs opacity-50 mb-1">Active Signal</h3>
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-white truncate">{otherPartyName}</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                   <ShieldCheck size={10} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="hidden md:flex w-10 h-10 items-center justify-center bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5">
                <MoreVertical size={20} />
             </button>
            {!isPage && (
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-rose-500/10 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {/* ── Message Grid ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative bg-[#020617]">
          {/* subtle grid background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 relative z-10">
              <div className="loading-spinner h-10 w-10 !border-white/10 !border-t-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Syncing Relay...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full relative z-10">
               <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                <Activity size={40} className="text-emerald-500 opacity-50" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest text-center">Protocol Initialized</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em] text-center">Awaiting initial transmission from node.</p>
            </div>
          ) : (
            <div className="relative z-10 space-y-10">
              {messages.map((msg, idx) => {
                const isMine = msg.sender_role === currentRole;
                const showTime = idx === 0 || new Date(messages[idx-1].created_at).getTime() < new Date(msg.created_at).getTime() - 1800000; // 30 mins
                
                return (
                  <div key={msg.id} className="space-y-4">
                    {showTime && (
                      <div className="flex items-center justify-center gap-6">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] bg-slate-900 px-4 py-1.5 rounded-full border border-white/5">
                          {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                    )}
                    
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-2`}>
                        <div className={`relative px-6 py-4 text-sm leading-loose shadow-2xl transition-all duration-300 ${
                          isMine 
                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-[24px] rounded-tr-none border border-emerald-500/20' 
                            : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-[24px] rounded-tl-none group-hover:bg-white/10'
                        }`}>
                          <p className="m-0 font-medium">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-3 px-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <div className="flex items-center gap-1">
                               {msg.is_read ? (
                                 <CheckCheck size={12} className="text-emerald-500" />
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
              <div ref={bottomRef} className="h-10" />
            </div>
          )}
        </div>

        {/* ── Transmission Console ── */}
        <footer className="px-8 py-8 bg-slate-950 border-t border-white/5 shrink-0 z-20">
          <div className="flex gap-4 items-end max-w-4xl mx-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[24px] focus-within:border-emerald-500/50 focus-within:ring-8 focus-within:ring-emerald-500/5 transition-all duration-500 overflow-hidden relative">
              <div className="absolute left-4 top-4 text-slate-600">
                 <Paperclip size={18} />
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Compose secure message..."
                className="w-full min-h-[56px] max-h-[200px] py-4 pl-12 pr-12 bg-transparent border-none text-white outline-none text-sm font-medium resize-none custom-scrollbar placeholder:text-slate-700 placeholder:uppercase placeholder:text-[10px] placeholder:font-black placeholder:tracking-widest"
              />
              <div className="absolute right-4 bottom-4 text-slate-600 hover:text-emerald-500 cursor-pointer transition-colors">
                 <Smile size={18} />
              </div>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 ${
                (!input.trim() || sending) 
                  ? 'bg-white/5 text-slate-700 border border-white/5' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/30 ring-4 ring-emerald-500/10'
              }`}
            >
              {sending ? <div className="loading-spinner h-5 w-5 !border-white/30 !border-t-white" /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </button>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Node Connection Stability: Optimized</p>
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
