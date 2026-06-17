"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Activity, Building2, ChevronRight, Clock, MessageSquare, Search, User } from "lucide-react";

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
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
  role: "user" | "company";
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
          .from("conversations")
          .select("id, user_id, company_id, last_message, last_message_at")
          .eq(role === "user" ? "user_id" : "company_id", currentUserId)
          .order("last_message_at", { ascending: false });

        if (error) {
          console.error("[Inbox] Query error:", error?.message || error?.code || JSON.stringify(error));
          setLoading(false);
          return;
        }

        if (!convData?.length) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const companyIds = [...new Set(convData.map((c: any) => c.company_id).filter(Boolean))];
        const userIds = [...new Set(convData.map((c: any) => c.user_id).filter(Boolean))];
        const companyNameById = new Map<string, string>();
        const userNameById = new Map<string, string>();

        if (companyIds.length > 0) {
          const { data: companies } = await (supabase as any).from("companies").select("id, name").in("id", companyIds);
          (companies ?? []).forEach((company: { id: string; name: string }) => {
            if (company.name) companyNameById.set(company.id, company.name);
          });
        }

        if (userIds.length > 0) {
          const { data: profiles } = await (supabase as any).from("profiles").select("id, full_name, email").in("id", userIds);
          (profiles ?? []).forEach((profile: { id: string; full_name: string | null; email: string }) => {
            userNameById.set(profile.id, profile.full_name?.trim() || profile.email?.split("@")[0] || "Traveller");
          });
        }

        setConversations(
          convData.map((conv: any) => ({
            id: conv.id,
            user_id: conv.user_id,
            company_id: conv.company_id,
            last_message: conv.last_message || "",
            last_message_at: conv.last_message_at,
            otherName: role === "user" ? companyNameById.get(conv.company_id) || "Company" : userNameById.get(conv.user_id) || "Traveller",
          }))
        );
      } catch (err) {
        console.error("[Inbox] Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();

    const channel = (supabase as any)
      .channel(`inbox-${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [role, currentUserId]);

  const filtered = conversations.filter(conversation => conversation.otherName.toLowerCase().includes(search.toLowerCase()));
  const unreadCount = conversations.filter(conversation => conversation.last_message).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="loading-spinner h-12 w-12" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade space-y-8 pb-20" role="main">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <MessageSquare size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Direct Messages</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Messages</h1>
        </div>

        <div className="relative w-full xl:w-96">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-12 !py-4 !rounded-2xl !bg-white font-black" placeholder={role === "company" ? "Search travellers..." : "Search companies..."} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
          <MessageSquare size={20} className="text-emerald-500" />
          <p className="mt-7 text-3xl font-black text-slate-950">{conversations.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Conversations</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
          <Activity size={20} className="text-slate-900" />
          <p className="mt-7 text-3xl font-black text-slate-950">{unreadCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Threads</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl transition-all">
          <Clock size={20} className="text-amber-500" />
          <p className="mt-7 text-3xl font-black text-slate-950">{conversations[0]?.last_message_at ? formatRelativeTime(new Date(conversations[0].last_message_at)) : "-"}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latest Activity</p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <MessageSquare size={42} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-950">No messages yet</h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">{role === "company" ? "Traveller conversations will appear here." : "Start a chat from a tour booking."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(conversation => (
              <Link key={conversation.id} href={`/${role}/chat/${conversation.id}?name=${encodeURIComponent(conversation.otherName)}`} className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl transition-all flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                  {role === "user" ? <Building2 size={20} /> : <User size={20} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <h3 className="text-base font-black text-slate-950 truncate group-hover:text-emerald-600 transition-colors">{conversation.otherName}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Clock size={11} className="text-emerald-500" />
                      {formatRelativeTime(new Date(conversation.last_message_at))}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500 truncate">{conversation.last_message || "No messages yet"}</p>
                </div>

                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
