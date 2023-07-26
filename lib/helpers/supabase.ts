import { createClient } from '@supabase/supabase-js'

const options = {
  auth: {
    persistSession: false,
  },
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SUPABASE_HOST!,
  process.env.SUPABASE_ANON_KEY!,
  options
)
