import { adminAuth, type DecodedFirebaseToken } from './firebase-admin';
import { HttpError } from './http';

export function authorizeAdmin(token: DecodedFirebaseToken, env: Record<string, string | undefined> = process.env) {
  const uid = env.ADMIN_UID?.trim();
  const email = (env.ADMIN_EMAIL || env.NEXT_PUBLIC_ADMIN_EMAIL)?.trim().toLowerCase();
  if (!uid && !email) throw new HttpError(503, 'Admin access is not configured.');
  if (uid ? token.uid !== uid : token.email?.toLowerCase() !== email || token.email_verified !== true) {
    throw new HttpError(403, 'This account does not have admin access.');
  }
}

export async function verifyAdmin(request: Request) {
  if (!process.env.ADMIN_UID && !process.env.ADMIN_EMAIL && !process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    throw new HttpError(503, 'Admin access is not configured.');
  }
  const match = /^Bearer (\S+)$/.exec(request.headers.get('Authorization') || '');
  if (!match) throw new HttpError(401, 'Please sign in.');
  let token: DecodedFirebaseToken;
  try { token = await adminAuth.verifyIdToken(match[1]); }
  catch (error) {
    if (error instanceof Error && error.message.startsWith('Missing required environment variable:')) {
      throw new HttpError(503, 'Authentication is not configured.');
    }
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }
  authorizeAdmin(token);
  return token;
}
