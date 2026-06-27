import { NextResponse } from 'next/server';
import { getPublicContent } from '../../../lib/db/content';

export const revalidate = 60;

export async function GET() {
  try {
    const content = await getPublicContent();
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Failed to fetch public content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
