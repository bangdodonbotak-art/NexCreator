// Konfigurasi default. Anon key Supabase memang publik (diamankan lewat RLS di schema.sql).
// JANGAN taruh service_role key, Gemini key, atau Telegram token di sini.
window.NEX_CONFIG = {
  SUPABASE_URL: "https://obftqgbsrpoonitxjqep.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZnRxZ2JzcnBvb25pdHhqcWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5ODQyMTAsImV4cCI6MjEwODU2MDIxMH0.sPwQj6BwcLFV1I3o0JADZkjA26rlr8bI6qc4r6H5rzk",
  OPS_COST_MONTHLY: 650000
};
