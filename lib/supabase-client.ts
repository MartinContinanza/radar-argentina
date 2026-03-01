import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hvftwdsmwakqklnsymkd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZnR3ZHNtd2FrcWtsbnN5bWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTc1NDAsImV4cCI6MjA4Nzk3MzU0MH0.PofSC-juYgEzw3oSwVRjCLvr9TTwQUZT5PK-VXjbfl4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
