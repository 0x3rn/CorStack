import { createCollectionHandlers } from '@/lib/admin-crud';
import { pricingSchema } from '@/lib/validation';
export const { POST, PUT, DELETE } = createCollectionHandlers('pricing', pricingSchema);
