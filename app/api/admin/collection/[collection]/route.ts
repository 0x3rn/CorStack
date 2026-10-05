import { createCollectionHandlers } from '@/lib/admin-crud';
import { collectionSchemas } from '@/lib/validation';
import { apiError, HttpError } from '@/lib/http';

async function handle(method: 'POST' | 'PUT' | 'DELETE', request: Request, context: RouteContext<'/api/admin/collection/[collection]'>) {
  try {
    const { collection } = await context.params;
    if (!Object.hasOwn(collectionSchemas, collection)) throw new HttpError(404, 'Collection not found.');
    const name = collection as keyof typeof collectionSchemas;
    return createCollectionHandlers(name, collectionSchemas[name])[method](request);
  } catch (error) { return apiError(error); }
}
export const POST = (request: Request, context: RouteContext<'/api/admin/collection/[collection]'>) => handle('POST', request, context);
export const PUT = (request: Request, context: RouteContext<'/api/admin/collection/[collection]'>) => handle('PUT', request, context);
export const DELETE = (request: Request, context: RouteContext<'/api/admin/collection/[collection]'>) => handle('DELETE', request, context);
