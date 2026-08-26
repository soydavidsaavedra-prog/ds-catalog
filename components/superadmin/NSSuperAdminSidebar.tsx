"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { superadminLogoutAction } from "@/app/superadmin/actions";
import { cn } from "@/lib/utils/cn";

const COLLAPSE_KEY = "ds-superadmin-sidebar-collapsed";
const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 80;

interface NavLink {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

const GROUPS: NavGroup[] = [
  { label: "Plataforma", links: [{ href: "/superadmin", label: "Dashboard", icon: DashboardIcon }] },
  {
    label: "Gestión",
    links: [
      { href: "/superadmin/tenants", label: "Clientes", icon: TenantsIcon },
      { href: "/superadmin/plans", label: "Planes", icon: PlansIcon },
      { href: "/superadmin/subscriptions", label: "Suscripciones", icon: SubscriptionsIcon },
    ],
  },
  {
    label: "Sistema",
    links: [
      { href: "/superadmin/storage", label: "Storage", icon: StorageIcon },
      { href: "/superadmin/configuracion", label: "Configuración", icon: SettingsIcon },
    ],
  },
];

export function NSSuperAdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 text-foreground lg:hidden">
        <div className="flex items-center gap-2">
          <DSPlatformMark className="h-7 w-7" />
          <span className="text-xs font-semibold uppercase tracking-widest">DS Catalog · Super Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface text-foreground lg:hidden"
          >
            <SidebarInner email={email} pathname={pathname} collapsed={false} onNavigate={() => setIsOpen(false)} onCloseMobile={() => setIsOpen(false)} />
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <motion.aside
        animate={{ width: hydrated && collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        initial={false}
        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
        className="hidden shrink-0 border-r border-border bg-surface text-foreground lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col"
      >
        <SidebarInner email={email} pathname={pathname} collapsed={hydrated && collapsed} onToggleCollapse={toggleCollapsed} />
      </motion.aside>
    </>
  );
}

function SidebarInner({
  email,
  pathname,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onCloseMobile,
}: {
  email: string;
  pathname: string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onCloseMobile?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <DSPlatformMark className="h-8 w-8 shrink-0" />
          {!collapsed ? (
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-xs font-semibold uppercase tracking-widest text-foreground">DS Catalog</span>
              <span className="mt-1 text-[10px] text-muted-foreground">Super Admin</span>
            </div>
          ) : null}
        </div>
        {onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const active = link.href === "/superadmin" ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <SidebarNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    Icon={link.icon}
                    active={active}
                    collapsed={collapsed}
                    onClick={onNavigate}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border bg-surface-elevated/40 p-3">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={cn(
              "mb-1 flex w-full items-center gap-3 rounded-control px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <CollapseIcon className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed ? "Colapsar" : null}
          </button>
        ) : null}
        {!collapsed ? <p className="truncate px-3 py-1 text-xs text-muted-foreground">{email}</p> : null}
        <form action={superadminLogoutAction}>
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 rounded-control px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-danger",
              collapsed && "justify-center px-0",
            )}
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            {!collapsed ? "Cerrar sesión" : null}
          </button>
        </form>
      </div>
    </>
  );
}

function SidebarNavLink({
  href,
  label,
  Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active ? (
        <motion.span
          layoutId="ns-superadmin-sidebar-active"
          className="absolute inset-0 rounded-control bg-accent/15 ring-1 ring-inset ring-accent/25"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      ) : null}
      <Icon className={cn("relative z-10 h-4 w-4 shrink-0", active && "text-accent-strong")} />
      {!collapsed ? <span className="relative z-10 truncate">{label}</span> : null}
    </Link>
  );
}

function iconProps() {
  return { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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
function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="10" r="2.6" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" /></svg>;
}
function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M3 5.5h14M3 10h14M3 14.5h14" /></svg>;
}
function CloseIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M5 5l10 10M15 5L5 15" /></svg>;
}
function CollapseIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M13 4.5 7 10l6 5.5" /><path d="M4.5 4.5v11" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M8 4H5.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1H8" /><path d="M13 13.5 17 10l-4-3.5" /><path d="M17 10H8" /></svg>;
}
