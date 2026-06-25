import { NextResponse } from 'next/server';
import { db, adminAuth } from '../../../../lib/firebase-admin';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && decodedToken.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    throw new Error('Forbidden');
  }
  
  return decodedToken;
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    
    // Fetch leads using Admin SDK (bypasses all Firestore rules)
    const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
    
    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await verifyAdmin(request);
    
    const { id, status, actualPricePaid, currency } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (actualPricePaid !== undefined) updateData.actualPricePaid = Number(actualPricePaid);
    if (currency !== undefined) updateData.currency = currency;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    // Update lead using Admin SDK (bypasses all Firestore rules)
    await db.collection('leads').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}
