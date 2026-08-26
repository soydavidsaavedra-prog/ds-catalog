"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "warning" | "danger" | "success";

const toneText: Record<Tone, string> = {
  default: "text-foreground",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

interface DSStatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
  href?: string;
  /** 0-100 — renders a thin animated fill bar under the value (e.g. storage or product-count usage against a plan limit). Omit for a plain KPI with no ceiling to show progress against. */
  progress?: number;
}

const progressBarTone: Record<Tone, string> = {
  default: "bg-accent",
  warning: "bg-warning",
  danger: "bg-danger",
  success: "bg-success",
};

/**
 * A KPI tile with somewhere to look (icon), something to read at a
 * glance (value), and room to say why it matters (hint) — replaces the
 * near-identical flat "number + label" cards previously hand-rolled
 * separately on the tenant dashboard and the Super Admin dashboard.
 */
export function DSStatCard({ label, value, icon, tone = "default", hint, href, progress }: DSStatCardProps) {
  const card = (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      className="group relative flex flex-col gap-3 rounded-card border border-border bg-surface-elevated p-5 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-accent/10 text-accent-strong transition-colors group-hover:bg-accent/15">
            {icon}
          </span>
        ) : null}
      </div>
      <p className={cn("font-display text-3xl leading-none", toneText[tone])}>{value}</p>
      {typeof progress === "number" ? (
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.1 }}
            className={cn("h-full rounded-pill", progressBarTone[tone])}
          />
        </div>
      ) : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
