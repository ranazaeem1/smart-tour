-- ================================================================================
-- SmartTour — Complete Database Schema & RLS Policies
-- Run these in order in your Supabase SQL Editor
-- ================================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================================
-- 2. COMPANIES TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  phone       TEXT,
  email       TEXT,
  logo_url    TEXT,
  website     TEXT,
  status      TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','suspended')),
  is_verified BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 3. PROFILES TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT 'Traveler',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'company', 'admin')),
  company_id  UUID REFERENCES companies(id),
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 4. TOURS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS tours (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  destination      TEXT NOT NULL DEFAULT '',
  region           TEXT NOT NULL DEFAULT '',
  price            DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration         INT NOT NULL DEFAULT 1,
  category         TEXT DEFAULT 'Adventure',
  tags             TEXT[] DEFAULT '{}',
  max_group        INT DEFAULT 20,
  difficulty       TEXT DEFAULT 'Moderate',
  highlights       TEXT[] DEFAULT '{}',
  included         TEXT[] DEFAULT '{}',
  image_url        TEXT,
  rating           DECIMAL(3,2) DEFAULT 4.5,
  review_count     INT DEFAULT 0,
  safety_score     INT DEFAULT 80,
  featured         BOOLEAN DEFAULT false,
  available        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 5. BOOKINGS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id          UUID NOT NULL REFERENCES tours(id),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  company_id       UUID NOT NULL REFERENCES companies(id),
  group_size       INT NOT NULL DEFAULT 1,
  total_price      DECIMAL(10,2),
  travel_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','completed','cancelled')),
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','refunded')),
  confirmed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 6. REVIEWS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     UUID REFERENCES tours(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  sentiment   TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 7. SOS ALERTS TABLE
-- ================================================================================
CREATE TABLE IF NOT EXISTS sos_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  company_id  UUID REFERENCES companies(id),
  tour_id     UUID REFERENCES tours(id),
  latitude    DECIMAL(10,8),
  longitude   DECIMAL(11,8),
  message     TEXT DEFAULT 'Emergency! Please help!',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','false_alarm')),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- 8. ROW LEVEL SECURITY — Enable on all tables
-- ================================================================================
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- ── Drop old policies if re-running ──
DROP POLICY IF EXISTS "Users view own profile"         ON profiles;
DROP POLICY IF EXISTS "Users update own profile"       ON profiles;
DROP POLICY IF EXISTS "Create own profile"             ON profiles;
DROP POLICY IF EXISTS "Company owner full access"      ON companies;
DROP POLICY IF EXISTS "Public view active companies"   ON companies;
DROP POLICY IF EXISTS "Company owns tours"             ON tours;
DROP POLICY IF EXISTS "Public view active tours"       ON tours;
DROP POLICY IF EXISTS "Users see own bookings"         ON bookings;
DROP POLICY IF EXISTS "Users create bookings"          ON bookings;
DROP POLICY IF EXISTS "Companies see their bookings"   ON bookings;
DROP POLICY IF EXISTS "Companies update bookings"      ON bookings;
DROP POLICY IF EXISTS "Users view reviews"             ON reviews;
DROP POLICY IF EXISTS "Users create reviews"           ON reviews;
DROP POLICY IF EXISTS "Users create SOS"               ON sos_alerts;
DROP POLICY IF EXISTS "Users see own SOS"              ON sos_alerts;
DROP POLICY IF EXISTS "Companies see SOS"              ON sos_alerts;

-- ── PROFILES ──
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Create own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── COMPANIES ──
CREATE POLICY "Company owner full access"
  ON companies FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public view active companies"
  ON companies FOR SELECT USING (is_active = true);

-- ── TOURS ──
CREATE POLICY "Company owns tours"
  ON tours FOR ALL
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Public view active tours"
  ON tours FOR SELECT USING (available = true);

-- ── BOOKINGS ──
CREATE POLICY "Users see own bookings"
  ON bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Companies see their bookings"
  ON bookings FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

CREATE POLICY "Companies update bookings"
  ON bookings FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- ── REVIEWS ──
CREATE POLICY "Users view reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── SOS ALERTS ──
CREATE POLICY "Users create SOS"
  ON sos_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own SOS"
  ON sos_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Companies see SOS"
  ON sos_alerts FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- ================================================================================
-- 9. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ================================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Traveler'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================================
-- Done! Run this entire script once in Supabase SQL Editor.
-- ================================================================================
