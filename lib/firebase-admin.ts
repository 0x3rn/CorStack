import { decodeProtectedHeader, importX509, jwtVerify, type JWTPayload } from 'jose';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = Record<string, JsonValue | undefined>;
type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue> };
type FirestoreValue = Record<string, unknown>;

type AccessTokenCache = { token: string; expiresAt: number };
type CertificateCache = { certificates: Record<string, string>; expiresAt: number };

let accessTokenCache: AccessTokenCache | undefined;
let certificateCache: CertificateCache | undefined;

const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
const FIRESTORE_API = 'https://firestore.googleapis.com/v1';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_CERTIFICATES_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const VALID_COLLECTIONS = new Set([
  'client_types',
  'leads',
  'portfolio',
  'pricing',
  'process',
  'services',
  'settings',
]);

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function base64UrlEncode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

function firestoreBasePath() {
  const projectId = requiredEnvironmentVariable('FIREBASE_PROJECT_ID');
  return `${FIRESTORE_API}/projects/${encodeURIComponent(projectId)}/databases/(default)`;
}

function validateCollection(collection: string) {
  if (!VALID_COLLECTIONS.has(collection)) throw new Error('Invalid Firestore collection');
}

function validateDocumentId(id: string) {
  if (!id || id.includes('/')) throw new Error('Invalid Firestore document ID');
}

async function getServiceAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.token;
  }

  const clientEmail = requiredEnvironmentVariable('FIREBASE_CLIENT_EMAIL');
  const privateKey = requiredEnvironmentVariable('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = [
    base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
    base64UrlEncode(
      JSON.stringify({
        iss: clientEmail,
        scope: FIRESTORE_SCOPE,
        aud: GOOGLE_OAUTH_TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    ),
  ].join('.');

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsignedToken),
  );
  const assertion = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to authenticate Firebase service account (${response.status})`);
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error('Firebase service account returned no access token');

  accessTokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
  return accessTokenCache.token;
}

async function firestoreRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getServiceAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${firestoreBasePath()}${path}`, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${message}`);
  }
  return response;
}

function toFirestoreValue(value: JsonValue | undefined): FirestoreValue {
  if (value === undefined) throw new Error('Firestore does not support undefined values');
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.filter((item) => item !== undefined).map(toFirestoreValue) } };
  }

  const fields = Object.fromEntries(
    Object.entries(value as { [key: string]: JsonValue }).map(([key, item]) => [key, toFirestoreValue(item)]),
  );
  return { mapValue: { fields } };
}

function toFirestoreFields(data: JsonObject): Record<string, FirestoreValue> {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

function fromFirestoreValue(value: FirestoreValue): JsonValue {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue as string;
  if ('booleanValue' in value) return value.booleanValue as boolean;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue as string;
  if ('referenceValue' in value) return value.referenceValue as string;
  if ('bytesValue' in value) return value.bytesValue as string;
  if ('geoPointValue' in value) {
    const geoPoint = value.geoPointValue as { latitude?: number; longitude?: number };
    return { latitude: geoPoint.latitude ?? 0, longitude: geoPoint.longitude ?? 0 };
  }
  if ('arrayValue' in value) {
    const arrayValue = value.arrayValue as { values?: FirestoreValue[] };
    return (arrayValue.values ?? []).map(fromFirestoreValue);
  }
  if ('mapValue' in value) {
    const mapValue = value.mapValue as { fields?: Record<string, FirestoreValue> };
    return Object.fromEntries(
      Object.entries(mapValue.fields ?? {}).map(([key, item]) => [key, fromFirestoreValue(item)]),
    );
  }
  throw new Error('Unsupported Firestore field value');
}

function fromFirestoreDocument(document: FirestoreDocument): Record<string, JsonValue> & { id: string } {
  const id = document.name.split('/').pop();
  if (!id) throw new Error('Firestore response did not include a document ID');
  return {
    id,
    ...Object.fromEntries(
      Object.entries(document.fields ?? {}).map(([key, value]) => [key, fromFirestoreValue(value)]),
    ),
  };
}

class FirestoreDocumentSnapshot {
  readonly exists: boolean;

  constructor(private readonly document?: FirestoreDocument) {
    this.exists = Boolean(document);
  }

  get id(): string {
    if (!this.document) throw new Error('Document does not exist');
    return fromFirestoreDocument(this.document).id;
  }

  data(): Record<string, JsonValue> | undefined {
    if (!this.document) return undefined;
    const { id: _id, ...data } = fromFirestoreDocument(this.document);
    return data;
  }
}

class FirestoreQuerySnapshot {
  readonly docs: FirestoreDocumentSnapshot[];

  constructor(documents: FirestoreDocument[]) {
    this.docs = documents.map((document) => new FirestoreDocumentSnapshot(document));
  }

  get size() {
    return this.docs.length;
  }
}

async function queryCollection(
  collection: string,
  orderBy?: { field: string; direction: 'asc' | 'desc' },
): Promise<FirestoreQuerySnapshot> {
  validateCollection(collection);
  const structuredQuery: Record<string, unknown> = { from: [{ collectionId: collection }] };
  if (orderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: orderBy.field },
        direction: orderBy.direction === 'desc' ? 'DESCENDING' : 'ASCENDING',
      },
    ];
  }

  const response = await firestoreRequest('/documents:runQuery', {
    method: 'POST',
    body: JSON.stringify({ structuredQuery }),
  });
  const results = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return new FirestoreQuerySnapshot(
    results.flatMap((result) => (result.document ? [result.document] : [])),
  );
}

async function patchDocument(
  collection: string,
  id: string,
  data: JsonObject,
  requireExisting = false,
) {
  validateCollection(collection);
  validateDocumentId(id);
  const fieldPaths = Object.keys(data).filter((key) => data[key] !== undefined);
  if (fieldPaths.length === 0) return;

  const query = new URLSearchParams();
  for (const fieldPath of fieldPaths) query.append('updateMask.fieldPaths', fieldPath);
  if (requireExisting) query.set('currentDocument.exists', 'true');

  await firestoreRequest(`/documents/${collection}/${encodeURIComponent(id)}?${query.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
}

