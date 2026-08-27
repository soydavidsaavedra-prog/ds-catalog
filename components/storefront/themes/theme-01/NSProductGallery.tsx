"use client";

import { useState } from "react";
import { NSMedia } from "@/components/ui/NSMedia";
import { CARD_ASPECT_RATIO_CLASSES } from "./NSProductCard";
import type { CardAspectRatio, ImageFit } from "@/lib/types/catalog";
import { cn } from "@/lib/utils/cn";

export function NSProductGallery({
  images,
  reference,
  name,
  brandName,
  cardAspectRatio = "portrait",
  imageFit = "cover",
}: {
  images: string[];
  reference: string;
  name: string;
  brandName?: string;
  cardAspectRatio?: CardAspectRatio;
  imageFit?: ImageFit;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [`placeholder:producto:${reference}`];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {gallery.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
          {gallery.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={cn(
                "h-16 w-14 shrink-0 overflow-hidden rounded-control border transition-colors",
                active === index ? "border-accent-strong" : "border-border hover:border-border-strong",
              )}
            >
              <NSMedia src={image} alt={`${name} — vista ${index + 1}`} reference={reference} sizes="56px" brandName={brandName} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex-1 overflow-hidden rounded-card bg-ink-900">
        <div className={CARD_ASPECT_RATIO_CLASSES[cardAspectRatio]}>
          <NSMedia
            src={gallery[active]}
            alt={name}
            reference={reference}
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            objectFit={imageFit}
            brandName={brandName}
          />
        </div>
      </div>
    </div>
  );
}
