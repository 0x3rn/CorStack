import { HttpError } from './http';

type RateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };
export function createLocalLimiter(limit = 5, periodMs = 60_000) {
  const windows = new Map<string, { count: number; expires: number }>();
  return (key: string, now = Date.now()) => {
    for (const [id, window] of windows) if (window.expires <= now) windows.delete(id);
    const window = windows.get(key);
    if (window) { if (window.count >= limit) return false; window.count++; return true; }
    if (windows.size >= 10_000) return false;
    windows.set(key, { count: 1, expires: now + periodMs });
    return true;
  };
}
const localLimit = createLocalLimiter();
export async function enforceRateLimit(request: Request, email: string, action: string) {
  const identity = email.toLowerCase();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (process.env.NODE_ENV !== 'production') {
    if (!localLimit(action + ':' + hash) || !localLimit(action + ':local')) throw new HttpError(429, 'Too many requests. Please wait a minute.');
    return;
  }
  let limiter: RateLimiter | undefined;
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    limiter = (env as unknown as { PUBLIC_API_RATE_LIMITER?: RateLimiter }).PUBLIC_API_RATE_LIMITER;
  } catch { /* A production server must supply a shared rate limiter. */ }
  if (!limiter) throw new HttpError(503, 'Request protection is temporarily unavailable.');
  const ip = request.headers.get('cf-connecting-ip');
  if (!ip) throw new HttpError(503, 'Request protection is temporarily unavailable.');
  const results = await Promise.all([limiter.limit({ key: action + ':email:' + hash }), limiter.limit({ key: action + ':ip:' + ip })]);
  if (results.some(result => !result.success)) throw new HttpError(429, 'Too many requests. Please wait a minute.');
}
