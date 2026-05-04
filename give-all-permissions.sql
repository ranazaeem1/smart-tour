-- ==============================================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO GIVE ALL PERMISSIONS
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.profiles;
CREATE POLICY "Enable full access for all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.companies;
CREATE POLICY "Enable full access for all" ON public.companies FOR ALL USING (true) WITH CHECK (true);

-- 3. Tours
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.tours;
CREATE POLICY "Enable full access for all" ON public.tours FOR ALL USING (true) WITH CHECK (true);

-- 4. Itinerary Days
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.itinerary_days;
CREATE POLICY "Enable full access for all" ON public.itinerary_days FOR ALL USING (true) WITH CHECK (true);

-- 5. Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.bookings;
CREATE POLICY "Enable full access for all" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- 6. Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.reviews;
CREATE POLICY "Enable full access for all" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 7. Safety Zones
ALTER TABLE public.safety_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.safety_zones;
CREATE POLICY "Enable full access for all" ON public.safety_zones FOR ALL USING (true) WITH CHECK (true);

-- 8. Safety Alerts
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all" ON public.safety_alerts;
CREATE POLICY "Enable full access for all" ON public.safety_alerts FOR ALL USING (true) WITH CHECK (true);

-- Ensure anon and authenticated roles have the base grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
