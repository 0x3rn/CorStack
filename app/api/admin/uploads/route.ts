import { verifyAdmin } from '@/lib/admin';
import { apiError, assertSameOrigin } from '@/lib/http';
import { getPortfolioBucket, readImage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await verifyAdmin(request);
    const { bytes, contentType, extension } = await readImage(request);
    const bucket = await getPortfolioBucket();
    const filename = `${crypto.randomUUID()}.${extension}`;
    await bucket.put(`portfolio/${filename}`, bytes, {
      httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
      customMetadata: { uploadedBy: user.uid },
    });
    return Response.json({ url: `/media/portfolio/${filename}` }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiError(error); }
}
