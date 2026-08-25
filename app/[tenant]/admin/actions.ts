"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  verifyTenantAdminPassword,
} from "@/lib/auth/admin-auth";
import {
  countProducts,
  createProduct,
  deleteProduct,
  getProductById,
  isSlugTaken,
  updateProduct,
  type ProductInput,
} from "@/lib/repositories/product-repository";
import { getEffectivePlanForTenant } from "@/lib/tenant/plan-limits";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "@/lib/repositories/category-repository";
import { createBanner, deleteBanner, getBannerById, updateBanner } from "@/lib/repositories/banner-repository";
import { updateOrderStatus } from "@/lib/repositories/order-repository";
import { getSettings, updateSettings } from "@/lib/repositories/settings-repository";
import { completeOnboarding } from "@/lib/repositories/tenant-repository";
import { deleteStorageFilesByUrls } from "@/lib/repositories/storage-repository";
import { slugify } from "@/lib/utils/slug";
import { HEX_COLOR, readableForegroundFor } from "@/lib/utils/brand";
import type { Availability, Audience, CardAspectRatio, ImageFit, ProductColor } from "@/lib/types/catalog";
import type { OrderStatus } from "@/lib/types/order";

export type ActionState = { error?: string; success?: boolean };

/**
 * Deletes whichever of `oldUrls` no longer appear in `newUrls` — an edit
 * that removed or replaced an image, or a delete (newUrls = []). Best
 * effort: a Storage hiccup here should never undo a product/banner/etc.
 * save or delete that already succeeded in the database.
 */
async function cleanupReplacedImages(
  oldUrls: (string | null | undefined)[],
  newUrls: (string | null | undefined)[],
): Promise<void> {
  const kept = new Set(newUrls.filter((u): u is string => typeof u === "string" && u.length > 0));
  const removed = oldUrls.filter((u): u is string => typeof u === "string" && u.length > 0 && !kept.has(u));
  if (removed.length === 0) return;
  await deleteStorageFilesByUrls(removed).catch(() => {});
}

// ---------- Auth ----------

export async function loginAction(
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyTenantAdminPassword(tenantSlug, password))) {
    return { error: "Contraseña incorrecta." };
  }
  await createAdminSession(tenantSlug);
  redirect(`/${tenantSlug}/admin`);
}

export async function logoutAction(tenantSlug: string): Promise<void> {
  await destroyAdminSession();
  redirect(`/${tenantSlug}/admin/login`);
}

/** Distinct from logoutAction only in where it sends the browser back — the session teardown is identical (destroyAdminSession() already clears the impersonation marker too). */
export async function endImpersonationAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/superadmin/tenants");
}

// ---------- Onboarding ----------

export async function completeOnboardingAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await updateSettings(tenantId, {
      slogan: String(formData.get("slogan") ?? "").trim(),
      brandDescription: String(formData.get("brandDescription") ?? "").trim(),
      whatsappNumber: String(formData.get("whatsappNumber") ?? "").replace(/[^0-9]/g, ""),
      whatsappDisplay: String(formData.get("whatsappDisplay") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    });
    await completeOnboarding(tenantId);
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  revalidatePath(`/${tenantSlug}`, "layout");
  redirect(`/${tenantSlug}/admin`);
}

// ---------- Shared revalidation ----------

