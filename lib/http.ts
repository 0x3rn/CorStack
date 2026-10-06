import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message, success: false, message: error.message }, {
      status: error.status,
      headers: error.status === 429 ? { 'Retry-After': '60' } : undefined,
    });
  }
  console.error('API request failed:', error);
  return NextResponse.json({ error: 'Service temporarily unavailable. Please try again.', success: false,
    message: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
}

export async function readJson(request: Request, maxBytes = 32_768): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'Content-Type must be application/json.');
  }
  if (Number(request.headers.get('content-length')) > maxBytes) throw new HttpError(413, 'Request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Request is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, 'Invalid JSON.'); }
}

function getAllowedOrigins(): Set<string> {
  const candidates = [
    process.env.SITE_URL || 'https://corstack.dev',
    'https://corstack.dev',
    'https://web.corstack.dev',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  ];
  const set = new Set<string>();
  for (const item of candidates) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    try {
      set.add(new URL(trimmed).origin);
    } catch {
      // Ignore malformed origin entries
    }
  }
  return set;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const allowed = getAllowedOrigins();
  if (process.env.NODE_ENV !== 'production') {
    try {
      allowed.add(new URL(request.url).origin);
    } catch {
      // Ignore invalid request URL in test/dev
    }
  }
  if (!allowed.has(origin)) throw new HttpError(403, 'Request origin is not allowed.');
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;' })[character]!);
}
