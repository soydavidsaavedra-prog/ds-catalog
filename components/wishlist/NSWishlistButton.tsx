"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWishlistCount } from "@/lib/wishlist/wishlist-store";
import { cn } from "@/lib/utils/cn";

export function NSWishlistButton({ className }: { className?: string }) {
  const { tenant } = useParams<{ tenant: string }>();
  const count = useWishlistCount();

  return (
    <Link
      href={`/${tenant}/favoritos`}
      aria-label={`Favoritos, ${count} productos`}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.2s-7.2-4.4-9.6-9A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 9.6 4.8c-2.4 4.6-9.6 9-9.6 9Z" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
