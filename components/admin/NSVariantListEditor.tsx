"use client";

import { useState } from "react";
import type { ProductColor } from "@/lib/types/catalog";
import { NSInput } from "@/components/ui/NSInput";

export function NSVariantListEditor({
  name,
  initialColors,
}: {
  name: string;
  initialColors: ProductColor[];
}) {
  const [colors, setColors] = useState<ProductColor[]>(
    initialColors.length > 0 ? initialColors : [{ name: "", hex: "#3f628a" }],
  );

  const update = (index: number, patch: Partial<ProductColor>) => {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const validColors = colors.filter((c) => c.name.trim());

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(validColors)} />
      <div className="flex flex-col gap-2">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={color.hex}
              onChange={(e) => update(index, { hex: e.target.value })}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-control border border-border-strong bg-transparent p-1"
              aria-label="Color"
            />
            <NSInput
              value={color.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Nombre del color (ej. Azul)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setColors((prev) => prev.filter((_, i) => i !== index))}
              aria-label="Quitar color"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-surface hover:text-danger"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setColors((prev) => [...prev, { name: "", hex: "#3f628a" }])}
        className="mt-2 text-xs font-semibold uppercase tracking-wide text-accent-strong hover:underline"
      >
        + Agregar color
      </button>
    </div>
  );
}
