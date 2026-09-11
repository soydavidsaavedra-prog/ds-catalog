import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function NSPrice({
  amount,
  compareAt,
  className,
  size = "md",
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  } as const;

  const hasDiscount = Boolean(compareAt && compareAt > amount);
  const discountPercent = hasDiscount ? Math.round((1 - amount / compareAt!) * 100) : 0;

  return (
    <span className={cn("inline-flex items-baseline gap-2 font-semibold", sizeClasses[size], className)}>
      <span>{formatPrice(amount)}</span>
      {hasDiscount ? (
        <>
          <span className="text-xs font-normal text-muted-foreground line-through">{formatPrice(compareAt!)}</span>
          {discountPercent > 0 ? <span className="text-xs font-semibold text-danger">-{discountPercent}%</span> : null}
        </>
      ) : null}
    </span>
  );
}
