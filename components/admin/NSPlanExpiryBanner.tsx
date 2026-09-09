import Link from "next/link";

/** Rendered by the admin shell layout whenever a tenant's plan is within EXPIRY_WARNING_DAYS of expiring (and not already frozen) — see lib/tenant/plan-limits.ts. Plain server component, no dismiss state: reappears every visit until the plan is actually renewed, which is the point. */
export function NSPlanExpiryBanner({
  tenantSlug,
  daysUntilExpiry,
  expiresAt,
}: {
  tenantSlug: string;
  daysUntilExpiry: number;
  expiresAt: string | null;
}) {
  const dayLabel = daysUntilExpiry === 1 ? "1 día" : `${daysUntilExpiry} días`;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-control border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
      <span>
        Tu plan vence en {dayLabel}
        {expiresAt ? ` (${new Date(expiresAt).toLocaleDateString("es")})` : ""} — renuévalo para no perder acceso.
      </span>
      <Link href={`/${tenantSlug}/admin/cuenta`} className="font-semibold underline hover:no-underline">
        Ver mi plan
      </Link>
    </div>
  );
}
