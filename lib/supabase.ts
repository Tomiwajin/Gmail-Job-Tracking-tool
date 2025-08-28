import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Client-side client (if needed later)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
export interface User {
  id: string;
  email: string;
  gmail_refresh_token?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  excluded_emails: string[];
  default_date_range_days: number;
  created_at: string;
  updated_at: string;
}