function revalidateStorefront(tenantSlug: string, categorySlug?: string, productSlug?: string) {
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/catalogo`);
  if (categorySlug) revalidatePath(`/${tenantSlug}/${categorySlug}`);
  if (productSlug) revalidatePath(`/${tenantSlug}/producto/${productSlug}`);
}

// ---------- Products ----------

const AUDIENCE_VALUES: Audience[] = ["dama", "caballero", "nino", "unisex"];
const CARD_ASPECT_RATIO_VALUES: CardAspectRatio[] = ["portrait", "square", "landscape"];
const IMAGE_FIT_VALUES: ImageFit[] = ["cover", "contain"];

/** Same cap enforced client-side in NSImageUploader — repeated here since a form POST doesn't have to go through that component. */
const MAX_PRODUCT_IMAGES = 10;

/**
 * Audience is no longer a separate form field — it's derived from the
 * product's category so there's a single source of truth (the category
 * tree already has Dama/Caballero/Niño/Unisex at the top level). Falls
 * back to "unisex" for a category outside that structure.
 */
async function resolveAudienceForCategory(tenantId: string, categorySlug: string): Promise<Audience> {
  const category = await getCategoryBySlug(tenantId, categorySlug);
  if (!category) return "unisex";
  const topLevel = category.parentId ? await getCategoryById(tenantId, category.parentId) : category;
  const slug = topLevel?.slug;
  return AUDIENCE_VALUES.includes(slug as Audience) ? (slug as Audience) : "unisex";
}

async function parseProductInput(tenantId: string, formData: FormData): Promise<ProductInput> {
  const images = (JSON.parse(String(formData.get("images") ?? "[]")) as string[]).slice(0, MAX_PRODUCT_IMAGES);
  const colors = JSON.parse(String(formData.get("colors") ?? "[]")) as ProductColor[];
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const name = String(formData.get("name") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const cardAspectRatioInput = String(formData.get("cardAspectRatio") ?? "");
  const imageFitInput = String(formData.get("imageFit") ?? "");

  return {
    slug: slugify(slugInput || `${reference}-${name}`),
    reference,
    name,
    price: Number(formData.get("price") ?? 0),
    wholesalePrice: formData.get("wholesalePrice") ? Number(formData.get("wholesalePrice")) : null,
    description: String(formData.get("description") ?? "").trim(),
    categorySlug,
    audience: await resolveAudienceForCategory(tenantId, categorySlug),
    images: images.length > 0 ? images : [`placeholder:${categorySlug}:new`],
    cardAspectRatio: CARD_ASPECT_RATIO_VALUES.includes(cardAspectRatioInput as CardAspectRatio)
      ? (cardAspectRatioInput as CardAspectRatio)
      : "portrait",
    imageFit: IMAGE_FIT_VALUES.includes(imageFitInput as ImageFit) ? (imageFitInput as ImageFit) : "cover",
    sizes,
    colors,
    availability: String(formData.get("availability") ?? "in_stock") as Availability,
    featured: formData.get("featured") === "on",
    isNew: formData.get("isNew") === "on",
    onSale: formData.get("onSale") === "on",
    active: formData.get("active") === "on",
    hidePaymentBadge: formData.get("hidePaymentBadge") === "on",
  };
}

export async function createProductAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = await parseProductInput(tenantId, formData);
  if (!input.name || !input.reference || !input.categorySlug) {
    return { error: "Nombre, referencia y categoría son obligatorios." };
  }
  if (await isSlugTaken(tenantId, input.slug)) {
    return { error: `La referencia/slug "${input.slug}" ya existe.` };
  }

  const plan = await getEffectivePlanForTenant(tenantId);
  if (plan?.maxProducts != null) {
    const currentCount = await countProducts(tenantId);
    if (currentCount >= plan.maxProducts) {
      return { error: `Alcanzaste el límite de productos de tu plan (${plan.maxProducts}). Contacta a soporte para ampliarlo.` };
    }
  }

  let product;
  try {
    product = await createProduct(tenantId, input);
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  revalidateStorefront(tenantSlug, product.categorySlug, product.slug);
  redirect(`/${tenantSlug}/admin/productos`);
}

export async function updateProductAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = await parseProductInput(tenantId, formData);
  if (!input.name || !input.reference || !input.categorySlug) {
    return { error: "Nombre, referencia y categoría son obligatorios." };
  }
  if (await isSlugTaken(tenantId, input.slug, id)) {
    return { error: `La referencia/slug "${input.slug}" ya existe.` };
  }

  const existing = await getProductById(tenantId, id);
  let updated;
  try {
    updated = await updateProduct(tenantId, id, input);
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  if (!updated) return { error: "Producto no encontrado." };
  if (existing) await cleanupReplacedImages(existing.images, updated.images);

  revalidateStorefront(tenantSlug, existing?.categorySlug, existing?.slug);
  revalidateStorefront(tenantSlug, updated.categorySlug, updated.slug);
  redirect(`/${tenantSlug}/admin/productos`);
}

export async function deleteProductAction(tenantId: string, tenantSlug: string, id: string): Promise<void> {
  const existing = await getProductById(tenantId, id);
  await deleteProduct(tenantId, id);
  if (existing) await cleanupReplacedImages(existing.images, []);
  revalidateStorefront(tenantSlug, existing?.categorySlug, existing?.slug);
  revalidatePath(`/${tenantSlug}/admin/productos`);
}

export async function toggleProductFlagAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  flag: "active" | "featured" | "isNew" | "onSale",
  value: boolean,
): Promise<void> {
  const updated = await updateProduct(tenantId, id, { [flag]: value });
  if (updated) revalidateStorefront(tenantSlug, updated.categorySlug, updated.slug);
  revalidatePath(`/${tenantSlug}/admin/productos`);
}

// ---------- Categories ----------

/**
 * Subcategory slugs are namespaced under their parent's slug (e.g.
 * "dama-joggers", "caballero-joggers") so the same subcategory name can be
 * reused under multiple parents without colliding on the (tenant, slug)
 * unique constraint. A slug the admin already typed with that prefix is
 * left alone; only a bare slug gets prefixed.
 */
async function namespaceSlugUnderParent(tenantId: string, slug: string, parentId: string | null): Promise<string> {
  if (!parentId) return slug;
  const parent = await getCategoryById(tenantId, parentId);
  if (!parent) return slug;
  return slug.startsWith(`${parent.slug}-`) ? slug : `${parent.slug}-${slug}`;
}

export async function createCategoryAction(tenantId: string, tenantSlug: string, formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const baseSlug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (!name || !baseSlug) return;
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = await namespaceSlugUnderParent(tenantId, baseSlug, parentId);
  const image = String(formData.get("image") ?? "").trim();

  await createCategory(tenantId, {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    image: image || `placeholder:${slug}:1`,
    active: true,
    featured: false,
    parentId,
  });
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin/categorias`);
}

