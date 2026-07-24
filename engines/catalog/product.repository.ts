import { supabase } from "@/lib/supabase";
import { mapProduct } from "@/mappers/product.mapper";
import type { Product } from "@/types/product";

class ProductRepository {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");

    if (error) throw error;

    console.log("RAW PRODUCTS", data);

    return (data ?? []).map(mapProduct);
  }

  async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;

    console.log("RAW PRODUCT", data);

    return mapProduct(data);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;

    console.log("RAW PRODUCT", data);

    return mapProduct(data);
  }

  async create(product: Product) {
    const { error } = await supabase
      .from("products")
      .insert({
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        short_description: product.shortDescription,
        description: product.description,
        brand: product.brand,
        category: product.category,
        price: product.price,
        compare_at_price: product.compareAtPrice,
        currency: product.currency,
        stock: product.stock,
        active: product.active,
        featured: product.featured,
        tags: product.tags,
        images: product.images,
        variants: product.variants,
      });

    if (error) throw error;
  }

  async update(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        short_description: product.shortDescription,
        description: product.description,
        brand: product.brand,
        category: product.category,
        price: product.price,
        compare_at_price: product.compareAtPrice,
        currency: product.currency,
        stock: product.stock,
        active: product.active,
        featured: product.featured,
        tags: product.tags,
        images: product.images,
        variants: product.variants,
      })
      .eq("id", product.id);

    if (error) throw error;
  }

  async delete(id: number) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const productRepository = new ProductRepository();