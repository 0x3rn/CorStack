import { NextResponse } from 'next/server';
import { db, adminAuth } from '../../../../lib/firebase-admin';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && decodedToken.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    throw new Error('Forbidden');
  }
  return decodedToken;
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const data = await request.json();
    const { docId, ...updateData } = data; // docId should be 'general' or 'contact'
    
    if (!docId) return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });

    await db.collection('settings').doc(docId).set(updateData, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}
