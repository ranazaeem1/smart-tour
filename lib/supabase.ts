/**
 * @file supabase.ts
 * @description Supabase client initialization and authentication helper functions.
 * Sets up a singleton client instance for use across the application.
 * @author Smart Tour Team
 * @dependencies @supabase/supabase-js, ./database.types
 */

// ==========================================
// Imports
// ==========================================
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// ==========================================
// Environment & Configuration
// ==========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Warn developers if environment variables are missing (helpful for local setup)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars not set. Check your .env.local file.');
}

// Fallbacks to prevent application crash during build time or missing envs
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder';

// ==========================================
// Supabase Client Initialization
// ==========================================

/**
 * Singleton Supabase client instance for browser/client components.
 * Configured to automatically persist and refresh sessions.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient<Database>(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Useful for OAuth callbacks and password resets
  },
});

// ==========================================
// Authentication Helpers
// ==========================================

/**
 * Registers a new user with email and password.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's chosen password
 * @param {object} metadata - Additional user data (e.g., full_name, role)
 * @returns {Promise<import('@supabase/supabase-js').AuthResponse>}
 */
export const signUp = async (email: string, password: string, metadata: object) => {
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
};

/**
 * Signs in an existing user with email and password.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<import('@supabase/supabase-js').AuthResponse>}
 */
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

/**
 * Signs the current user out, clearing their local session.
 * 
 * @returns {Promise<{ error: import('@supabase/supabase-js').AuthError | null }>}
 */
export const signOut = async () => {
  // TODO: Add error handling/logging around signout failures
  return supabase.auth.signOut();
};

/**
 * Retrieves the current active session from local storage.
 * 
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Retrieves the currently authenticated user object directly from the server.
 * 
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export const getUser = async () => {
  // Uses getUser() instead of getSession().user for security (fetches fresh from server)
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
