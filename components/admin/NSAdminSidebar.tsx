"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NSLogo } from "@/components/brand/NSLogo";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/inicio", label: "Inicio", icon: HomeIcon },
  { href: "/admin/productos", label: "Productos", icon: ProductIcon },
  { href: "/admin/categorias", label: "Categorías", icon: CategoryIcon },
  { href: "/admin/pedidos", label: "Pedidos", icon: OrderIcon },
  { href: "/admin/banners", label: "Banners", icon: BannerIcon },
  { href: "/admin/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function NSAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-ink-800 bg-ink-950 text-ink-0">
      <div className="flex h-16 items-center gap-2 border-b border-ink-800 px-5">
        <NSLogo id="ns-admin" variant="mark" className="h-8 w-8" />
        <span className="text-xs font-semibold uppercase tracking-widest">Panel administrativo</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent text-accent-foreground" : "text-ink-300 hover:bg-ink-900 hover:text-ink-0",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <Link href="/" className="block rounded-control px-3 py-2 text-xs font-medium text-ink-400 hover:text-ink-0">
          ← Ver sitio
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="w-full rounded-control px-3 py-2 text-left text-xs font-medium text-ink-400 hover:text-danger">
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;
}
function DashboardIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><rect x="2.5" y="2.5" width="6" height="6" rx="1" /><rect x="11.5" y="2.5" width="6" height="6" rx="1" /><rect x="2.5" y="11.5" width="6" height="6" rx="1" /><rect x="11.5" y="11.5" width="6" height="6" rx="1" /></svg>;
}
function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 9.5 10 3l7 6.5" /><path d="M5 8.5V17h10V8.5" /></svg>;
}
function ProductIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6Z" /><path d="M3 6l7 3.5L17 6M10 9.5V17" /></svg>;
}
function CategoryIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M2 10 10 2l8 8-8 8-8-8Z" /><circle cx="12.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function OrderIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M4 3h12l-1 12H5L4 3Z" /><path d="M7 3a3 3 0 0 1 6 0M4 7h12" /></svg>;
}
function BannerIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><rect x="2.5" y="4" width="15" height="10" rx="1" /><path d="M2.5 14 7 9.5l3 3 3-4L17.5 14" /></svg>;
}
function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="10" r="2.6" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" /></svg>;
}
