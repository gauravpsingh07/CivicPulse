export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

export type PublicEnvironmentStatus = {
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  hasAppUrl: boolean;
};

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getPublicEnvironmentStatus(): PublicEnvironmentStatus {
  return {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasAppUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
