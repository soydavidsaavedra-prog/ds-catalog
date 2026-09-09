import { redirect } from "next/navigation";

/** Login is centralized now — see app/acceder. Kept as a redirect stub only so an old bookmarked link doesn't 404. */
export default async function AdminLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  redirect(`/acceder?tenant=${tenantSlug}`);
}
