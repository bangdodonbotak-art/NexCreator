/** Status setup — dibaca dari env. Server-only: jangan import dari client component. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function isTelegramConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
}

export type SetupStatus = {
  supabase: boolean;
  gemini: boolean;
  telegram: boolean;
};

export function getSetupStatus(): SetupStatus {
  return {
    supabase: isSupabaseConfigured(),
    gemini: isGeminiConfigured(),
    telegram: isTelegramConfigured(),
  };
}
