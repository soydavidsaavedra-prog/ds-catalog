import "server-only";
import PDFDocument from "pdfkit";
import { parsePlaceholder } from "@/lib/media/placeholder";
import { brandInitials } from "@/lib/utils/brand";
import { availabilityLabel, formatPrice } from "@/lib/utils/format";
import type { Category, Product, SiteSettings } from "@/lib/types/catalog";

const PAGE_MARGIN = 40;
const HEADER_HEIGHT = 64;
const FOOTER_HEIGHT = 30;
const ROW_HEIGHT = 76;
const THUMB_SIZE = 56;
const PRICE_COLUMN_WIDTH = 90;
const IMAGE_FETCH_TIMEOUT_MS = 8000;
const IMAGE_FETCH_CONCURRENCY = 8;

// El Nuevo Sánchez / Theme 01's own default accent (app/globals.css :root)
// — used whenever a tenant hasn't picked a custom brand color, so the PDF
// still reads as "on brand" for the platform instead of falling back to
// plain black.
const DEFAULT_ACCENT = "#00a19a";
const DEFAULT_ACCENT_FOREGROUND = "#0a0a09";

const AVAILABILITY_DOT_COLOR: Record<Product["availability"], string> = {
  in_stock: "#16a34a",
  low_stock: "#d97706",
  out_of_stock: "#dc2626",
};

export interface CatalogPdfInput {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
}

