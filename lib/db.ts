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
import { TOURS, BOOKINGS, REVIEWS, COMPANIES, SAFETY_ZONES, MONTHLY_REVENUE } from './data';

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
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isLockError = err.message?.includes('Lock broken') || err.name === 'AbortError';
    if (isLockError && retries > 0) {
      console.warn(`[db] Transient lock error detected. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw err;
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

export async function upsertProfile(profile: {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: 'user' | 'company' | 'admin';
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('profiles') as any)
    .upsert(
      { ...profile, updated_at: new Date().toISOString() },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .maybeSingle();

  if (error) {
    // If upsert fails (likely RLS on insert for existing user), try plain update
    const { data: updated, error: updateError } = await (supabase.from('profiles') as any)
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .maybeSingle();

    if (updateError) {
      // Only log if the update also fails (real error)
      console.warn('[upsertProfile] Profile update skipped/failed:', updateError.message);
      return null;
    }
    return updated;
  }

  return data;
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
}) {
  return withRetry(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('tours')
      .select(`*, companies(name, logo, rating)`)
      .order('rating', { ascending: false });

    // Only filter by availability for public/featured listings
    if (!options?.companyId) {
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
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('status')
    .eq('id', tour.company_id)
    .maybeSingle();

  if (companyError || !company || company.status !== 'approved') {
    console.error('[createTour] Unauthorized: Company not approved', company?.status);
    return null;
  }

  // 2. Proceed with insertion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('tours') as any).insert(tour).select().single();
  if (error) { console.error('[createTour]', error.message); return null; }
  return data;
}

export async function updateTour(id: string, updates: Partial<{
  title: string; price: number; available: boolean; featured: boolean;
  safety_score: number; tags: string[]; image_url: string;
}>) {
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
      console.error('[fetchBookings]', error.message);
      return [];
    }
    return data ?? [];
  });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('bookings') as any)
    .insert({ ...booking, status: 'pending', payment_status: 'pending' })
    .select()
    .single();
  if (error) { console.error('[createBooking]', error.message); return null; }
  return data;
}

export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('bookings') as any)
    .update({ status })
    .eq('id', id)
    .select()
    .single();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('companies') as any)
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('[updateCompanyStatus]', error.message); return null; }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function fetchRevenueStats(companyId?: string) {
  let query = supabase
    .from('bookings')
    .select('total_price, created_at');

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data: bookings, error } = await query;

  if (error || !bookings || bookings.length === 0) return [];

  // Aggregate by month
  const monthly: Record<string, { month: string; revenue: number; bookings: number }> = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bookings as any[]).forEach((b: any) => {
    const d = new Date(b.created_at);
    const key = months[d.getMonth()];
    if (!monthly[key]) monthly[key] = { month: key, revenue: 0, bookings: 0 };
    monthly[key].revenue += b.total_price || 0;
    monthly[key].bookings += 1;
  });

  return months.map(m => monthly[m] || { month: m, revenue: 0, bookings: 0 });
}

export async function fetchPlatformStats() {
  const [usersRes, companiesRes, toursRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('tours').select('id', { count: 'exact', head: true }).eq('available', true),
    supabase.from('bookings').select('total_price'),
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

