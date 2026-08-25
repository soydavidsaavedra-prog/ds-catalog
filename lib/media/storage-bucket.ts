/**
 * Single source of truth for the product-images bucket name — was
 * duplicated as a literal in app/[tenant]/admin/api/upload/route.ts and
 * supabase/schema.sql; lib/repositories/storage-repository.ts is now a
 * third consumer, so it's worth naming once.
 */
export const PRODUCT_IMAGES_BUCKET = "ns-product-images";