/** pdfkit only decodes JPEG and PNG buffers — a WEBP/AVIF/SVG upload (all allowed for product photos) would otherwise throw. Checked by magic bytes so a bad/unsupported image degrades to the placeholder thumbnail instead of failing the whole export. */
export function isSupportedRasterImage(buffer: Buffer): boolean {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) return true;
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  return false;
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return isSupportedRasterImage(buffer) ? buffer : null;
  } catch {
    // Unreachable/slow/corrupt image — the product still exports, just with the placeholder thumbnail.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

interface CategoryGroup {
  category: Category | null;
  products: Product[];
}

export function groupProductsByCategory(products: Product[], categories: Category[]): CategoryGroup[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const order: string[] = [];
  const buckets = new Map<string, Product[]>();

  for (const product of products) {
    const key = bySlug.has(product.categorySlug) ? product.categorySlug : "__other__";
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(product);
  }

  return order.map((key) => ({ category: bySlug.get(key) ?? null, products: buckets.get(key)! }));
}

function firstRealImage(product: Product): string | null {
  return product.images.find((img) => img && !parsePlaceholder(img)) ?? null;
}

export async function buildCatalogPdf({ settings, categories, products }: CatalogPdfInput): Promise<Buffer> {
  const accent = settings.accentColor ?? DEFAULT_ACCENT;
  const accentForeground = settings.accentForeground ?? DEFAULT_ACCENT_FOREGROUND;

  const [imageBuffers, logoBuffer] = await Promise.all([
    mapWithConcurrency(products, IMAGE_FETCH_CONCURRENCY, async (product) => {
      const url = firstRealImage(product);
      return url ? fetchImageBuffer(url) : null;
    }),
    settings.brandLogo && !parsePlaceholder(settings.brandLogo) ? fetchImageBuffer(settings.brandLogo) : Promise.resolve(null),
  ]);
  const imageByProductId = new Map(products.map((product, index) => [product.id, imageBuffers[index]]));
  const groups = groupProductsByCategory(products, categories);

  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const contentBottom = pageHeight - PAGE_MARGIN - FOOTER_HEIGHT;

  let pageNumber = 1;
  function drawChrome() {
    doc.save();
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT).fill(accent);
    let brandTextX = PAGE_MARGIN;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, PAGE_MARGIN, 12, { fit: [40, 40] });
        brandTextX = PAGE_MARGIN + 52;
      } catch {
        // Corrupt/unreadable logo buffer — header still reads fine with just the brand name.
      }
    }
    doc
      .fillColor(accentForeground)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(settings.brandName, brandTextX, 14, { width: contentWidth - (brandTextX - PAGE_MARGIN) - 110 });
    doc.font("Helvetica").fontSize(9).text("Catálogo de productos", brandTextX, 36);
    const dateLabel = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date());
    doc.font("Helvetica").fontSize(8).text(dateLabel, PAGE_MARGIN, 16, { width: contentWidth, align: "right" });
    doc.restore();

    doc.save();
    const footerY = pageHeight - PAGE_MARGIN - FOOTER_HEIGHT + 8;
    const contact = [settings.whatsappDisplay, settings.contactEmail].filter(Boolean).join("   ·   ");
    doc.font("Helvetica").fontSize(8).fillColor("#6b6b68");
    if (contact) doc.text(contact, PAGE_MARGIN, footerY, { width: contentWidth - 60 });
    doc.text(`Página ${pageNumber}`, PAGE_MARGIN, footerY, { width: contentWidth, align: "right" });
    doc.restore();

    doc.x = PAGE_MARGIN;
    doc.y = HEADER_HEIGHT + 20;
  }

  doc.on("pageAdded", () => {
    pageNumber += 1;
    drawChrome();
  });
  drawChrome();

  if (products.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#6b6b68")
      .text("No hay productos para exportar con estos filtros.", PAGE_MARGIN, doc.y, { width: contentWidth, align: "center" });
  }

  for (const group of groups) {
    if (doc.y + 28 > contentBottom) doc.addPage();

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(accent)
      .text(group.category?.name ?? "Otros", PAGE_MARGIN, doc.y, { width: contentWidth });
    doc
      .moveTo(PAGE_MARGIN, doc.y + 4)
      .lineTo(pageWidth - PAGE_MARGIN, doc.y + 4)
      .strokeColor(accent)
      .lineWidth(1)
      .stroke();
    doc.y += 14;

    for (const product of group.products) {
      if (doc.y + ROW_HEIGHT > contentBottom) doc.addPage();
      const rowTop = doc.y;
      const buffer = imageByProductId.get(product.id);
      let drewRealImage = false;
      if (buffer) {
        try {
          doc.image(buffer, PAGE_MARGIN, rowTop, { fit: [THUMB_SIZE, THUMB_SIZE] });
          drewRealImage = true;
        } catch {
          // Falls through to the placeholder thumbnail below.
        }
      }
      if (!drewRealImage) drawPlaceholderThumb(doc, PAGE_MARGIN, rowTop, product.name, accent, accentForeground);

      const textX = PAGE_MARGIN + THUMB_SIZE + 14;
      const priceX = pageWidth - PAGE_MARGIN - PRICE_COLUMN_WIDTH;
      const nameWidth = priceX - textX - 10;
      const onSale = product.previousPrice != null && product.previousPrice > product.price;

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0a0a09").text(product.name, textX, rowTop, { width: nameWidth });

      if (onSale) {
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#9c9c98")
          .text(formatPrice(product.previousPrice as number), priceX, rowTop, { width: PRICE_COLUMN_WIDTH, align: "right", strike: true });
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(accent)
          .text(formatPrice(product.price), priceX, rowTop + 11, { width: PRICE_COLUMN_WIDTH, align: "right" });
      } else {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(accent)
          .text(formatPrice(product.price), priceX, rowTop, { width: PRICE_COLUMN_WIDTH, align: "right" });
      }

      const metaLine = [`Ref. ${product.reference}`, group.category?.name].filter(Boolean).join("   ·   ");
      doc.font("Helvetica").fontSize(8).fillColor("#6b6b68").text(metaLine, textX, rowTop + 16, { width: nameWidth + PRICE_COLUMN_WIDTH });

      doc.circle(textX + 3, rowTop + 33, 3).fill(AVAILABILITY_DOT_COLOR[product.availability]);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#6b6b68")
        .text(availabilityLabel[product.availability], textX + 10, rowTop + 29, { width: nameWidth + PRICE_COLUMN_WIDTH - 10 });

      const variantBits: string[] = [];
      if (product.sizes.length > 0) variantBits.push(`Tallas: ${product.sizes.join(", ")}`);
      if (product.colors.length > 0) variantBits.push(`Colores: ${product.colors.map((c) => c.name).join(", ")}`);
      if (variantBits.length > 0) {
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#6b6b68")
          .text(variantBits.join("     "), textX, rowTop + 42, { width: nameWidth + PRICE_COLUMN_WIDTH });
      }

      doc.y = rowTop + ROW_HEIGHT;
      doc
        .moveTo(PAGE_MARGIN, doc.y - 10)
        .lineTo(pageWidth - PAGE_MARGIN, doc.y - 10)
        .strokeColor("#e5e5e2")
        .lineWidth(0.5)
        .stroke();
    }

    doc.y += 6;
  }

  doc.end();
  return finished;
}

function drawPlaceholderThumb(doc: PDFKit.PDFDocument, x: number, y: number, productName: string, accent: string, foreground: string) {
  doc.save();
  doc.rect(x, y, THUMB_SIZE, THUMB_SIZE).fill(accent);
  doc
    .fillColor(foreground)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(brandInitials(productName), x, y + THUMB_SIZE / 2 - 8, { width: THUMB_SIZE, align: "center" });
  doc.restore();
}
