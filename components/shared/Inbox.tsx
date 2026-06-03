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
  Activity
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
  otherName: string;
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
        const { data: convData, error } = await (supabase as any)
          .from('conversations')
          .select('id, user_id, company_id, last_message, last_message_at')
          .eq(role === 'user' ? 'user_id' : 'company_id', currentUserId)
          .order('last_message_at', { ascending: false });

        if (error) {
          console.error("[Inbox] Query error:", error?.message || error?.code || JSON.stringify(error));
          setLoading(false);
          return;
        }

        if (!convData || convData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const companyIds = [...new Set(convData.map((c: any) => c.company_id).filter(Boolean))];
        const userIds = [...new Set(convData.map((c: any) => c.user_id).filter(Boolean))];

        const companyNameById = new Map<string, string>();
        const userNameById = new Map<string, string>();

        if (companyIds.length > 0) {
          const { data: companies } = await (supabase as any)
            .from('companies')
            .select('id, name')
            .in('id', companyIds);
          (companies ?? []).forEach((c: { id: string; name: string }) => {
            if (c.name) companyNameById.set(c.id, c.name);
          });
        }

        if (userIds.length > 0) {
          const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          (profiles ?? []).forEach((p: { id: string; full_name: string | null; email: string }) => {
            const label = p.full_name?.trim() || p.email?.split('@')[0] || 'Traveller';
            userNameById.set(p.id, label);
          });
        }

        const enriched: Conversation[] = convData.map((conv: any) => {
          const otherName =
            role === 'user'
              ? companyNameById.get(conv.company_id) || 'Company'
              : userNameById.get(conv.user_id) || 'Traveller';

          return {
            id: conv.id,
            user_id: conv.user_id,
            company_id: conv.company_id,
            last_message: conv.last_message || '',
            last_message_at: conv.last_message_at,
            otherName,
          };
        });

        setConversations(enriched);
      } catch (err) {
        console.error("[Inbox] Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();

    const channel = (supabase as any)
      .channel(`inbox-${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [role, currentUserId]);

  const filtered = conversations.filter(c =>
    c.otherName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="loading-spinner h-12 w-12" />
      <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px]">
        Loading messages...
      </p>
    </div>
  );

  return (
    <div className="animate-fade space-y-10 pb-20" role="main">

      {/* Header */}
      <section className="panel-hero rounded-[var(--radius-xl)] p-8 md:p-12 relative overflow-hidden border shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563906417-45a11b3f9f7c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="text-center md:text-left">
            <div className="panel-hero-kicker panel-hero-kicker-slate inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-4 border">
              <Activity size={12} className="panel-hero-kicker-icon" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Messages</span>
            </div>
            <h1 className="panel-hero-title text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-3">
              Direct Messages
            </h1>
            <p className="panel-hero-subtitle text-sm md:text-base font-medium">
              {role === 'company' ? 'Chat with your travellers.' : 'Chat with tour companies.'}
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 panel-hero-search-icon group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder={role === 'company' ? "Search travellers..." : "Search companies..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="panel-hero-search w-full rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Conversation List */}
      <div className="card-premium !p-0 overflow-hidden border border-[var(--border)] shadow-2xl">
        {filtered.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-[var(--muted)] rounded-[40px] flex items-center justify-center text-[var(--muted-foreground)] mb-8 shadow-inner border border-[var(--border)] opacity-50">
              <MessageSquare size={44} />
            </div>
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight">
              No Messages Yet
            </h3>
            <p className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px] max-w-[240px] mx-auto leading-loose">
              {role === 'company' ? 'No travellers have messaged you yet.' : 'Start a chat from a tour booking.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((conv) => (
              <Link
                key={conv.id}
                href={`/${role}/chat/${conv.id}?name=${encodeURIComponent(conv.otherName)}`}
                className="flex items-center gap-5 p-5 transition-all duration-300 hover:bg-[var(--muted)] group relative"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-900 text-slate-400 border border-white/5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
                  {role === 'user' ? <Building2 size={20} /> : <User size={20} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-base font-bold text-[var(--foreground)] truncate group-hover:text-emerald-400 transition-colors">
                      {conv.otherName}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1 shrink-0 ml-3">
                      <Clock size={10} className="text-emerald-500" />
                      {formatRelativeTime(new Date(conv.last_message_at))}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] truncate">
                    {conv.last_message || "No messages yet"}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={12} className="text-emerald-500" />
          End-to-End Encrypted
        </p>
      </div>
    </div>
  );
}
