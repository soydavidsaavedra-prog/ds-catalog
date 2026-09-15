"use client";

import { useRef, useState } from "react";
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
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  // Tracks whether the current pointer session is a mouse (hover-zoom) or
  // touch/pen (tap-to-toggle-zoom) — the two need different gestures since
  // touch devices don't have a hover state to key off of.
  const lastPointerType = useRef<string>("mouse");
  const gallery = images.length > 0 ? images : [`placeholder:producto:${reference}`];

  function pointFromEvent(e: { clientX: number; clientY: number; currentTarget: EventTarget }) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    lastPointerType.current = e.pointerType;
    if (e.pointerType !== "mouse") return;
    setZoom(pointFromEvent(e));
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") setZoom(null);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (lastPointerType.current === "mouse") return;
    if (zoom) {
      setZoom(null);
      return;
    }
    setZoom(pointFromEvent(e));
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {gallery.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
          {gallery.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => {
                setActive(index);
                setZoom(null);
              }}
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

      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-card bg-ink-900",
          zoom ? "cursor-zoom-out" : "cursor-zoom-in",
        )}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <div className={CARD_ASPECT_RATIO_CLASSES[cardAspectRatio]}>
          <div
            className="h-full w-full transition-transform duration-200 ease-out"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          >
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
    </div>
  );
}
