"use client";

import { useEffect } from "react";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createProduct,
  updateProduct,
} from "@/app/actions/product.actions";

import {
  productSchema,
  type ProductFormValues,
} from "@/schemas/product.schema";

import type { Product } from "@/types/product";

import DSButton from "@/components/ui/DSButton";

import DSProductGeneral from "./DSProductGeneral";
import DSProductPricing from "./DSProductPricing";
import DSProductInventory from "./DSProductInventory";
import DSProductContent from "./DSProductContent";
import DSProductMedia from "./DSProductMedia";
import DSProductSettings from "./DSProductSettings";

import DSFormVariants from "@/components/ui/form/DSFormVariants";

type Props = {
  product?: Product;
};

export default function DSProductForm({
  product,
}: Props) {
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      brand: "",
      category: "",

      price: 0,
      compareAtPrice: 0,
      stock: 0,

      shortDescription: "",
      description: "",

      active: true,
      featured: false,

      images: [],
      tags: [],

      variants: [],
    },
  });

  const variants = methods.watch("variants");

  useEffect(() => {
    if (!product) return;

    methods.reset({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      category: product.category,

      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,

      shortDescription: product.shortDescription,
      description: product.description,

      active: product.active,
      featured: product.featured,

      images: product.images,
      tags: product.tags,

      variants: product.variants,
    });
  }, [product, methods]);

  useEffect(() => {
    const totalStock = variants.reduce((total, variant) => {
      const variantStock = variant.sizes.reduce(
        (sum, size) => sum + (size.stock || 0),
        0
      );

      return total + variantStock;
    }, 0);

    methods.setValue("stock", totalStock, {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [variants, methods]);

  async function onSubmit(
    values: ProductFormValues
  ) {
    const productData: Product = {
      id: product?.id ?? 0,

      slug: values.slug,
      sku: values.sku,

      name: values.name,

      shortDescription: values.shortDescription,
      description: values.description,

      brand: values.brand,
      category: values.category,

      price: values.price,
      compareAtPrice: values.compareAtPrice,

      currency: product?.currency ?? "USD",

      stock: values.stock,

      active: values.active,
      featured: values.featured,

      tags: values.tags,
      images: values.images,

      variants: values.variants,
    };

    if (product) {
      await updateProduct(productData);
    } else {
      await createProduct(productData);
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          onSubmit,
          (errors) => {
            console.log(errors);
          }
        )}
        className="grid gap-8 lg:grid-cols-3"
      >
        <div className="space-y-8 lg:col-span-2">
          <DSProductGeneral />

          <DSProductPricing />

          <DSProductInventory />

          <DSProductContent />

          <DSProductMedia />

          <DSFormVariants />
        </div>

        <div className="space-y-8">
          <DSProductSettings />

          <DSButton
            type="submit"
            className="w-full"
          >
            {product
              ? "Actualizar producto"
              : "Guardar producto"}
          </DSButton>
        </div>
      </form>
    </FormProvider>
  );
}