export async function updateCategoryAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  formData: FormData,
): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const baseSlug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = await namespaceSlugUnderParent(tenantId, baseSlug, parentId);
  const image = String(formData.get("image") ?? "").trim();
  const existing = await getCategoryById(tenantId, id);

  await updateCategory(tenantId, id, {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    parentId,
    ...(image ? { image } : {}),
  });
  if (existing && image) await cleanupReplacedImages([existing.image], [image]);
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/catalogo`);
  revalidatePath(`/${tenantSlug}/admin/categorias`);
}

export async function toggleCategoryActiveAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  active: boolean,
): Promise<void> {
  await updateCategory(tenantId, id, { active });
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin/categorias`);
}

export async function deleteCategoryAction(tenantId: string, tenantSlug: string, id: string): Promise<void> {
  const existing = await getCategoryById(tenantId, id);
  await deleteCategory(tenantId, id);
  if (existing) await cleanupReplacedImages([existing.image], []);
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin/categorias`);
}

/**
 * Moves a category up/down among its siblings (same parent) by swapping
 * `order` with the adjacent sibling — this is what controls the display
 * order on the home page and in nav menus.
 */
export async function moveCategoryAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const all = await listCategories(tenantId);
  const target = all.find((c) => c.id === id);
  if (!target) return;

  const siblings = all
    .filter((c) => c.parentId === target.parentId)
    .sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((c) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;

  const other = siblings[swapIndex];
  await updateCategory(tenantId, target.id, { order: other.order });
  await updateCategory(tenantId, other.id, { order: target.order });
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin/categorias`);
}

// ---------- Banners ----------

