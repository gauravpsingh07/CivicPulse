import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import type { Database } from "@/lib/types/database";

export type ServerEnvironmentStatus = {
  hasServiceRoleKey: boolean;
  hasDiscordWebhookUrl: boolean;
};

export async function createSupabaseServerClient() {
  const config = getSupabaseBrowserConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Route Handlers and Server
          // Actions can, so this keeps read-only server renders build-safe.
        }
      },
    },
  });
}

export function getServerEnvironmentStatus(): ServerEnvironmentStatus {
  return {
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasDiscordWebhookUrl: Boolean(process.env.DISCORD_WEBHOOK_URL),
  };
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}
