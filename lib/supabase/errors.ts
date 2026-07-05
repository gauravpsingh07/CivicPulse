const CONNECTION_ERROR_PATTERN =
  /fetch failed|failed to fetch|enotfound|econnrefused|econnreset|etimedout|network|socket hang up|aborted/i;

export const DATABASE_UNREACHABLE_MESSAGE =
  "The live database is temporarily unreachable, so fresh data cannot be loaded right now. This demo runs on Supabase's free tier, which pauses the project after a period of inactivity. Please check back shortly.";

export function isConnectionError(message: string | null | undefined) {
  return Boolean(message && CONNECTION_ERROR_PATTERN.test(message));
}

export function toUserFacingQueryError(
  error: { message?: string | null } | null | undefined,
) {
  const message = error?.message?.trim();

  if (!message || isConnectionError(message)) {
    return DATABASE_UNREACHABLE_MESSAGE;
  }

  return message;
}
