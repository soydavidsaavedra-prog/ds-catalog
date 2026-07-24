import { notFound } from "next/navigation";
import { catalogEngine } from "@/engines/catalog/catalog.engine";

import DSGallery from "@/components/product/gallery/DSGallery";
import DSProductInfo from "@/components/product/details/DSProductInfo";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await catalogEngine.getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <DSGallery
          images={product.images}
          name={product.name}
        />

        <DSProductInfo
          product={product}
        />
      </div>
    </main>
  );
}