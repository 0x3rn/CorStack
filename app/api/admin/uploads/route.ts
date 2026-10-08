import { verifyAdmin } from '@/lib/admin';
import { apiError, assertSameOrigin } from '@/lib/http';
import { getPortfolioBucket, readImage } from '@/lib/storage';
import { getImagesBinding, optimizeUploadedImage } from '@/lib/image-optimization';

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
    const images = await getImagesBinding();
    if (images) {
      try { await optimizeUploadedImage(bucket, filename, bytes, images); }
      catch { console.warn('Portfolio optimization unavailable; the original upload was preserved.'); }
    }
    return Response.json({ url: `/media/portfolio/${filename}` }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiError(error); }
}
