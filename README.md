# DS Catalog

[![CI](https://github.com/soydavidsaavedra-prog/ds-catalog/actions/workflows/ci.yml/badge.svg)](https://github.com/soydavidsaavedra-prog/ds-catalog/actions/workflows/ci.yml)

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
- `npm test` — suite de Vitest
- `npm run test:e2e` — suite de Playwright (ver "Tests E2E" abajo)
- `npm run seed:supabase` — puebla el catálogo de El Nuevo Sánchez en Supabase (seguro de re-ejecutar)
- `npm run seed:demo-tenant` — crea el tenant `demo` con datos de prueba mínimos (seguro de re-ejecutar)

## CI

`.github/workflows/ci.yml` corre lint, `tsc --noEmit` y la suite de Vitest en cada push y pull request — sin necesitar credenciales de Supabase, así que no requiere ningún secret configurado en GitHub. El build real (`next build`, con datos reales de Supabase) lo sigue haciendo Vercel automáticamente en cada PR — ver el check "Vercel" en la pestaña de checks.

## Tests E2E (Playwright)

`e2e/` corre contra un servidor real (`npm run dev`) y **Supabase real** —
a diferencia de la suite de Vitest, no hay modo simulado: el objetivo es
probar los flujos de login/2FA/rate limiting/importación CSV tal como
los usa un cliente de verdad.

```
npm run test:e2e
```

Antes de correrlo:

1. `.env.local` con credenciales reales de Supabase (las mismas que usa
   `npm run dev`) — el proyecto debe tener corridas las migraciones de
   `supabase/schema.sql`, en particular `ds_login_attempts` y
   `ds_totp_backup_codes`.
2. Nada más — `e2e/setup/global-setup.ts` crea automáticamente (y
   `global-teardown.ts` borra al terminar) un tenant de prueba
   (`e2e-test-tienda`) con una categoría, su dueño, y una cuenta de Super
   Admin **separada y desechable** solo para las pruebas de 2FA — nunca
   toca cuentas reales.

Qué cubre cada spec:

- `login.spec.ts` — credenciales inválidas vs. login exitoso del dueño de un tenant.
- `rate-limit.spec.ts` — bloqueo tras 5 intentos fallidos.
- `super-admin-2fa.spec.ts` — ciclo completo: activar 2FA (con
  `e2e/setup/totp.ts`, un generador TOTP propio verificado contra los
  vectores de prueba oficiales de RFC 4226, calculando códigos válidos
  sin necesitar una app autenticadora real), login con código, código de
  respaldo, y desactivar.
- `product-import.spec.ts` — sube `e2e/fixtures/products.csv` y verifica
  que los productos aparezcan en el catálogo.

**Nota sobre este entorno de desarrollo (sandbox):** esta suite no pudo
validarse aquí — la política de red de este sandbox bloquea el acceso a
Supabase, y a diferencia del build de Next.js (que falla rápido con un
mensaje claro), el arranque del servidor de desarrollo se queda colgado
indefinidamente esperando una respuesta que nunca llega, porque hasta la
página de inicio necesita datos de Supabase. El código se revisó
cuidadosamente contra los selectores reales del DOM de cada componente,
y el generador TOTP se verificó con tests unitarios contra los vectores
oficiales de RFC 4226 — pero la ejecución real de principio a fin
todavía no se confirmó. Corre `npm run test:e2e` en un entorno con
acceso de red real antes de confiar en ella para CI/CD.

## Dominio propio por tenant

Cada tenant puede conectar su propio dominio (ej. `tutienda.com`) desde
`/{tenant}/admin/dominio`, para que su catálogo se vea ahí en vez de bajo
`{este dominio}/{tenant-slug}`. Internamente, `middleware.ts` reescribe
cada request que llega por un dominio propio verificado hacia la ruta
`/{tenant-slug}/...` normal — el resto de la app nunca sabe que la
petición llegó por un dominio distinto.

Cómo funciona:

1. El tenant escribe su dominio en `/admin/dominio`. Si `VERCEL_API_TOKEN`
   y `VERCEL_PROJECT_ID` están configurados, la app lo agrega
   automáticamente al proyecto de Vercel vía su [API de
   dominios](https://vercel.com/docs/rest-api/reference/endpoints/domains)
   — agregar un dominio a Vercel es lo que realmente hace que su red lo
   sirva; un registro DNS correcto por sí solo no basta.
2. La página muestra las instrucciones DNS (registro `A` para un dominio
   raíz, `CNAME` para un subdominio) y un botón "Verificar" que vuelve a
   consultar a Vercel hasta confirmar que el DNS ya apunta correctamente.
3. Solo un dominio **verificado** es enrutado — `ds_tenants.custom_domain_verified`
   controla esto, y `middleware.ts` nunca sirve tráfico para un dominio
   sin verificar ni para un tenant que no esté `active`.

Sin `VERCEL_API_TOKEN`/`VERCEL_PROJECT_ID` configurados, un tenant todavía
puede guardar su dominio (queda pendiente) pero la verificación automática
no está disponible — el operador de la plataforma debe agregarlo a mano
desde el dashboard de Vercel y no hay forma de marcarlo verificado desde
la app en ese caso; ver `lib/domains/vercel-domains.ts`.

Super Admin puede ver el dominio de cualquier tenant y quitarlo (soporte,
abuso) desde el detalle del tenant, sin necesitar impersonarlo.

**Nota sobre este entorno de desarrollo (sandbox):** la integración con la
API de Vercel y la reescritura de `middleware.ts` no pudieron probarse
end-to-end aquí — la política de red de este sandbox bloquea tanto
Supabase como probablemente la API de Vercel (ver la nota de la suite
Playwright más abajo). La lógica pura (normalización/validación de
dominios) sí tiene cobertura de Vitest. Antes de confiar en esta función
para tenants reales, pruébala en un entorno con acceso de red real:
guarda un dominio de prueba, sigue las instrucciones DNS y confirma que
"Verificar" lo marca como verificado y que el catálogo carga en ese
dominio.

## Notificaciones

Cuando un negocio termina el registro/onboarding en `/registro`, su
suscripción queda en estado `pending` — necesita que un Super Admin la
revise y active antes de que el panel/catálogo sean usables (ver
`lib/tenant/plan-limits.ts`). Para no depender de entrar a
`/superadmin/tenants` a chequear manualmente, la app envía un correo a
**todos** los Super Admin en cuanto eso pasa (`lib/notifications/`).

Usa la API de [Resend](https://resend.com) vía `fetch` directo (sin SDK).
Configura `RESEND_API_KEY` (de tu cuenta de Resend) y `RESEND_FROM_EMAIL`
(un remitente de un dominio que hayas verificado en Resend, ej.
`"DS Catalog <notificaciones@tudominio.com>"`). Sin esas dos variables,
el aviso solo se registra en los logs del servidor — el registro del
tenant nunca falla ni se bloquea por esto.

**Nota sobre este entorno de desarrollo (sandbox):** el envío real a
través de la API de Resend no se pudo probar aquí (mismo bloqueo de red
que el resto del proyecto). La lógica de construcción del correo
(asunto/HTML, incluyendo el escape contra inyección de HTML) sí tiene
cobertura de Vitest. Antes de confiar en esto para avisos reales,
regístrate como tenant de prueba en un entorno con acceso real y confirma
que el correo llega.

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
| `NEXT_PUBLIC_SITE_URL` | Dominio base de la plataforma (usado en sitemap, OG, links de WhatsApp) — cada tenant vive en `{este dominio}/{tenant-slug}` salvo que haya conectado su propio dominio (ver "Dominio propio por tenant" abajo) | `https://ds-catalog.vercel.app` |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN del proyecto en [sentry.io](https://sentry.io) — activa la captura de errores (cliente, servidor y Edge). Sin definir, el SDK queda instalado pero inactivo (no envía nada) | — (opcional) |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Solo para subir source maps al build (stack traces legibles en el dashboard de Sentry en vez de código minificado) — sin `SENTRY_AUTH_TOKEN` el build simplemente omite ese paso | — (opcionales) |
| `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | Ver "Dominio propio por tenant" abajo — sin `VERCEL_API_TOKEN`/`VERCEL_PROJECT_ID`, un tenant puede guardar su dominio pero queda en modo DNS manual (el operador lo agrega a mano desde el dashboard de Vercel) | — (opcionales) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Ver "Notificaciones" abajo — sin estas, el aviso de nuevo registro solo queda en los logs, nunca falla el registro del tenant | — (opcionales) |

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
- `/admin/productos/lote-fotos` crea productos en lote a partir de fotos:
  una foto = un producto en **borrador** (`active: false`, oculto del
  catálogo público), con nombre provisional tomado del archivo, referencia
  secuencial y precio en 0 — pensado para "subo 100 fotos, luego edito
  cada uno". Ver `lib/products/image-batch.ts` (lógica pura, con tests) y
  `components/admin/NSProductBatchForm.tsx` (sube las imágenes una por una
  al mismo endpoint de siempre y respeta el límite de productos del plan,
  igual que la importación por CSV). Los borradores se encuentran filtrando
  por "Inactivos" en la tabla de productos.
- Páginas legales (Términos y Política de Privacidad) son opcionales y de
  texto libre, en dos niveles: cada tenant tiene las suyas propias (para
  sus clientes, editables desde `/admin/configuracion` → "Legal",
  visibles en `/{tenant}/terminos` y `/{tenant}/privacidad`), y la
  plataforma tiene las suyas (para quien se registra en `/registro`,
  editables desde `/superadmin/configuracion`, visibles en `/terminos` y
  `/privacidad`). Vacío = la página y su enlace en el footer no existen
  — **esta app nunca escribe contenido legal por defecto**; el texto lo
  define el dueño del negocio (o su abogado), no una plantilla generada.
- `/superadmin/auditoria` registra quién hizo qué desde Super Admin
  (cambios de estado/plan/theme de un cliente, eliminación de cuentas,
  impersonación, cambios de configuración de la plataforma, etc.) — ver
  `lib/audit/audit-log.ts`. Es de solo escritura desde la app (no hay
  edición ni borrado) y no depende de que el tenant referenciado siga
  existiendo, para que el historial de una eliminación sobreviva a la
  eliminación misma.
