// ===== SUPABASE CLIENT =====
// These values are injected by Vercel environment variables at build time.
// They are public/anon keys - safe to use in frontend code.

const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://ldcdaufbfgpaxkqneaeo.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkY2RhdWZiZmdwYXhrcW5lYWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzIyMTksImV4cCI6MjA5MDc0ODIxOX0.746R9_acxtpFmSlR5QHqxeSQpYGivS81KUl-8STUPz4';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
