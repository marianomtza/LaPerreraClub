import { isProduction } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function checkMemoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  if (!isProduction()) return checkMemoryRateLimit(key, limit, windowMs);

  const supabase = getServiceSupabase();
  if (!supabase) {
    console.error("Durable rate limit unavailable: Supabase service client is not configured.");
    return false;
  }

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: Math.ceil(windowMs / 1000)
  });

  if (error) {
    console.error("Durable rate limit failed.", error.message);
    return false;
  }

  return data === true;
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
