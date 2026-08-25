# DS Catalog

Plataforma multi-tenant de catálogo, ecommerce conversacional (WhatsApp) y
panel administrativo. Un solo motor (este código) aloja varios catálogos
independientes, cada uno bajo `/{tenant-slug}` (ej. `/elnuevosanchez`,
`/demo`) con sus propios productos, categorías, banners, configuración,
imágenes, carrito y administración. Ver `docs/ARCHITECTURE.md` para las
decisiones técnicas y `docs/ROADMAP.md` para el estado del proyecto.

## Getting Started

1. Crea un proyecto en [supabase.com](https://supabase.com) (o usa uno existente).
2. Abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql`
   y ejecútalo una vez. Crea las tablas (`ds_tenants`, `ns_categories`,
   `ns_products`, `ns_banners`, `ns_orders`, `ns_settings` — prefijo `ns_`
   para no chocar con tablas de otros proyectos en el mismo Supabase), el
   tenant `elnuevosanchez`, y el bucket público `ns-product-images`.
   Vuelve a correr este mismo script cada vez que actualices el código —
   es idempotente (usa `if not exists` / `add column if not exists` en
   todo) y nunca borra datos.
3. En **Project Settings → API**, copia `Project URL`, `anon public key` y
   `service_role key` a un `.env.local` en la raíz (ver `.env.example`).
4. Instala dependencias, siembra el catálogo de demo de El Nuevo Sánchez y arranca:

```bash
npm install
npm run seed:supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — la raíz es una
landing mínima de DS Catalog, no la tienda. La tienda de El Nuevo Sánchez
vive en [http://localhost:3000/elnuevosanchez](http://localhost:3000/elnuevosanchez)
y su panel en
[http://localhost:3000/elnuevosanchez/admin](http://localhost:3000/elnuevosanchez/admin)
(contraseña por defecto en desarrollo: `elnuevosanchez2026` — ver Variables
de entorno abajo; es la misma contraseña para cualquier tenant por ahora,
solo la *sesión* queda separada por tenant).

Para crear un segundo tenant de prueba (`/demo`) con datos mínimos y
distintos a los de El Nuevo Sánchez:

```bash
npm run seed:demo-tenant
```

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — sirve el build de producción
- `npm run lint` — ESLint
- `npm run seed:supabase` — puebla el catálogo de El Nuevo Sánchez en Supabase (seguro de re-ejecutar)
- `npm run seed:demo-tenant` — crea el tenant `demo` con datos de prueba mínimos (seguro de re-ejecutar)

## Variables de entorno

Las variables de Supabase son **obligatorias** (no tienen default); el resto
tiene un valor de desarrollo pero **debe configurarse antes de desplegar**:

| Variable | Uso | Default de desarrollo |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | — (obligatoria) |
| `SUPABASE_ANON_KEY` | Clave anon del proyecto — usada solo desde el servidor (nunca llega al navegador) para el login/registro/recuperar contraseña vía Supabase Auth, ver `lib/auth/supabase-auth.ts` | — (obligatoria) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio, solo servidor — evita RLS | — (obligatoria, secreta) |
| `ADMIN_PASSWORD` | Secreto de respaldo para firmar la cookie de sesión admin si no se define `ADMIN_SESSION_SECRET` — ya no es una contraseña de login (login real es por correo, ver `/acceder`) | `elnuevosanchez2026` |
| `ADMIN_SESSION_SECRET` | Firma de la cookie de sesión admin (además del tenant, ver abajo) | usa `ADMIN_PASSWORD` |
| `SUPERADMIN_SESSION_SECRET` | Firma de la cookie de sesión de Super Admin | — (obligatoria, sin fallback inseguro) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp por defecto (solo dígitos, con código de país) — cada tenant lo sobreescribe desde su propio `/admin/configuracion` | `584121234567` |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | Número formateado por defecto | `+58 412 123 4567` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email de contacto por defecto | `ventas@elnuevosanchez.com` |
| `NEXT_PUBLIC_SITE_URL` | Dominio base de la plataforma (usado en sitemap, OG, links de WhatsApp) — cada tenant vive en `{este dominio}/{tenant-slug}`, ninguno tiene dominio propio todavía | `https://ds-catalog.vercel.app` |

En Vercel, configura las mismas variables en **Project Settings →
Environment Variables** — sin las 3 de Supabase el build falla (páginas de
producto/categoría usan `generateStaticParams`, que consulta la base de
datos en build time).

El número de WhatsApp y los datos de marca de cada tenant son editables en
caliente desde `/{tenant}/admin/configuracion`, sin redeploy.

## Notas

- Los datos (tenants, productos, categorías, banners, pedidos,
  configuración) se persisten en Supabase (Postgres), aislados por
  `tenant_id` en cada tabla — ver "Multi-tenancy" en `docs/ARCHITECTURE.md`.
  Las imágenes subidas desde el admin van al bucket público
  `ns-product-images` de Supabase Storage, con el slug del tenant como
  prefijo del path.
- La contraseña de admin es hoy compartida entre tenants (solo la sesión
  queda separada por tenant); credenciales realmente distintas por tenant
  son el siguiente paso natural — ver `ds_tenants.admin_password_hash` en
  `supabase/schema.sql`, ya reservado pero sin usar todavía.
- Colores y tipografía son hoy los mismos para todos los tenants (tokens
  de Tailwind compilados, no leídos de la base de datos); solo el
  contenido (textos, logo, imágenes) varía por tenant.
