// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsrkladaehhkntrbwuzw.supabase.co'; // ← Replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcmtsYWRhZWhoa250cmJ3dXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjAxMDUsImV4cCI6MjA2NzE5NjEwNX0.sQSpe2NNVGOPTJLXmZkLuBd6ilBaGhdBZugb6G0hT5o'; // ← Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
