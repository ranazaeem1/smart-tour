-- Chat participant names — avoid RLS recursion via security definer helpers

DROP POLICY IF EXISTS "Users can view companies they chat with" ON public.companies;
DROP POLICY IF EXISTS "Company owners can view traveller profiles in chats" ON public.profiles;

CREATE OR REPLACE FUNCTION public.auth_user_owns_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_chats_with_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE user_id = auth.uid() AND company_id = p_company_id
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_company_owner_can_view_profile(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.companies co ON co.id = c.company_id
    WHERE c.user_id = p_profile_id AND co.owner_id = auth.uid()
  );
$$;

CREATE POLICY "Users can view companies they chat with"
  ON public.companies FOR SELECT
  USING (public.auth_user_chats_with_company(id));

CREATE POLICY "Company owners can view traveller profiles in chats"
  ON public.profiles FOR SELECT
  USING (public.auth_company_owner_can_view_profile(id));

-- Conversations policies: replace companies subqueries (caused infinite recursion)
DROP POLICY IF EXISTS "Company owners can view their conversations" ON public.conversations;
CREATE POLICY "Company owners can view their conversations"
  ON public.conversations FOR SELECT
  USING (public.auth_user_owns_company(company_id));

DROP POLICY IF EXISTS "Company owners can create conversations" ON public.conversations;
CREATE POLICY "Company owners can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (public.auth_user_owns_company(company_id));

DROP POLICY IF EXISTS "Users and companies can update conversations" ON public.conversations;
CREATE POLICY "Users and companies can update conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = user_id OR public.auth_user_owns_company(company_id)
  );

DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = auth.uid() OR public.auth_user_owns_company(company_id)
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages"
  ON public.messages FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = auth.uid() OR public.auth_user_owns_company(company_id)
    )
  );

DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;
CREATE POLICY "Participants can update messages"
  ON public.messages FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = auth.uid() OR public.auth_user_owns_company(company_id)
    )
  );
