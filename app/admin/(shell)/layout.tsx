import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { NSAdminSidebar } from "@/components/admin/NSAdminSidebar";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      <NSAdminSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
