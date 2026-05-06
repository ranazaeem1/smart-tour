-- ============================================================
-- Smart Tour Platform — Chat System Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/auvugzgnorizyxwchper/sql
-- ============================================================

-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  last_message text,
  last_message_at timestamptz default now(),
  user_unread integer not null default 0,
  company_unread integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.conversations enable row level security;

-- Policies for conversations
create policy "Users can view their conversations"
  on public.conversations for select using (auth.uid() = user_id);

create policy "Users can create conversations"
  on public.conversations for insert with check (auth.uid() = user_id);

create policy "Company owners can view their conversations"
  on public.conversations for select using (
    company_id in (select id from public.companies where owner_id = auth.uid())
  );

create policy "Company owners can create conversations"
  on public.conversations for insert with check (
    company_id in (select id from public.companies where owner_id = auth.uid())
  );

create policy "Users and companies can update conversations"
  on public.conversations for update using (
    auth.uid() = user_id or company_id in (select id from public.companies where owner_id = auth.uid())
  );

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role text not null check (sender_role in ('user', 'company')),
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for messages
create policy "Participants can view messages"
  on public.messages for select using (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid() or company_id in (select id from public.companies where owner_id = auth.uid())
    )
  );

create policy "Participants can insert messages"
  on public.messages for insert with check (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid() or company_id in (select id from public.companies where owner_id = auth.uid())
    )
  );

create policy "Participants can update messages"
  on public.messages for update using (
    conversation_id in (
      select id from public.conversations 
      where user_id = auth.uid() or company_id in (select id from public.companies where owner_id = auth.uid())
    )
  );

-- Helper function to safely increment unread counts
create or replace function increment(row_id uuid)
returns void as $$
begin
  -- Note: ChatWindow.tsx uses dynamic column updates for unread counts so we don't strictly need a custom function 
  -- if they use supabase.rpc('increment'), but let's provide a generic implementation if it was called that way.
  -- Alternatively, ChatWindow uses:
  --   [`${currentRole === 'user' ? 'company' : 'user'}_unread`]: supabase.rpc('increment', { row_id: conversationId })
  -- Actually, Supabase RPC returns data, it doesn't do dynamic column incrementing this way natively unless we define it.
  -- Let's define the RPC function:
  update public.conversations 
  set company_unread = company_unread + 1
  where id = row_id;
end;
$$ language plpgsql;

-- Better implementation for incrementing specific role's unread count
create or replace function increment_unread(conversation_id uuid, role text)
returns void as $$
begin
  if role = 'user' then
    update public.conversations set user_unread = user_unread + 1 where id = conversation_id;
  elsif role = 'company' then
    update public.conversations set company_unread = company_unread + 1 where id = conversation_id;
  end if;
end;
$$ language plpgsql;
