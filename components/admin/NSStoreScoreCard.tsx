import Link from "next/link";
import type { StoreScoreResult } from "@/lib/tenant/store-score";

/**
 * Advisory only — never gates any feature. Clicking a pending criterion
 * sends the owner straight to the admin page that fixes it, instead of
 * just naming the problem.
 */
export function NSStoreScoreCard({ tenantSlug, result }: { tenantSlug: string; result: StoreScoreResult }) {
  const base = `/${tenantSlug}/admin`;
  const message =
    result.score >= 90 ? "Tu tienda está lista para vender" : result.score >= 60 ? "Tu tienda está casi lista" : "Tu tienda está tomando forma";

  return (
    <div className="rounded-card border border-border bg-surface-elevated p-5">
      <h2 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Tu tienda</h2>
      <div className="mt-2 flex items-end gap-1.5">
        <p className="font-display text-4xl">{result.score}</p>
        <p className="mb-1 text-sm text-muted-foreground">/ 100</p>
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{message}</p>

      <div className="mt-4 flex flex-col gap-0.5">
        {result.criteria.map((c) => (
          <Link
            key={c.id}
            href={`${base}${c.href}`}
            className="flex items-center gap-2 rounded-control px-2 py-1.5 text-xs transition-colors hover:bg-surface"
          >
            <span className={c.done ? "text-success" : "text-warning"} aria-hidden>
              {c.done ? "✓" : "⚠"}
            </span>
            <span className={c.done ? "text-muted-foreground line-through" : "text-foreground"}>{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
