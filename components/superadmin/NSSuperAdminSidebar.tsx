"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { superadminLogoutAction } from "@/app/superadmin/actions";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/superadmin", label: "Dashboard", icon: DashboardIcon },
  { href: "/superadmin/tenants", label: "Clientes", icon: TenantsIcon },
  { href: "/superadmin/plans", label: "Planes", icon: PlansIcon },
  { href: "/superadmin/subscriptions", label: "Suscripciones", icon: SubscriptionsIcon },
  { href: "/superadmin/storage", label: "Storage", icon: StorageIcon },
];

export function NSSuperAdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-800 bg-ink-950 px-4 text-ink-0 lg:hidden">
        <div className="flex items-center gap-2">
          <DSPlatformMark className="h-7 w-7" />
          <span className="text-xs font-semibold uppercase tracking-widest">DS Catalog · Super Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-control text-ink-300 hover:bg-ink-900 hover:text-ink-0"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-950 text-ink-0 transition-transform duration-normal ease-out-ns",
          "lg:static lg:z-auto lg:h-full lg:w-60 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-ink-800 px-5">
          <div className="flex items-center gap-2">
            <DSPlatformMark className="h-8 w-8" />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-semibold uppercase tracking-widest">DS Catalog</span>
              <span className="text-[10px] text-ink-400">Super Admin</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-control text-ink-400 hover:bg-ink-900 hover:text-ink-0 lg:hidden"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {LINKS.map((link) => {
            const active = link.href === "/superadmin" ? pathname === link.href : pathname.startsWith(link.href);
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
          <p className="truncate px-3 py-1 text-xs text-ink-500">{email}</p>
          <form action={superadminLogoutAction}>
            <button type="submit" className="w-full rounded-control px-3 py-2 text-left text-xs font-medium text-ink-400 hover:text-danger">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;
}
function DashboardIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><rect x="2.5" y="2.5" width="6" height="6" rx="1" /><rect x="11.5" y="2.5" width="6" height="6" rx="1" /><rect x="2.5" y="11.5" width="6" height="6" rx="1" /><rect x="11.5" y="11.5" width="6" height="6" rx="1" /></svg>;
}
function TenantsIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><rect x="2.5" y="4" width="6" height="13" rx="1" /><rect x="11.5" y="8" width="6" height="9" rx="1" /><path d="M4.5 7.5h2M4.5 10h2M4.5 12.5h2" /></svg>;
}
function PlansIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6Z" /><path d="M3 6l7 3.5L17 6M10 9.5V17" /></svg>;
}
function SubscriptionsIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><rect x="2.5" y="4" width="15" height="12" rx="1.5" /><path d="M2.5 8h15" /><path d="M5.5 11.5h3" /></svg>;
}
function StorageIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><ellipse cx="10" cy="5" rx="7" ry="2.5" /><path d="M3 5v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5" /><path d="M3 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></svg>;
}
function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path strokeLinecap="round" d="M3 5.5h14M3 10h14M3 14.5h14" /></svg>;
}
function CloseIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" /></svg>;
}
