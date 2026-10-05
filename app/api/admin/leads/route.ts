import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { verifyAdmin } from '@/lib/admin';
import { apiError, assertSameOrigin } from '@/lib/http';
import { leadUpdateSchema, parseBody } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
    return NextResponse.json({ leads: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    await verifyAdmin(request);
    const { id, ...data } = await parseBody(request, leadUpdateSchema);
    await db.collection('leads').doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
