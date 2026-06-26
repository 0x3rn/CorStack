import { NextResponse } from 'next/server';
import { db, adminAuth } from '../../../../../lib/firebase-admin';

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

export async function POST(request: Request, { params }: { params: { collection: string } }) {
  try {
    await verifyAdmin(request);
    const data = await request.json();
    const coll = params.collection;
    
    if (data.order === undefined) {
      const snap = await db.collection(coll).get();
      data.order = snap.size;
    }
    
    const docRef = await db.collection(coll).add(data);
    return NextResponse.json({ id: docRef.id, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}

export async function PUT(request: Request, { params }: { params: { collection: string } }) {
  try {
    await verifyAdmin(request);
    const data = await request.json();
    const { id, ...updateData } = data;
    const coll = params.collection;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.collection(coll).doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}

export async function DELETE(request: Request, { params }: { params: { collection: string } }) {
  try {
    await verifyAdmin(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const coll = params.collection;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.collection(coll).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}
