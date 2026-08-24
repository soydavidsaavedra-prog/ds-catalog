"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  verifyPassword,
} from "@/lib/auth/admin-auth";
import {
  createProduct,
  deleteProduct,
  getProductById,
  isSlugTaken,
  updateProduct,
  type ProductInput,
} from "@/lib/repositories/product-repository";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "@/lib/repositories/category-repository";
import { createBanner, deleteBanner, updateBanner } from "@/lib/repositories/banner-repository";
import { updateOrderStatus } from "@/lib/repositories/order-repository";
import { updateSettings } from "@/lib/repositories/settings-repository";
import type { Availability, Audience, ProductColor } from "@/lib/types/catalog";
import type { OrderStatus } from "@/lib/types/order";

export type ActionState = { error?: string; success?: boolean };

// ---------- Auth ----------

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---------- Shared revalidation ----------

function revalidateStorefront(categorySlug?: string, productSlug?: string) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  if (categorySlug) revalidatePath(`/${categorySlug}`);
  if (productSlug) revalidatePath(`/producto/${productSlug}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------- Products ----------

const AUDIENCE_VALUES: Audience[] = ["dama", "caballero", "nino", "unisex"];

/**
 * Audience is no longer a separate form field — it's derived from the
 * product's category so there's a single source of truth (the category
 * tree already has Dama/Caballero/Niño/Unisex at the top level). Falls
 * back to "unisex" for a category outside that structure.
 */
async function resolveAudienceForCategory(categorySlug: string): Promise<Audience> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return "unisex";
  const topLevel = category.parentId ? await getCategoryById(category.parentId) : category;
  const slug = topLevel?.slug;
  return AUDIENCE_VALUES.includes(slug as Audience) ? (slug as Audience) : "unisex";
}

async function parseProductInput(formData: FormData): Promise<ProductInput> {
  const images = JSON.parse(String(formData.get("images") ?? "[]")) as string[];
  const colors = JSON.parse(String(formData.get("colors") ?? "[]")) as ProductColor[];
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const name = String(formData.get("name") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "");

  return {
    slug: slugify(slugInput || `${reference}-${name}`),
    reference,
    name,
    price: Number(formData.get("price") ?? 0),
    wholesalePrice: formData.get("wholesalePrice") ? Number(formData.get("wholesalePrice")) : null,
    description: String(formData.get("description") ?? "").trim(),
    categorySlug,
    audience: await resolveAudienceForCategory(categorySlug),
    images: images.length > 0 ? images : [`placeholder:${categorySlug}:new`],
    sizes,
    colors,
    availability: String(formData.get("availability") ?? "in_stock") as Availability,
    featured: formData.get("featured") === "on",
    isNew: formData.get("isNew") === "on",
    onSale: formData.get("onSale") === "on",
    active: formData.get("active") === "on",
  };
}

export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = await parseProductInput(formData);
  if (!input.name || !input.reference || !input.categorySlug) {
    return { error: "Nombre, referencia y categoría son obligatorios." };
  }
  if (await isSlugTaken(input.slug)) {
    return { error: `La referencia/slug "${input.slug}" ya existe.` };
  }

  const product = await createProduct(input);
  revalidateStorefront(product.categorySlug, product.slug);
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = await parseProductInput(formData);
  if (!input.name || !input.reference || !input.categorySlug) {
    return { error: "Nombre, referencia y categoría son obligatorios." };
  }
  if (await isSlugTaken(input.slug, id)) {
    return { error: `La referencia/slug "${input.slug}" ya existe.` };
  }

  const existing = await getProductById(id);
  const updated = await updateProduct(id, input);
  if (!updated) return { error: "Producto no encontrado." };

  revalidateStorefront(existing?.categorySlug, existing?.slug);
  revalidateStorefront(updated.categorySlug, updated.slug);
  redirect("/admin/productos");
}

export async function deleteProductAction(id: string): Promise<void> {
  const existing = await getProductById(id);
  await deleteProduct(id);
  revalidateStorefront(existing?.categorySlug, existing?.slug);
  revalidatePath("/admin/productos");
}

export async function toggleProductFlagAction(
  id: string,
  flag: "active" | "featured" | "isNew" | "onSale",
  value: boolean,
): Promise<void> {
  const updated = await updateProduct(id, { [flag]: value });
  if (updated) revalidateStorefront(updated.categorySlug, updated.slug);
  revalidatePath("/admin/productos");
}

// ---------- Categories ----------

/**
 * Subcategory slugs are namespaced under their parent's slug (e.g.
 * "dama-joggers", "caballero-joggers") so the same subcategory name can be
 * reused under multiple parents without colliding on the global unique
 * slug column. A slug the admin already typed with that prefix is left
 * alone; only a bare slug gets prefixed.
 */
async function namespaceSlugUnderParent(slug: string, parentId: string | null): Promise<string> {
  if (!parentId) return slug;
  const parent = await getCategoryById(parentId);
  if (!parent) return slug;
  return slug.startsWith(`${parent.slug}-`) ? slug : `${parent.slug}-${slug}`;
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const baseSlug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (!name || !baseSlug) return;
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = await namespaceSlugUnderParent(baseSlug, parentId);

  await createCategory({
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    image: `placeholder:${slug}:1`,
    active: true,
    featured: false,
    parentId,
  });
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const baseSlug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const slug = await namespaceSlugUnderParent(baseSlug, parentId);

  await updateCategory(id, {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    parentId,
  });
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
}

export async function toggleCategoryActiveAction(id: string, active: boolean): Promise<void> {
  await updateCategory(id, { active });
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await deleteCategory(id);
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

// ---------- Banners ----------

export async function createBannerAction(formData: FormData): Promise<void> {
  await createBanner({
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    image: String(formData.get("image") ?? "placeholder:hero:1").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "/catalogo").trim(),
    active: formData.get("active") === "on",
    order: Number(formData.get("order") ?? 1),
  });
  revalidatePath("/admin/banners");
}

export async function updateBannerAction(id: string, formData: FormData): Promise<void> {
  await updateBanner(id, {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "").trim(),
    active: formData.get("active") === "on",
    order: Number(formData.get("order") ?? 1),
  });
  revalidatePath("/admin/banners");
}

export async function deleteBannerAction(id: string): Promise<void> {
  await deleteBanner(id);
  revalidatePath("/admin/banners");
}

// ---------- Orders ----------

export async function updateOrderStatusAction(id: string, status: OrderStatus): Promise<void> {
  await updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
}

// ---------- Settings ----------

export async function updateSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await updateSettings({
    brandName: String(formData.get("brandName") ?? "").trim(),
    slogan: String(formData.get("slogan") ?? "").trim(),
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").replace(/[^0-9]/g, ""),
    currency: String(formData.get("currency") ?? "USD").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    facebook: String(formData.get("facebook") ?? "").trim(),
    tiktok: String(formData.get("tiktok") ?? "").trim(),
  });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateHeroSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await updateSettings({
    heroEyebrow: String(formData.get("heroEyebrow") ?? "").trim(),
    heroTitleLine1: String(formData.get("heroTitleLine1") ?? "").trim(),
    heroTitleLine2: String(formData.get("heroTitleLine2") ?? "").trim(),
    heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
    heroTagline: String(formData.get("heroTagline") ?? "").trim(),
    heroCtaLabel: String(formData.get("heroCtaLabel") ?? "").trim(),
    heroCtaHref: String(formData.get("heroCtaHref") ?? "").trim(),
    heroImage: String(formData.get("heroImage") ?? "").trim(),
    heroImagePositionX: Number(formData.get("heroImagePositionX") ?? 50),
    heroImagePositionY: Number(formData.get("heroImagePositionY") ?? 50),
  });
  revalidatePath("/", "layout");
  return { success: true };
}
