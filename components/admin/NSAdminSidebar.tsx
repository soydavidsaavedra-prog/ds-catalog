"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { NSLogo } from "@/components/brand/NSLogo";
import { DSPlatformMark } from "@/components/brand/DSPlatformMark";
import { NSWhatsAppButton } from "@/components/whatsapp/NSWhatsAppButton";
import { logoutAction, endImpersonationAction } from "@/app/[tenant]/admin/actions";
import { cn } from "@/lib/utils/cn";

const COLLAPSE_KEY = "ds-admin-sidebar-collapsed";
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

export function NSAdminSidebar({
  tenantSlug,
  logoSrc,
  brandName,
  tagline,
  impersonating = false,
  supportWhatsappNumber,
}: {
  tenantSlug: string;
  logoSrc?: string;
  brandName: string;
  tagline: string;
  /** True when this session was opened via Super Admin's "Administrar catálogo" — see app/superadmin/actions.ts impersonateTenantAction. Swaps the footer for a clearly-labeled exit back to Super Admin instead of a normal logout, so no one mistakes this for the tenant's own session. */
  impersonating?: boolean;
  /** Platform-wide support number (lib/repositories/platform-settings-repository.ts) — unrelated to this tenant's own WhatsApp for taking orders. Empty until a Super Admin sets one in /superadmin/configuracion. */
  supportWhatsappNumber?: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const base = `/${tenantSlug}/admin`;

  const groups: NavGroup[] = [
    { label: "Overview", links: [{ href: base, label: "Dashboard", icon: DashboardIcon }] },
    {
      label: "Catálogo",
      links: [
        { href: `${base}/productos`, label: "Productos", icon: ProductIcon },
        { href: `${base}/categorias`, label: "Categorías", icon: CategoryIcon },
      ],
    },
    { label: "Ventas", links: [{ href: `${base}/pedidos`, label: "Pedidos", icon: OrderIcon }] },
    { label: "Personalización", links: [{ href: `${base}/inicio`, label: "Inicio", icon: HomeIcon }] },
    {
      label: "Configuración",
      links: [
        { href: `${base}/configuracion`, label: "Configuración", icon: SettingsIcon },
        { href: `${base}/cuenta`, label: "Mi cuenta", icon: AccountIcon },
      ],
    },
  ];

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
          <NSLogo id="ns-admin-mobile" variant="mark" className="h-7 w-7" src={logoSrc} brandName={brandName} tagline={tagline} />
          <span className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {brandName}
          </span>
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

      {/* Mobile drawer — motion-driven, independent of the desktop rail below (which never translates, only changes width). */}
      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface text-foreground lg:hidden"
          >
            <SidebarInner
              tenantSlug={tenantSlug}
              logoSrc={logoSrc}
              brandName={brandName}
              tagline={tagline}
              impersonating={impersonating}
              supportWhatsappNumber={supportWhatsappNumber}
              groups={groups}
              pathname={pathname}
              collapsed={false}
              onNavigate={() => setIsOpen(false)}
              onCloseMobile={() => setIsOpen(false)}
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <motion.aside
        animate={{ width: hydrated && collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        initial={false}
        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
        className="hidden shrink-0 border-r border-border bg-surface text-foreground lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col"
      >
        <SidebarInner
          tenantSlug={tenantSlug}
          logoSrc={logoSrc}
          brandName={brandName}
          tagline={tagline}
          impersonating={impersonating}
          supportWhatsappNumber={supportWhatsappNumber}
          groups={groups}
          pathname={pathname}
          collapsed={hydrated && collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </motion.aside>
    </>
  );
}

function SidebarInner({
  tenantSlug,
  logoSrc,
  brandName,
  tagline,
  impersonating,
  supportWhatsappNumber,
  groups,
  pathname,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onCloseMobile,
}: {
  tenantSlug: string;
  logoSrc?: string;
  brandName: string;
  tagline: string;
  impersonating?: boolean;
  supportWhatsappNumber?: string;
  groups: NavGroup[];
  pathname: string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  onCloseMobile?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <DSPlatformMark className="h-5 w-5 shrink-0 opacity-80" />
          {!collapsed ? (
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              DS Catalog
            </span>
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

      {/* Workspace block — the tenant's own identity, deliberately set apart (its own surface tone) from the DS Catalog chrome around it: this is "DS Catalog, managing the {brandName} storefront," not a {brandName}-branded app. */}
      <div className={cn("border-b border-border p-3", collapsed && "px-2")}>
        <div className={cn("flex items-center gap-2.5 rounded-control bg-surface-elevated p-2.5", collapsed && "justify-center px-1.5")}>
          <NSLogo id="ns-admin" variant="mark" className="h-8 w-8 shrink-0" src={logoSrc} brandName={brandName} tagline={tagline} />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{brandName}</p>
              <Link
                href={`/${tenantSlug}`}
                target="_blank"
                className="truncate text-xs text-muted-foreground transition-colors hover:text-accent-strong"
              >
                Ver sitio ↗
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {impersonating ? (
        <div
          className={cn(
            "border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-warning",
            collapsed && "px-1",
          )}
        >
          {collapsed ? "SA" : "Sesión vía Super Admin"}
        </div>
      ) : null}

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const active = link.href === `/${tenantSlug}/admin` ? pathname === link.href : pathname.startsWith(link.href);
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
        <Link
          href={`/${tenantSlug}`}
          target="_blank"
          className={cn(
            "flex items-center gap-3 rounded-control px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ExternalIcon className="h-4 w-4 shrink-0" />
          {!collapsed ? "Ver sitio" : null}
        </Link>
        {supportWhatsappNumber ? (
          <NSWhatsAppButton
            whatsappNumber={supportWhatsappNumber}
            message={`Hola, necesito soporte con mi cuenta de DS Catalog (${tenantSlug}).`}
            variant="inline"
            className={cn(
              "w-full rounded-control px-3 py-2 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {!collapsed ? "Contactar soporte" : ""}
          </NSWhatsAppButton>
        ) : null}
        {impersonating ? (
          <form action={endImpersonationAction}>
            <button
              type="submit"
              className={cn(
                "w-full rounded-control px-3 py-2 text-left text-xs font-semibold text-warning transition-colors hover:text-accent-strong",
                collapsed && "text-center",
              )}
            >
              {collapsed ? "↩" : "← Volver a Super Admin"}
            </button>
          </form>
        ) : (
          <form action={logoutAction.bind(null, tenantSlug)}>
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
        )}
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
          layoutId="ns-admin-sidebar-active"
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
function SettingsIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="10" r="2.6" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" /></svg>;
}
function AccountIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><circle cx="10" cy="6.5" r="3" /><path d="M3.5 17c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" /></svg>;
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
function ExternalIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M8 5H5.5a1 1 0 0 0-1 1v8.5a1 1 0 0 0 1 1H14a1 1 0 0 0 1-1V12" /><path d="M11 4.5h4.5V9M15.2 4.8 9.5 10.5" /></svg>;
}
function LogoutIcon({ className }: { className?: string }) {
  return <svg className={className} {...iconProps()} aria-hidden><path d="M8 4H5.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1H8" /><path d="M13 13.5 17 10l-4-3.5" /><path d="M17 10H8" /></svg>;
}
