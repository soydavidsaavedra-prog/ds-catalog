import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres"),

  brand: z
    .string()
    .min(2, "La marca es obligatoria"),

  category: z
    .string()
    .min(2, "La categoría es obligatoria"),

  price: z.coerce
    .number()
    .min(0, "El precio debe ser mayor o igual a 0"),

  stock: z.coerce
    .number()
    .min(0, "El stock debe ser mayor o igual a 0"),
});

export type ProductFormData = z.infer<typeof productSchema>;