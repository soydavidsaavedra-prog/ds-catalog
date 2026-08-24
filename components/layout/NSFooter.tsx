import Link from "next/link";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import { listCategories } from "@/lib/repositories/category-repository";
import { getSettings } from "@/lib/repositories/settings-repository";
import { NSLogo } from "@/components/brand/NSLogo";

export async function NSFooter({ tenantSlug }: { tenantSlug: string }) {
  const tenant = await resolveTenant(tenantSlug);
  const [categories, settings] = await Promise.all([
    listCategories(tenant.id, { activeOnly: true }),
    getSettings(tenant.id),
  ]);
  const topLevelCategories = categories.filter((c) => c.parentId === null);
  const subcategories = categories.filter((c) => c.parentId !== null);
  const base = `/${tenantSlug}`;

  return (
    <footer id="contacto" className="border-t border-ink-800 bg-ink-950 text-ink-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <NSLogo id="ns-footer" variant="full" className="text-ink-0" src={settings.brandLogo} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            {settings.brandDescription}
          </p>
          <div className="mt-5 flex gap-4">
            {settings.instagram ? (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink-400 hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.4.42.6.24 1 .53 1.5 1a4 4 0 0 1 1 1.5c.17.4.36 1.2.42 2.4.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.42 2.4a4 4 0 0 1-1 1.5 4 4 0 0 1-1.5 1c-.4.17-1.2.36-2.4.42-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.4-.42a4 4 0 0 1-1.5-1 4 4 0 0 1-1-1.5c-.17-.4-.36-1.2-.42-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .42-2.4a4 4 0 0 1 1-1.5 4 4 0 0 1 1.5-1c.4-.17 1.2-.36 2.4-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5 0-4.8.07-1 .05-1.5.2-1.9.35-.47.18-.8.4-1.16.75-.35.35-.57.68-.75 1.15-.15.4-.3.9-.35 1.9C3 9.5 3 9.86 3 13s0 3.5.06 4.8c.05 1 .2 1.5.35 1.9.18.47.4.8.75 1.16.35.35.68.57 1.15.75.4.15.9.3 1.9.35 1.3.06 1.66.06 4.8.06s3.5 0 4.8-.06c1-.05 1.5-.2 1.9-.35.47-.18.8-.4 1.16-.75.35-.35.57-.68.75-1.15.15-.4.3-.9.35-1.9.06-1.3.06-1.66.06-4.8s0-3.5-.06-4.8c-.05-1-.2-1.5-.35-1.9a3 3 0 0 0-.75-1.16 3 3 0 0 0-1.15-.75c-.4-.15-.9-.3-1.9-.35C15.5 4 15.14 4 12 4Zm0 3.5a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-2a1.24 1.24 0 1 1 0 2.48 1.24 1.24 0 0 1 0-2.48Z" />
                </svg>
              </a>
            ) : null}
            {settings.facebook ? (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ink-400 hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M13.5 21.9v-8.1h2.7l.4-3.2h-3.1V8.5c0-.9.25-1.6 1.6-1.6h1.7V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7v8.1h3.4Z" />
                </svg>
              </a>
            ) : null}
            {settings.tiktok ? (
              <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-ink-400 hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M16.6 2h-3.2v13.7a2.7 2.7 0 1 1-2-2.6v-3.3a6 6 0 1 0 5.2 5.9V9.1a7.6 7.6 0 0 0 4.4 1.4V7.3a4.4 4.4 0 0 1-4.4-4.4V2Z" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-0">Catálogo</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href={`${base}/catalogo`} className="hover:text-accent">Ver todo</Link></li>
            {topLevelCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`${base}/${c.slug}`} className="hover:text-accent">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-0">Colecciones</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {subcategories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`${base}/${c.slug}`} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-0">Contacto</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-400">
            {settings.whatsappDisplay ? <li>{settings.whatsappDisplay}</li> : null}
            {settings.contactEmail ? (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-accent">
                  {settings.contactEmail}
                </a>
              </li>
            ) : null}
            {settings.contactAddress ? (
              <li>
                {settings.contactMapsUrl ? (
                  <a href={settings.contactMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {settings.contactAddress}
                  </a>
                ) : (
                  settings.contactAddress
                )}
              </li>
            ) : null}
          </ul>
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-control bg-accent px-5 text-xs font-semibold uppercase tracking-wide text-accent-foreground hover:bg-accent-strong"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-ink-800 px-4 py-6 text-center text-xs text-ink-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {settings.brandName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
