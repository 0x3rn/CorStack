import { NextResponse } from 'next/server';
import { getPublicContent } from '@/lib/db/content';
import { apiError } from '@/lib/http';
export async function GET() {
  try { return NextResponse.json(await getPublicContent(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
}
