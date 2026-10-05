import { z } from 'zod';
import { HttpError, readJson } from './http';

const text = (max = 300) => z.string().trim().min(1).max(max);
const optionalText = z.string().trim().max(3000).optional();
const order = z.number().int().min(0).max(100_000);
export const documentId = text(1500).refine(value => !value.includes('/') && value !== '.' && value !== '..', 'Invalid document ID');
const imageUrl = z.string().max(2048).refine(value => {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Use an HTTPS image URL or a local asset path.');
const websiteUrl = z.union([z.literal(''), z.url().max(2048).refine(value => new URL(value).protocol === 'https:', 'Use HTTPS.')]);
const image = z.object({ url: imageUrl, description: optionalText }).strict();
export const pricingSchema = z.object({ name: text(), desc: text(2000), priceUsd: text(100), priceNgn: text(100),
  features: z.array(text(500)).min(1).max(50), isPopular: z.boolean(), order }).strict();
export const portfolioSchema = z.object({ title: text(), category: text(), description: optionalText,
  imageUrl: imageUrl.optional(), desktopImages: z.array(image).max(5).optional(), mobileImages: z.array(image).max(5).optional(),
  desktopImageUrls: z.array(imageUrl).max(5).optional(), mobileImageUrls: z.array(imageUrl).max(5).optional(),
  websiteUrl: websiteUrl.optional(), showOnHome: z.boolean().optional(), order }).strict();
const cardSchema = z.object({ title: text(), description: text(3000), iconName: text(100), order }).strict();
const processSchema = z.object({ title: text(), description: text(3000), order }).strict();
export const collectionSchemas = { services: cardSchema, client_types: cardSchema, process: processSchema };
export const generalSchema = z.object({ heroHeadline: text(), heroSubtitle: text(2000), isAcceptingProjects: z.boolean(),
  socialTwitter: websiteUrl, socialInstagram: websiteUrl, socialLinkedIn: websiteUrl }).strict();
export const contactSettingsSchema = z.object({ ngnPhone: z.string().trim().max(50), usdPhone: z.string().trim().max(50),
  ngnEmail: z.union([z.literal(''), z.email()]), usdEmail: z.union([z.literal(''), z.email()]) }).strict();
export const contactSchema = z.object({ name: text(120).refine(value => !/[\r\n]/.test(value), 'Invalid name'),
  email: z.email().max(254), message: text(10_000), type: z.enum(['contact', 'project']).default('contact') }).strict();
export const leadUpdateSchema = z.object({ id: documentId, status: z.enum(['new', 'read', 'pending', 'completed', 'canceled']).optional(),
  actualPricePaid: z.number().finite().nonnegative().max(1e12).optional(), currency: z.enum(['usd', 'ngn']).optional() }).strict()
  .refine(value => value.status !== undefined || value.actualPricePaid !== undefined || value.currency !== undefined, 'No update data provided.');

export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message || 'Invalid request.');
  return result.data;
}
export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  return parse(schema, await readJson(request));
}
