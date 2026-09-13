import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Per-token cache; evicts oldest entries since Clerk tokens rotate periodically
const clientCache = new Map();
const MAX_CACHE_SIZE = 5;

/**
 * Get a Supabase client authorized with the given Clerk token.
 * Clients are cached per token so repeated calls in one session reuse them.
 */
export const getSupabaseClient = (clerkToken) => {
  const cached = clientCache.get(clerkToken);
  if (cached) return cached;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });

  // Keep the cache bounded (tokens rotate periodically)
  if (clientCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = clientCache.keys().next().value;
    clientCache.delete(oldestKey);
  }
  clientCache.set(clerkToken, client);

  return client;
};
