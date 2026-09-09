/**
 * Slugs that would collide with a top-level static route under app/ (i.e.
 * everything that isn't app/[tenant]/...). Next.js always prefers a static
 * route over a dynamic segment, so a tenant registered with one of these
 * as its slug would be unreachable at its own root URL. Shared by every
 * place a tenant slug gets chosen — self-registration (app/registro) and
 * Super Admin's manual tenant creation (app/superadmin) — so the list
 * can't drift out of sync between the two the way it once did ("acceder"
 * and "superadmin" were missing from registro's own copy). Keep in sync
 * with any new top-level directory added under app/.
 */
export const RESERVED_SLUGS = new Set(["registro", "acceder", "superadmin"]);
