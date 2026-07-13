import DSProductPrice from "./DSProductPrice";
import DSProductVariants from "./DSProductVariants";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function DSProductInfo({ product }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500">
          {product.brand}
        </p>

        <h1 className="mt-1 text-4xl font-bold">
          {product.name}
        </h1>
      </div>

      <DSProductPrice
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        currency={product.currency}
      />

      <p className="text-gray-700">
        {product.description}
      </p>

      <DSProductVariants
        productName={product.name}
        variants={product.variants}
      />
    </div>
  );
}