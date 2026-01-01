import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// ⚠️ KEEP YOUR KEYS HERE
const SUPABASE_URL = "https://rutmuahdldcrspnebipy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dG11YWhkbGRjcnNwbmViaXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNjY5MTcsImV4cCI6MjA4Mjg0MjkxN30.0ue_HQrXJ7vcdhvHEgzHU3K3_lr8-2EPW2kVPPvQA2g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
