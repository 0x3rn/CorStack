import { NextResponse } from 'next/server';
import { db, adminAuth } from '../../../../lib/firebase-admin';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && decodedToken.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    throw new Error(`Forbidden: Your email (${decodedToken.email}) does not match the admin email (${process.env.NEXT_PUBLIC_ADMIN_EMAIL})`);
  }
  return decodedToken;
}

export async function POST(request: Request) {
  try {
    await verifyAdmin(request);
    const data = await request.json();
    
    if (data.order === undefined) {
      const snap = await db.collection('portfolio').get();
      data.order = snap.size;
    }
    
    const docRef = await db.collection('portfolio').add(data);
    return NextResponse.json({ id: docRef.id, ...data });
  } catch (error: any) {
    console.error("POST Error:", error);
    const status = (error.message.startsWith('Forbidden') || error.message === 'Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.collection('portfolio').doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT Error:", error);
    const status = (error.message.startsWith('Forbidden') || error.message === 'Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAdmin(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await db.collection('portfolio').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    const status = (error.message.startsWith('Forbidden') || error.message === 'Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
