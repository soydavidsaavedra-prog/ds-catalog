"use client";

import { useState } from "react";
import { updateHeroSlideAction, deleteHeroSlideAction } from "@/app/[tenant]/admin/actions";
import { NSAdminDeleteButton } from "@/components/admin/NSAdminDeleteButton";
import { NSLabel, NSInput } from "@/components/ui/NSInput";
import { NSButton } from "@/components/ui/NSButton";
import type { HeroSlide } from "@/lib/types/catalog";

export function NSHeroSlideList({
  tenantId,
  tenantSlug,
  slides,
}: {
  tenantId: string;
  tenantSlug: string;
  slides: HeroSlide[];
}) {
  if (slides.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no agregaste ninguna foto o video.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      {slides.map((slide) => (
        <NSHeroSlideRow key={slide.id} tenantId={tenantId} tenantSlug={tenantSlug} slide={slide} />
      ))}
    </section>
  );
}

function NSHeroSlideRow({ tenantId, tenantSlug, slide }: { tenantId: string; tenantSlug: string; slide: HeroSlide }) {
  const [positionX, setPositionX] = useState(slide.positionX);
  const [positionY, setPositionY] = useState(slide.positionY);

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-elevated p-5 sm:flex-row">
      <div className="h-32 w-full shrink-0 overflow-hidden rounded-control bg-ink-900 sm:w-48">
        {slide.mediaType === "video" ? (
          <video src={slide.mediaUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.mediaUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <form
        action={updateHeroSlideAction.bind(null, tenantId, tenantSlug, slide.id)}
        className="grid flex-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <NSLabel htmlFor={`posx-${slide.id}`}>Posición horizontal</NSLabel>
          <input
            id={`posx-${slide.id}`}
            type="range"
            min={0}
            max={100}
            value={positionX}
            onChange={(e) => setPositionX(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <input type="hidden" name="positionX" value={positionX} />
        </div>
        <div>
          <NSLabel htmlFor={`posy-${slide.id}`}>Posición vertical</NSLabel>
          <input
            id={`posy-${slide.id}`}
            type="range"
            min={0}
            max={100}
            value={positionY}
            onChange={(e) => setPositionY(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <input type="hidden" name="positionY" value={positionY} />
        </div>
        <div>
          <NSLabel htmlFor={`order-${slide.id}`}>Orden</NSLabel>
          <NSInput id={`order-${slide.id}`} name="order" type="number" defaultValue={slide.order} />
        </div>
        <label className="flex items-center gap-2 self-end text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={slide.active}
            className="h-4 w-4 rounded border-border-strong accent-[var(--accent)]"
          />
          Activo
        </label>
        <div className="flex items-center gap-4 sm:col-span-2">
          <NSButton type="submit" variant="outline" size="sm">
            Guardar
          </NSButton>
          <NSAdminDeleteButton
            action={deleteHeroSlideAction.bind(null, tenantId, tenantSlug, slide.id)}
            confirmMessage="¿Eliminar esta foto/video del hero?"
          />
        </div>
      </form>
    </div>
  );
}