class FirestoreDocumentReference {
  constructor(
    private readonly collection: string,
    private readonly id: string,
  ) {}

  async get(): Promise<FirestoreDocumentSnapshot> {
    validateCollection(this.collection);
    validateDocumentId(this.id);

    const accessToken = await getServiceAccessToken();
    const response = await fetch(
      `${firestoreBasePath()}/documents/${this.collection}/${encodeURIComponent(this.id)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (response.status === 404) return new FirestoreDocumentSnapshot();
    if (!response.ok) throw new Error(`Firestore request failed (${response.status}): ${await response.text()}`);
    return new FirestoreDocumentSnapshot((await response.json()) as FirestoreDocument);
  }

  async update(data: JsonObject) {
    await patchDocument(this.collection, this.id, data, true);
  }

  async set(data: JsonObject, options?: { merge?: boolean }) {
    if (options?.merge) {
      await patchDocument(this.collection, this.id, data);
      return;
    }

    validateCollection(this.collection);
    validateDocumentId(this.id);
    await firestoreRequest(`/documents/${this.collection}/${encodeURIComponent(this.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
  }

  async delete() {
    validateCollection(this.collection);
    validateDocumentId(this.id);
    await firestoreRequest(`/documents/${this.collection}/${encodeURIComponent(this.id)}`, { method: 'DELETE' });
  }
}

class FirestoreCollectionReference {
  constructor(private readonly collection: string) {}

  get(): Promise<FirestoreQuerySnapshot> {
    return queryCollection(this.collection);
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    return { get: () => queryCollection(this.collection, { field, direction }) };
  }

  doc(id: string) {
    return new FirestoreDocumentReference(this.collection, id);
  }

  async add(data: JsonObject) {
    validateCollection(this.collection);
    const response = await firestoreRequest(`/documents/${this.collection}`, {
      method: 'POST',
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    const document = fromFirestoreDocument((await response.json()) as FirestoreDocument);
    return { id: document.id };
  }
}

export const db = {
  collection(collection: string) {
    return new FirestoreCollectionReference(collection);
  },
};

async function getFirebaseCertificates(): Promise<Record<string, string>> {
  if (certificateCache && certificateCache.expiresAt > Date.now()) return certificateCache.certificates;

  const response = await fetch(FIREBASE_CERTIFICATES_URL);
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
    if (!payload.sub) throw new Error('Firebase ID token has no subject');

    return {
      ...payload,
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  },
};
