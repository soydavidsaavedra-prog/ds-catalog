import type { Metadata } from "next";
import { getAuthenticatedSuperadmin } from "@/lib/auth/superadmin-auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function SuperadminDashboardPage() {
  const superadmin = await getAuthenticatedSuperadmin();

  return (
    <div>
      <h1 className="font-display text-2xl uppercase tracking-wide">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sesión activa: {superadmin?.email}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Las métricas de clientes, productos y storage llegan en la siguiente fase.
      </p>
    </div>
  );
}
