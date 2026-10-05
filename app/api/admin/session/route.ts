import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin';
import { apiError } from '@/lib/http';
export async function GET(request: Request) {
  try {
    const user = await verifyAdmin(request);
    return NextResponse.json({ uid: user.uid }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiError(error); }
}
