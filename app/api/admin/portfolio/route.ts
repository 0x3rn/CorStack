import { createCollectionHandlers } from '@/lib/admin-crud';
import { portfolioSchema } from '@/lib/validation';
export const { POST, PUT, DELETE } = createCollectionHandlers('portfolio', portfolioSchema);
