"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export function NSCatalogSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) params.set("q", value.trim());
        else params.delete("q");
        router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
      }}
      className="relative w-full max-w-sm"
    >
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="9" cy="9" r="6" />
        <path strokeLinecap="round" d="m17 17-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre o referencia..."
        aria-label="Buscar productos"
        className="h-11 w-full rounded-control border border-border bg-surface-elevated pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </form>
  );
}
