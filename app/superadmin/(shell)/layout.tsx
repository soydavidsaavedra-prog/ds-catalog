import { redirect } from "next/navigation";
import { getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";
import { NSSuperAdminSidebar } from "@/components/superadmin/NSSuperAdminSidebar";

/**
 * Server-side guard, same defense-in-depth pattern as
 * app/[tenant]/admin/(shell)/layout.tsx: middleware.ts already checked the
 * session cookie's signature, but this re-checks against the database
 * (getAuthenticatedSuperadmin re-reads super_admin_users, so a deactivated
 * account is rejected here even with a cryptographically valid cookie —
 * middleware alone can't know about that without a DB call on every
 * request).
 */
export default async function SuperadminShellLayout({ children }: { children: React.ReactNode }) {
  const superadmin = await getAuthenticatedSuperadmin();
  if (!superadmin) {
    redirect("/superadmin/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <NSSuperAdminSidebar email={superadmin.email} />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