export async function createBannerAction(tenantId: string, tenantSlug: string, formData: FormData): Promise<void> {
  await createBanner(tenantId, {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    image: String(formData.get("image") ?? "placeholder:hero:1").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "/catalogo").trim(),
    active: formData.get("active") === "on",
    order: Number(formData.get("order") ?? 1),
  });
  revalidatePath(`/${tenantSlug}/admin/banners`);
}

export async function updateBannerAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  formData: FormData,
): Promise<void> {
  const image = String(formData.get("image") ?? "").trim();
  const existing = await getBannerById(tenantId, id);
  await updateBanner(tenantId, id, {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    image,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "").trim(),
    active: formData.get("active") === "on",
    order: Number(formData.get("order") ?? 1),
  });
  if (existing) await cleanupReplacedImages([existing.image], [image]);
  revalidatePath(`/${tenantSlug}/admin/banners`);
}

export async function deleteBannerAction(tenantId: string, tenantSlug: string, id: string): Promise<void> {
  const existing = await getBannerById(tenantId, id);
  await deleteBanner(tenantId, id);
  if (existing) await cleanupReplacedImages([existing.image], []);
  revalidatePath(`/${tenantSlug}/admin/banners`);
}

// ---------- Orders ----------

export async function updateOrderStatusAction(
  tenantId: string,
  tenantSlug: string,
  id: string,
  status: OrderStatus,
): Promise<void> {
  await updateOrderStatus(tenantId, id, status);
  revalidatePath(`/${tenantSlug}/admin/pedidos`);
}

// ---------- Settings ----------

/** Friendlier message for the common "you haven't re-run schema.sql yet" failure mode — any Supabase write in this file can hit it after a schema change, not just settings. */
function friendlyDbErrorMessage(err: unknown): string {
  // Supabase errors (PostgrestError) are plain objects with a `.message`
  // string, not real Error instances — String(err) on those yields the
  // useless "[object Object]" instead of the actual reason.
  let message: string;
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string") {
    message = (err as { message: string }).message;
  } else {
    message = String(err);
  }

  if (/column .* does not exist/i.test(message)) {
    return "No se pudo guardar: falta actualizar la base de datos. Vuelve a correr supabase/schema.sql en el SQL Editor de Supabase y reintenta.";
  }
  return `No se pudo guardar: ${message}`;
}

