import { getPortfolioBucket, mediaFilename } from '@/lib/storage';
import { apiError } from '@/lib/http';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    if (!mediaFilename.test(filename)) return new Response('Not found', { status: 404 });
    const object = await (await getPortfolioBucket()).get(`portfolio/${filename}`);
    if (!object) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');
    if (request.headers.get('if-none-match') === object.httpEtag) return new Response(null, { status: 304, headers });
    return new Response(object.body, { headers });
  } catch (error) { return apiError(error); }
}
