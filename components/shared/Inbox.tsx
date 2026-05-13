"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  User, 
  Building2, 
  ChevronRight, 
  MoreVertical,
  Activity,
  ArrowLeft
} from "lucide-react";

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface Conversation {
  id: string;
  user_id: string;
  company_id: string;
  last_message: string;
  last_message_at: string;
  unread_user: number;
  unread_company: number;
  profiles?: { full_name: string; avatar_url: string };
  companies?: { name: string; logo: string };
}

interface InboxProps {
  role: 'user' | 'company';
  currentUserId: string;
}

export function Inbox({ role, currentUserId }: InboxProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadConversations() {
      try {
        const query = supabase
          .from('conversations')
          .select('*, profiles(full_name, avatar_url), companies(name, logo)')
          .order('last_message_at', { ascending: false });

        if (role === 'user') {
          query.eq('user_id', currentUserId);
        } else {
          query.eq('company_id', currentUserId);
        }

        const { data, error } = await query;
        if (!error) setConversations(data as any[]);
      } catch (err) {
        console.error("[Inbox] Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();

    const channel = supabase
      .channel('inbox-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [role, currentUserId]);

  const filtered = conversations.filter(c => {
    const name = role === 'user' ? (c.companies?.name || '') : (c.profiles?.full_name || '');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">Syncing Communication Relays...</p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">
      {/* ── Inbox Hero Header ── */}
      <section className="bg-slate-950 rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563906417-45a11b3f9f7c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 rounded-full mb-4 border border-slate-500/20">
              <Activity size={12} className="text-slate-400" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Signal Hub</span>
            </div>
            <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Direct Messages
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">Coordinate your expeditions through our encrypted relay network.</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </section>

      {/* ── Inbox Ledger ── */}
      <div className="card-premium !p-0 overflow-hidden border border-[var(--border)] shadow-2xl">
        {filtered.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-[var(--muted)] rounded-[40px] flex items-center justify-center text-[var(--muted-foreground)] mb-8 shadow-inner border border-[var(--border)] opacity-50">
              <MessageSquare size={44} />
            </div>
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight">Zero Signals Detected</h3>
            <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px] max-w-[240px] mx-auto leading-loose">
              Initiate a transmission from your expedition ledger to begin coordination.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((conv) => {
              const otherPartyName = role === 'user' ? (conv.companies?.name || 'Tour Company') : (conv.profiles?.full_name || 'Traveler');
              const unreadCount = role === 'user' ? conv.unread_user : conv.unread_company;
              const avatarChar = otherPartyName?.[0]?.toUpperCase() || "?";
              
              return (
                <Link 
                  key={conv.id} 
                  href={`/${role}/chat/${conv.id}?name=${encodeURIComponent(otherPartyName)}`}
                  className={`flex items-center gap-6 p-8 transition-all duration-500 hover:bg-[var(--muted)] group relative ${
                    unreadCount > 0 ? "bg-emerald-500/[0.03]" : ""
                  }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${unreadCount > 0 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-y-100" : "bg-transparent scale-y-0"}`} />

                  {/* Avatar Matrix */}
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl font-black transition-all duration-500 group-hover:scale-110 shadow-xl border ${
                    unreadCount > 0 
                      ? "bg-emerald-500 text-white border-emerald-400" 
                      : "bg-slate-900 text-slate-400 border-white/5"
                  }`}>
                    {role === 'user' ? <Building2 size={24} /> : <User size={24} />}
                  </div>
                  
                  {/* Transmission Intelligence */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-lg tracking-tight transition-colors duration-300 ${
                        unreadCount > 0 ? "text-[var(--foreground)] font-black" : "text-[var(--muted-foreground)] font-bold group-hover:text-[var(--foreground)]"
                      }`}>
                        {otherPartyName}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-emerald-500" />
                          {formatRelativeTime(new Date(conv.last_message_at))}
                        </span>
                        <MoreVertical size={16} className="text-[var(--border)] group-hover:text-[var(--muted-foreground)] transition-colors" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center gap-6">
                      <p className={`text-sm truncate max-w-[80%] ${
                        unreadCount > 0 ? "text-[var(--foreground)] font-bold italic" : "text-[var(--muted-foreground)] font-medium"
                      }`}>
                        {conv.last_message || "Awaiting initial signal..."}
                      </p>
                      
                      {unreadCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg shadow-emerald-500/20 animate-pulse uppercase tracking-widest">
                            {unreadCount} New
                          </span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Directional Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 pr-2">
                    <ChevronRight size={24} className="text-emerald-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* ── Signals Sync Footer ── */}
      <div className="flex items-center justify-center gap-6 pt-10 opacity-30 grayscale hover:grayscale-0 transition-all">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} className="text-emerald-500" />
          End-to-End Encryption Protocol Active
        </p>
        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Relay v2.4</p>
      </div>
    </div>
  );
}
