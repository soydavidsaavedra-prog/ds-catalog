import type {
    ProductVariant,
    ProductSize,
  } from "@/types/product";
  
  export function cloneVariants(
    variants: ProductVariant[]
  ) {
    return structuredClone(variants);
  }
  
  export function addVariantSize(
    variants: ProductVariant[],
    variantIndex: number,
    size: ProductSize
  ) {
    const updated = cloneVariants(variants);
  
    updated[variantIndex].sizes.push(size);
  
    return updated;
  }
  
  export function removeVariantSize(
    variants: ProductVariant[],
    variantIndex: number,
    sizeIndex: number
  ) {
    const updated = cloneVariants(variants);
  
    updated[variantIndex].sizes.splice(sizeIndex, 1);
  
    return updated;
  }
  
  export function sortVariantSizes(
    variants: ProductVariant[],
    variantIndex: number
  ) {
    const updated = cloneVariants(variants);
  
    updated[variantIndex].sizes.sort(
      (a, b) => a.size - b.size
    );
  
    return updated;
  }
  
  export function duplicateVariant(
    variants: ProductVariant[],
    variantIndex: number
  ) {
    const updated = cloneVariants(variants);
  
    const clone = structuredClone(
      updated[variantIndex]
    );
  
    clone.id = crypto.randomUUID();
  
    clone.color = `${clone.color} Copia`;
  
    clone.sizes = clone.sizes.map((size) => ({
      ...size,
      id: crypto.randomUUID(),
      sku: "",
    }));
  
    updated.splice(
      variantIndex + 1,
      0,
      clone
    );
  
    return updated;
  }
  
  export function removeVariant(
    variants: ProductVariant[],
    variantIndex: number
  ) {
    const updated = cloneVariants(variants);
  
    updated.splice(variantIndex, 1);
  
    return updated;
  }
  
  export function generateVariantSizes(
    variants: ProductVariant[],
    variantIndex: number,
    sizes: number[]
  ) {
    const updated = cloneVariants(variants);
  
    const existing = new Set(
      updated[variantIndex].sizes.map(
        (item) => item.size
      )
    );
  
    for (const size of sizes) {
      if (existing.has(size))
        continue;
  
      updated[variantIndex].sizes.push({
        id: crypto.randomUUID(),
        size,
        stock: 0,
        sku: "",
        price: undefined,
      });
    }
  
    updated[variantIndex].sizes.sort(
      (a, b) => a.size - b.size
    );
  
    return updated;
  }
  
  export function calculateProductStock(
    variants: ProductVariant[]
  ) {
    return variants.reduce(
      (total, variant) =>
        total +
        variant.sizes.reduce(
          (sum, size) => sum + size.stock,
          0
        ),
      0
    );
  }