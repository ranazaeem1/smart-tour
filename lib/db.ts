/**
 * @file db.ts
 * @description Smart Tour — Supabase Data Layer.
 * Contains all primary data fetching, mutation, and business logic functions interacting with Supabase.
 * @author Smart Tour Team
 * @dependencies @/lib/supabase, @/lib/data
 */

// ==========================================
// Imports
// ==========================================

import { supabase } from './supabase';
import { getDefaultTourImage } from './tourImages';

// ==========================================
// Resilient Fetch Helper
// ==========================================

/**
 * A robust wrapper for Supabase queries that implements automatic retries 
 * for transient errors, specifically handling the "Lock broken" AbortError 
 * often encountered during parallel auth session refreshes.
 * 
 * @param {() => Promise<T>} fn - The database operation to execute
 * @param {number} retries - Maximum number of retry attempts
 * @param {number} delay - Initial delay between retries in ms
 * @returns {Promise<T>} The result of the operation
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // If it's a "lock stolen" error, wait a bit and retry as it's transient
    const isLockError = error?.message?.includes("lock") || error?.message?.includes("stole") || error.message?.includes('Lock broken') || error.name === 'AbortError';
    
    if (retries > 0) {
      if (isLockError) {
        console.warn(`[Retry] Auth lock contention detected, retrying in ${delay}ms... (${retries} attempts left)`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ---- Profiles ----

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[fetchProfile] Error fetching profile:', error.message);
    return null;
  }
  return data;
}

export async function upsertProfile({
  id,
  email,
  full_name,
  phone,
  role,
}: {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
}) {
  const { error } = await (supabase.from('profiles') as any)
    .upsert({
      id,
      email,
      full_name: full_name || '',
      phone: phone || '',
      role: role || 'user',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) console.error('upsertProfile error:', error);
  return { error };
}



export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[fetchAllUsers]', error.message);
    return [];
  }
  return data ?? [];
}

// ---- Tours ----

export async function fetchTours(options?: {
  featured?: boolean;
  companyId?: string;
  category?: string;
  search?: string;
  destination?: string;
  maxPrice?: number;
  admin?: boolean;
}) {
  return withRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('tours')
      .select(`*, companies(name, logo, rating)`)
      .order('rating', { ascending: false });

    // Only filter by availability for public/featured listings
    if (!options?.companyId && !options?.admin) {
      query = query.eq('available', true);
    }

    if (options?.featured) query = query.eq('featured', true);
    if (options?.companyId) query = query.eq('company_id', options.companyId);
    if (options?.category) query = query.eq('category', options.category);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);
    if (options?.destination) query = query.ilike('destination', `%${options.destination}%`);
    if (options?.maxPrice) query = query.lte('price', options.maxPrice);

    const { data, error } = await query;
    if (error) {
      console.error('[fetchTours]', error.message);
      return [];
    }
    return data ?? [];
  });
}

export async function fetchTourById(id: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('tours')
      .select(`*, companies(name, logo, rating, city, email, phone)`)
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[fetchTourById] Error fetching tour:', error.message);
      return null;
    }
    return data;
  });
}

export async function createTour(tour: {
  company_id: string;
  title: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  category: string;
  tags?: string[];
  max_group?: number;
  difficulty?: string;
  highlights?: string[];
  included?: string[];
  image_url?: string;
}) {
  // 1. Verify company is approved before allowing tour creation
  const { data: company, error: companyError } = await (supabase
    .from('companies') as any)
    .select('status')
    .eq('id', tour.company_id)
    .maybeSingle();

  if (companyError || !company || company.status !== 'approved') {
    console.error('[createTour] Unauthorized: Company not approved', company?.status);
    return null;
  }

  // 2. Proceed with insertion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('tours') as any)
    .insert({ ...tour, image_url: tour.image_url || getDefaultTourImage(tour.destination, tour.title) })
    .select()
    .single();
  if (error) { console.error('[createTour]', error.message); return null; }
  return data;
}

export async function updateTour(id: string, updates: Partial<{
  title: string; price: number; available: boolean; featured: boolean;
  safety_score: number; tags: string[]; image_url: string;
}>) {
  if (updates.available === true) {
    const { data: tour, error: tourError } = await (supabase.from('tours') as any)
      .select('company_id, companies(status)')
      .eq('id', id)
      .maybeSingle();

    const companyStatus = Array.isArray(tour?.companies) ? tour.companies[0]?.status : tour?.companies?.status;
    if (tourError || companyStatus !== 'approved') {
      console.error('[updateTour] Unauthorized: Company not approved', companyStatus);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('tours') as any).update(updates).eq('id', id).select().single();
  if (error) { console.error('[updateTour]', error.message); return null; }
  return data;
}

// ---- Bookings ----

export async function fetchBookings(options?: {
  userId?: string;
  companyId?: string;
  status?: string;
}) {
  return withRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('bookings')
      .select(`*, tours(title, destination, image_url, company_id), profiles(full_name, email, phone)`)
      .order('created_at', { ascending: false });

    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.companyId) query = query.eq('company_id', options.companyId);
    if (options?.status) query = query.eq('status', options.status);

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data ?? [];
  });
}

export async function fetchBookingsByUser(userId: string) {
  return fetchBookings({ userId });
}

export async function createBooking(booking: {
  tour_id: string;
  user_id: string;
  company_id: string;
  group_size: number;
  total_price: number;
  travel_date: string;
  notes?: string;
}) {
  const { data, error } = await (supabase.from('bookings') as any)
    .insert({ ...booking, status: 'pending', payment_status: 'pending' })
    .select()
    .single();
  if (error) { console.error('[createBooking]', error.message); return null; }
  return data;
}

export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  let query: any = (supabase.from('bookings') as any)
    .update({ status })
    .eq('id', id);

  if (status === 'confirmed') query = query.eq('status', 'pending');
  if (status === 'cancelled') query = query.in('status', ['pending', 'confirmed']);
  if (status === 'completed') query = query.eq('status', 'confirmed');

  const { data, error } = await query.select().maybeSingle();
  if (error) { console.error('[updateBookingStatus]', error.message); return null; }
  return data;
}

// ---- Reviews ----

export async function fetchReviews(options?: {
  tourId?: string;
  userId?: string;
  companyId?: string;
}) {
  return withRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('reviews')
      .select(`*, tours!inner(title, destination, company_id), profiles(full_name, avatar_url)`)
      .order('created_at', { ascending: false });

    if (options?.tourId) query = query.eq('tour_id', options.tourId);
    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.companyId) query = query.eq('tours.company_id', options.companyId);

    const { data, error } = await query;
    if (error) {
      console.error('[fetchReviews]', error.message);
      return [];
    }
    return data ?? [];
  });
}

export async function createReview(review: {
  tour_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('reviews') as any).insert(review).select().single();
  if (error) { console.error('[createReview]', error.message); return null; }
  return data;
}

export async function deleteReview(id: string, userId: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id).eq('user_id', userId);
  if (error) { console.error('[deleteReview]', error.message); return false; }
  return true;
}

// ---- Companies ----

export async function fetchCompanies(status?: 'pending' | 'approved' | 'suspended' | 'rejected') {
  return withRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) {
      console.error('[fetchCompanies]', error.message);
      return [];
    }
    return data ?? [];
  });
}

export async function fetchCompanyByOwner(ownerId: string): Promise<{ id: string; name: string; owner_id: string;[key: string]: unknown } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('companies') as any)
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) {
    console.error('[fetchCompanyByOwner] Error fetching company:', error.message);
    return null;
  }
  return data;
}

export async function updateCompanyStatus(id: string, status: 'pending' | 'approved' | 'suspended' | 'rejected') {
  const { data, error } = await (supabase.from('companies') as any)
    .update({ status, verified: status === 'approved' })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('[updateCompanyStatus]', error.message); return null; }

  if (data?.owner_id) {
    const role = status === 'approved' ? 'company' : 'user';
    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({ role })
      .eq('id', data.owner_id);
    if (profileError) console.error('[updateCompanyStatus:profile]', profileError.message);
  }

  if (status !== 'approved') {
    const { error: toursError } = await (supabase.from('tours') as any)
      .update({ available: false, featured: false })
      .eq('company_id', id);
    if (toursError) console.error('[updateCompanyStatus:tours]', toursError.message);
  }

  return data;
}

// ---- Safety ----

export async function fetchSafetyZones() {
  const { data, error } = await supabase
    .from('safety_zones')
    .select('*')
    .order('score', { ascending: false });
  if (error) {
    console.error('[fetchSafetyZones]', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchSafetyAlerts(activeOnly = true) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from('safety_alerts').select('*').order('created_at', { ascending: false });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) { console.error('[fetchSafetyAlerts]', error.message); return []; }
  return data ?? [];
}

export async function createSafetyAlert(alert: {
  area: string; type: string;
  severity: 'low' | 'medium' | 'high'; description: string;
}) {
  const { data, error } = await (supabase.from('safety_alerts') as any)
    .insert({ ...alert, active: true })
    .select()
    .single();
  if (error) { console.error('[createSafetyAlert]', error.message); return null; }
  return data;
}

export async function dismissSafetyAlert(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('safety_alerts') as any).update({ active: false }).eq('id', id);
  if (error) { console.error('[dismissSafetyAlert]', error.message); return false; }
  return true;
}

// ---- Analytics / Revenue ----

export type MonthlyRevenueStat = { month: string; revenue: number; bookings: number };

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function isRevenueBooking(booking: { status?: string | null }) {
  return booking.status === 'confirmed' || booking.status === 'completed';
}

export function buildMonthlyRevenueStats(bookings: Array<{
  total_price?: number | string | null;
  travel_date?: string | null;
  created_at?: string | null;
  status?: string | null;
}>): MonthlyRevenueStat[] {
  const monthly: Record<string, MonthlyRevenueStat> = {};

  bookings.forEach((booking) => {
    if (booking.status && !isRevenueBooking(booking)) return;

    const rawDate = booking.travel_date || booking.created_at;
    if (!rawDate) return;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return;

    const month = MONTH_LABELS[date.getMonth()];
    if (!monthly[month]) monthly[month] = { month, revenue: 0, bookings: 0 };

    monthly[month].revenue += Number(booking.total_price || 0);
    monthly[month].bookings += 1;
  });

  return MONTH_LABELS.map(month => monthly[month] || { month, revenue: 0, bookings: 0 });
}

export async function fetchRevenueStats(companyId?: string) {
  try {
    const bookings = await fetchBookings(companyId ? { companyId } : undefined);
    return buildMonthlyRevenueStats(bookings as Array<{
      total_price?: number | string | null;
      travel_date?: string | null;
      created_at?: string | null;
      status?: string | null;
    }>);
  } catch (err) {
    console.error('[fetchRevenueStats]', err);
  }

  let query = supabase
    .from('bookings')
    .select('total_price, travel_date, created_at, status')
    .in('status', ['confirmed', 'completed']);

  if (companyId) query = query.eq('company_id', companyId);

  const { data: bookings, error } = await query;
  if (error) {
    console.error('[fetchRevenueStats:fallback]', error.message);
    return buildMonthlyRevenueStats([]);
  }

  return buildMonthlyRevenueStats((bookings || []) as Array<{
    total_price?: number | string | null;
    travel_date?: string | null;
    created_at?: string | null;
    status?: string | null;
  }>);
}

export async function fetchPlatformStats() {
  const [usersRes, companiesRes, toursRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('tours').select('id', { count: 'exact', head: true }).eq('available', true),
    supabase.from('bookings').select('total_price, status').in('status', ['confirmed', 'completed']),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRevenue = ((bookingsRes.data || []) as any[]).reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);

  return {
    totalUsers: usersRes.count ?? 0,
    totalCompanies: companiesRes.count ?? 0,
    activeTours: toursRes.count ?? 0,
    platformRevenue: totalRevenue,
  };
}

// ---- User Expenses & Budget ----

export async function fetchUserExpenses(userId: string) {
  const { data, error } = await supabase
    .from('user_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchUserExpenses] Error:', error.message);
    return [];
  }
  return data || [];
}

export async function createUserExpense(expense: {
  user_id: string;
  category: string;
  amount: number;
  description: string;
}) {
  const { data, error } = await (supabase.from('user_expenses') as any)
    .insert({ ...expense, created_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.error('[createUserExpense] Error:', error.message);
    return null;
  }
  return data;
}

export async function updateUserExpense(id: string, userId: string, updates: Partial<{
  category: string;
  amount: number;
  description: string;
}>) {
  const { data, error } = await (supabase.from('user_expenses') as any)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[updateUserExpense] Error:', error.message);
    return null;
  }
  return data;
}

export async function deleteUserExpense(id: string, userId: string) {
  const { error } = await supabase
    .from('user_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[deleteUserExpense] Error:', error.message);
    return false;
  }
  return true;
}

export async function updateProfileBudget(userId: string, budget: number) {
  const { error } = await (supabase.from('profiles') as any)
    .update({ total_budget: budget })
    .eq('id', userId);

  if (error) {
    console.error('[updateProfileBudget] Error:', error.message);
    return false;
  }
  return true;
}
