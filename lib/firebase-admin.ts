import { decodeProtectedHeader, importX509, jwtVerify, type JWTPayload } from 'jose';
type CertificateCache = { certificates: Record<string, string>; expiresAt: number };
let certificateCache: CertificateCache | undefined;
const FIREBASE_CERTIFICATES_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
async function getFirebaseCertificates(): Promise<Record<string, string>> {
  if (certificateCache && certificateCache.expiresAt > Date.now()) return certificateCache.certificates;

  const response = await fetch(FIREBASE_CERTIFICATES_URL, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error('Unable to fetch Firebase token verification certificates');

  const cacheControl = response.headers.get('Cache-Control') ?? '';
  const maxAgeSeconds = Number(/max-age=(\d+)/.exec(cacheControl)?.[1] ?? 3600);
  certificateCache = {
    certificates: (await response.json()) as Record<string, string>,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  };
  return certificateCache.certificates;
}

export type DecodedFirebaseToken = JWTPayload & { uid: string; email?: string };

export const adminAuth = {
  async verifyIdToken(token: string): Promise<DecodedFirebaseToken> {
    const projectId = requiredEnvironmentVariable('FIREBASE_PROJECT_ID');
    const protectedHeader = decodeProtectedHeader(token);
    if (protectedHeader.alg !== 'RS256' || !protectedHeader.kid) throw new Error('Invalid Firebase ID token');

    const certificates = await getFirebaseCertificates();
    const certificate = certificates[protectedHeader.kid];
    if (!certificate) throw new Error('Firebase ID token uses an unknown signing key');

    const publicKey = await importX509(certificate, 'RS256');
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number' || typeof payload.auth_time !== 'number' || payload.iat > Math.floor(Date.now() / 1000) || payload.auth_time > Math.floor(Date.now() / 1000)) throw new Error('Invalid Firebase ID token claims');
    if (!payload.sub || payload.sub.length > 128) throw new Error('Firebase ID token has no subject');

    return {
      ...payload,
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  },
};
