// server/utils/database.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export const createSupabaseClient = () => {
  const config = useRuntimeConfig()

  return createClient<Database>(
    config.supabaseUrl,
    config.supabaseKey,
    {
      auth: {
        persistSession: false
      }
    }
  )
}