export async function updateSettingsAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const customAccentColor = formData.get("customAccentColor") === "on";
  const accentColor = String(formData.get("accentColor") ?? "").trim();
  const accentColorStrong = String(formData.get("accentColorStrong") ?? "").trim();
  if (customAccentColor && (!HEX_COLOR.test(accentColor) || !HEX_COLOR.test(accentColorStrong))) {
    return { error: "El color de marca no es válido." };
  }

  const brandLogo = String(formData.get("brandLogo") ?? "").trim();
  const paymentBadgeIcon = String(formData.get("paymentBadgeIcon") ?? "").trim();
  const existing = await getSettings(tenantId);

  try {
    await updateSettings(tenantId, {
      brandName: String(formData.get("brandName") ?? "").trim(),
      slogan: String(formData.get("slogan") ?? "").trim(),
      brandDescription: String(formData.get("brandDescription") ?? "").trim(),
      whatsappNumber: String(formData.get("whatsappNumber") ?? "").replace(/[^0-9]/g, ""),
      whatsappDisplay: String(formData.get("whatsappDisplay") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      contactAddress: String(formData.get("contactAddress") ?? "").trim(),
      contactMapsUrl: String(formData.get("contactMapsUrl") ?? "").trim(),
      currency: String(formData.get("currency") ?? "USD").trim(),
      instagram: String(formData.get("instagram") ?? "").trim(),
      facebook: String(formData.get("facebook") ?? "").trim(),
      tiktok: String(formData.get("tiktok") ?? "").trim(),
      brandLogo,
      paymentBadgeIcon,
      paymentBadgeLabel: String(formData.get("paymentBadgeLabel") ?? "").trim(),
      accentColor: customAccentColor ? accentColor : null,
      accentColorStrong: customAccentColor ? accentColorStrong : null,
      accentForeground: customAccentColor ? readableForegroundFor(accentColor) : null,
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  await cleanupReplacedImages([existing.brandLogo, existing.paymentBadgeIcon], [brandLogo, paymentBadgeIcon]);
  revalidatePath(`/${tenantSlug}`, "layout");
  revalidatePath(`/${tenantSlug}/admin`, "layout");
  return { success: true };
}

export async function updateHeroSettingsAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const heroImage = String(formData.get("heroImage") ?? "").trim();
  const existing = await getSettings(tenantId);

  try {
    await updateSettings(tenantId, {
      heroEyebrow: String(formData.get("heroEyebrow") ?? "").trim(),
      heroTitleLine1: String(formData.get("heroTitleLine1") ?? "").trim(),
      heroTitleLine2: String(formData.get("heroTitleLine2") ?? "").trim(),
      heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
      heroTagline: String(formData.get("heroTagline") ?? "").trim(),
      heroCtaLabel: String(formData.get("heroCtaLabel") ?? "").trim(),
      heroCtaHref: String(formData.get("heroCtaHref") ?? "").trim(),
      heroImage,
      heroImagePositionX: Number(formData.get("heroImagePositionX") ?? 50),
      heroImagePositionY: Number(formData.get("heroImagePositionY") ?? 50),
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  await cleanupReplacedImages([existing.heroImage], [heroImage]);
  revalidatePath(`/${tenantSlug}`, "layout");
  return { success: true };
}

export async function updateStorySettingsAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const storyStepImage1 = String(formData.get("storyStepImage1") ?? "").trim();
  const storyStepImage2 = String(formData.get("storyStepImage2") ?? "").trim();
  const storyStepImage3 = String(formData.get("storyStepImage3") ?? "").trim();
  const storyStepImage4 = String(formData.get("storyStepImage4") ?? "").trim();
  const storyStepImage5 = String(formData.get("storyStepImage5") ?? "").trim();
  const existing = await getSettings(tenantId);

  try {
    await updateSettings(tenantId, {
      storyEyebrow: String(formData.get("storyEyebrow") ?? "").trim(),
      storyTitle: String(formData.get("storyTitle") ?? "").trim(),
      storyDescription: String(formData.get("storyDescription") ?? "").trim(),
      storyStepImage1,
      storyStepImage2,
      storyStepImage3,
      storyStepImage4,
      storyStepImage5,
      storyStepLabel1: String(formData.get("storyStepLabel1") ?? "").trim() || null,
      storyStepLabel2: String(formData.get("storyStepLabel2") ?? "").trim() || null,
      storyStepLabel3: String(formData.get("storyStepLabel3") ?? "").trim() || null,
      storyStepLabel4: String(formData.get("storyStepLabel4") ?? "").trim() || null,
      storyStepLabel5: String(formData.get("storyStepLabel5") ?? "").trim() || null,
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  await cleanupReplacedImages(
    [existing.storyStepImage1, existing.storyStepImage2, existing.storyStepImage3, existing.storyStepImage4, existing.storyStepImage5],
    [storyStepImage1, storyStepImage2, storyStepImage3, storyStepImage4, storyStepImage5],
  );
  revalidatePath(`/${tenantSlug}`, "layout");
  return { success: true };
}

export async function updateStatementSettingsAction(
  tenantId: string,
  tenantSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const statementImage = String(formData.get("statementImage") ?? "").trim();
  const existing = await getSettings(tenantId);

  try {
    await updateSettings(tenantId, {
      statementTitleLine1: String(formData.get("statementTitleLine1") ?? "").trim(),
      statementTitleLine2: String(formData.get("statementTitleLine2") ?? "").trim(),
      statementDescription: String(formData.get("statementDescription") ?? "").trim(),
      statementImage,
    });
  } catch (err) {
    return { error: friendlyDbErrorMessage(err) };
  }
  await cleanupReplacedImages([existing.statementImage], [statementImage]);
  revalidatePath(`/${tenantSlug}`, "layout");
  return { success: true };
}
