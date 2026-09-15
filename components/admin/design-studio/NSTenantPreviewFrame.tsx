"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";
import { buildAccentOverrideVars } from "@/lib/utils/brand";
import { cn } from "@/lib/utils/cn";

interface SharedProps {
  theme: ThemeKey;
  settings: SiteSettings;
  className?: string;
  children: ReactNode;
}

type NSTenantPreviewFrameProps = SharedProps &
  (
    | { mode: "compact"; naturalHeight: number; scale?: number }
    | { mode: "canvas"; deviceWidth: number }
  );

/**
 * Shared wrapper behind every "live preview of a real Theme component
 * inside the admin" spot (the Hero/Statement/Story section editors, and
 * the Design Studio's full-page canvas). Centralizes what used to be
 * duplicated inline in each editor:
 *  1. `.tenant-preview` (app/globals.css) for the tenant's real light
 *     look instead of DS Catalog's own dark admin chrome, PLUS the
 *     Theme's own CSS scope class (`theme-02`) — theme-01 has none, it
 *     IS :root's default. Previously only `.tenant-preview` was applied,
 *     so a theme-02 tenant's previews silently rendered with theme-01's
 *     tokens (teal accent, etc.); this fixes that everywhere at once.
 *  2. The tenant's real accentColor override (buildAccentOverrideVars).
 *  3. Either a small cosmetic scale-down (`compact`, for a fixed-size
 *     thumbnail preview — same behavior as before) or a real fixed
 *     device width scaled-to-fit (`canvas`, for the Design Studio) —
 *     canvas mode renders content at its ACTUAL target width so
 *     responsive breakpoints genuinely fire, only visually shrinking the
 *     whole thing when the available space is narrower than that width,
 *     instead of always rendering at full desktop width and zooming out.
 */
export function NSTenantPreviewFrame(props: NSTenantPreviewFrameProps) {
  const { theme, settings, className, children } = props;
  const scopeClass = theme === "theme-02" ? "theme-02" : undefined;
  const accentVars = buildAccentOverrideVars(settings);

  if (props.mode === "compact") {
    const scale = props.scale ?? 0.32;
    return (
      <div
        className={cn("tenant-preview overflow-hidden rounded-card border border-border", scopeClass, className)}
        style={{ height: props.naturalHeight * scale, ...accentVars }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <CanvasFrame scopeClass={scopeClass} accentVars={accentVars} deviceWidth={props.deviceWidth} className={className}>
      {children}
    </CanvasFrame>
  );
}

function CanvasFrame({
  scopeClass,
  accentVars,
  deviceWidth,
  className,
  children,
}: {
  scopeClass?: string;
  accentVars: CSSProperties | undefined;
  deviceWidth: number;
  className?: string;
  children: ReactNode;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(deviceWidth);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setAvailableWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) setContentHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, availableWidth / deviceWidth);

  return (
    <div ref={measureRef} className="w-full">
      <div
        className={cn("tenant-preview mx-auto overflow-hidden rounded-card border border-border", scopeClass, className)}
        style={{ width: deviceWidth * scale, height: contentHeight * scale || undefined, ...accentVars }}
      >
        <div ref={innerRef} style={{ width: deviceWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
