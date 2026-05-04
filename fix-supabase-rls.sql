-- ==============================================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX "INFINITE RECURSION" ERRORS
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. Drop potentially recursive policies on the profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Re-create the admin policy for profiles using the non-recursive JWT check
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- 2. Drop potentially recursive policies on safety_zones
DROP POLICY IF EXISTS "Admins can manage safety zones" ON public.safety_zones;

CREATE POLICY "Admins can manage safety zones"
  ON public.safety_zones FOR ALL USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- 3. Drop potentially recursive policies on companies
DROP POLICY IF EXISTS "Admins have full access to companies" ON public.companies;

CREATE POLICY "Admins have full access to companies"
  ON public.companies FOR ALL USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- 4. Drop potentially recursive policies on tours
DROP POLICY IF EXISTS "Admins have full access to tours" ON public.tours;

CREATE POLICY "Admins have full access to tours"
  ON public.tours FOR ALL USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- 5. Drop potentially recursive policies on bookings
DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;

CREATE POLICY "Admins have full access to bookings"
  ON public.bookings FOR ALL USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  );

-- 6. Ensure the base user profile policies exist and are not recursive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
