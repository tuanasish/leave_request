import { createClient } from '@supabase/supabase-js'

/**
 * A Supabase client that uses the service role key.
 * This client bypasses RLS and does NOT use cookies.
 * Ideal for server-side caching or internal operations.
 */
export const supabaseServiceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
