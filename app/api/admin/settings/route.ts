import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin';
import { apiError, assertSameOrigin, readJson } from '@/lib/http';
import { parse, generalSchema, contactSettingsSchema } from '@/lib/validation';

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await verifyAdmin(request);
    const { docId, ...data } = parse(z.record(z.string(), z.unknown()), await readJson(request));
    const id = parse(z.enum(['general', 'contact']), docId);
    const fields = id === 'general' ? parse(generalSchema, data) : parse(contactSettingsSchema, data);
    await db.collection('settings').doc(id).set(fields, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
