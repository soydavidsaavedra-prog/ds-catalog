import { z } from "zod";

export const productImageSchema = z.object({
  path: z.string(),
  alt: z.string(),
});

export const productSizeSchema = z.object({
  id: z.string(),
  size: z.number(),
  stock: z.number().min(0),
  sku: z.string(),
  price: z.number().optional(),
});

export const productVariantSchema = z
  .object({
    id: z.string(),

    color: z
      .string()
      .trim()
      .min(1, "Ingrese un color."),

    image: z.string().optional(),

    sizes: z.array(productSizeSchema),
  })
  .superRefine((variant, ctx) => {
    const used = new Set<number>();

    variant.sizes.forEach((size, index) => {
      if (used.has(size.size)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La talla está duplicada.",
          path: ["sizes", index, "size"],
        });
      }

      used.add(size.size);
    });
  });

export const productSchema = z
  .object({
    name: z.string().min(3, "Ingrese el nombre"),

    slug: z.string().min(3, "Ingrese el slug"),

    sku: z.string().min(1, "Ingrese el SKU"),

    brand: z.string().min(2, "Ingrese la marca"),

    category: z.string().min(2, "Ingrese la categoría"),

    price: z.number().min(0),

    compareAtPrice: z.number().min(0),

    stock: z.number().min(0),

    shortDescription: z.string(),

    description: z.string(),

    active: z.boolean(),

    featured: z.boolean(),

    images: z.array(productImageSchema),

    tags: z.array(z.string()),

    variants: z.array(productVariantSchema),
  })
  .superRefine((product, ctx) => {
    const colors = new Set<string>();

    product.variants.forEach((variant, index) => {
      const color = variant.color.trim().toLowerCase();

      if (colors.has(color)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El color está duplicado.",
          path: ["variants", index, "color"],
        });
      }

      colors.add(color);
    });
  });

export type ProductFormValues =
  z.infer<typeof productSchema>;