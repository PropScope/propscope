import { createClient } from '@supabase/supabase-js'

// Public project URL + publishable key (safe for the browser with RLS).
const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aYdGF_yMOXQobQznFuh43w_1X1kFuKe'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
