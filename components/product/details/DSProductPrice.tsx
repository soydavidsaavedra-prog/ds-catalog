type Props = {
    price: number;
    compareAtPrice: number;
    currency: string;
  };
  
  export default function DSProductPrice({
    price,
    compareAtPrice,
    currency,
  }: Props) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold">
          {currency} {price}
        </span>
  
        {compareAtPrice > price && (
          <span className="text-xl text-gray-400 line-through">
            {currency} {compareAtPrice}
          </span>
        )}
      </div>
    );
  }