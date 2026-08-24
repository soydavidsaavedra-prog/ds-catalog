# Arquitectura — El Nuevo Sánchez

Registro de decisiones técnicas y guía para continuar el proyecto. Ver también
`docs/ROADMAP.md` para el estado de cada fase.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Sin
dependencias que no aportaran valor directo:

- `zustand` — carrito (estado + persistencia en localStorage).
- `motion` (sucesor de framer-motion) — sistema de movimiento.
- `clsx` + `tailwind-merge` — composición de clases (`lib/utils/cn.ts`).
- `server-only` — evita que módulos de servidor (repositorios, auth) se
  cuelen en el bundle de cliente.

Nada de Three.js/R3F, CMS externo, ni librerías de animación adicionales:
no aportaban valor todavía (ver sección "3D" abajo).

## Estructura

```
app/
  layout.tsx              — root layout mínimo (html/body/fuentes), sin chrome
  (storefront)/            — grupo de rutas con Header/Footer/Carrito/WhatsApp
    page.tsx                — home
    catalogo/               — catálogo completo
    [category]/              — páginas de categoría (mismo motor que /catalogo)
    producto/[slug]/          — ficha de producto
  admin/
    login/                   — login (público)
    (shell)/                 — panel con sidebar (protegido por middleware)
    api/upload/               — subida de imágenes
components/
  ui/        — átomos de diseño (NSButton, NSBadge, NSInput, NSMedia...)
  brand/     — NSLogo
  layout/    — header/footer/nav
  home/      — secciones de la home
  catalog/   — motor de catálogo (grid, filtros, búsqueda)
  product/   — galería, variantes, compra
  cart/      — carrito
  whatsapp/  — botón de WhatsApp
  admin/     — formularios y UI del panel
lib/
  config/site.ts        — configuración central de marca (nunca hardcodear)
  types/                 — contratos de datos (Product, Category, Order...)
  data/seed/             — datos de demostración
  db/supabaseClient.ts    — cliente Supabase server-only (service_role)
  db/supabase-types.ts    — tipos Row/Insert/Update hechos a mano (ver abajo)
  repositories/           — CRUD por entidad, la única puerta a los datos
  search/catalog-engine.ts — filtrado/orden/búsqueda, compartido por todas las rutas de catálogo
  cart/cart-store.ts       — estado del carrito
  whatsapp/order-message.ts — plantilla del pedido
  auth/                   — sesión de administrador
  media/placeholder.ts     — arte de reemplazo mientras no hay fotos reales
```

## Capa de datos: Supabase (Postgres)

El admin persiste sobre un proyecto Supabase propio del usuario (tablas
nuevas, sin tocar datos de proyectos anteriores). El esquema completo vive en
`supabase/schema.sql` — se ejecuta una sola vez en el SQL Editor de Supabase.

- `lib/db/supabaseClient.ts` crea un cliente **server-only**, autenticado con
  `SUPABASE_SERVICE_ROLE_KEY`, que evita RLS por completo. Las tablas tienen
  RLS activado sin policies: solo el service_role (usado exclusivamente en el
  servidor) puede leer/escribir. La anon key nunca se usa desde el cliente.
- `lib/db/supabase-types.ts` define el tipo `Database` a mano (Row/Insert/Update
  por tabla) para que `@supabase/supabase-js` infiera tipos correctos en
  `.select()/.insert()/.update()`.
- Cada `lib/repositories/*.ts` expone solo funciones async (`listX`, `getXBySlug`,
  `createX`, `updateX`, `deleteX`) que traducen entre las filas de Postgres
  (snake_case) y los tipos de la app (camelCase) — ningún componente toca
  Supabase directamente.
- `npm run seed:supabase` (`scripts/seed-supabase.ts`) puebla el catálogo de
  demo (upsert por slug/id, seguro de re-ejecutar).

Variables de entorno requeridas (ver `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — deben
configurarse tanto en `.env.local` (desarrollo) como en Vercel → Project
Settings → Environment Variables (producción); sin ellas el build falla en
`generateStaticParams`.

## Autenticación de administrador

Sin proveedor externo, sin cuentas de comprador. Una sola contraseña
(`ADMIN_PASSWORD`, con fallback de desarrollo inseguro documentado en
`lib/auth/admin-token.ts`) más una cookie firmada (hash SHA-256 vía Web
Crypto, compatible con Edge y Node). `middleware.ts` protege todo `/admin/*`
excepto `/admin/login`; `app/admin/(shell)/layout.tsx` repite la verificación
del lado del servidor como defensa en profundidad.

**Antes de desplegar a producción**: define `ADMIN_PASSWORD` y
`ADMIN_SESSION_SECRET` en las variables de entorno reales.

## Motor de medios / placeholders

No hay fotografía real todavía. `images[0]` de cada producto/categoría/banner
de demo usa el esquema `placeholder:<categoria>:<seed>`. `NSMedia` detecta
ese esquema y dibuja `NSPlaceholderArt` (SVG generado: degradado denim,
líneas de costura, monograma NS) en vez de una foto rota — es un estado de
diseño intencional, no un placeholder roto. En cuanto el admin sube una foto
real (`/admin/api/upload`, guarda en el bucket público `ns-product-images` de
Supabase Storage), `images[0]` pasa a ser una URL normal y `NSMedia` renderiza
`next/image` sin tocar ningún componente.

## Logo

El logo oficial se compartió como imagen en el chat, no como archivo en el
repositorio — no hay forma de leerlo desde disco. `components/brand/NSLogo.tsx`
es una **recreación fiel en SVG** (aro dorado, texto en arco, monograma NS)
para no dejar la marca sin identidad visual mientras tanto. Está documentado
en el propio archivo: en cuanto exista `public/brand/logo.png` (o `.svg`),
reemplazar el `<svg>` interno por una `<Image>` apuntando a ese archivo.

## WhatsApp

Un solo lugar para el número: `lib/config/site.ts` (`NEXT_PUBLIC_WHATSAPP_NUMBER`)
y `SiteSettings.whatsappNumber` (editable desde `/admin/configuracion`, con
persistencia real). `lib/whatsapp/order-message.ts` arma el mensaje exacto
pedido en el brief, con link a cada producto. Nunca hardcodear el número en
un componente.

## Carrito

`lib/cart/cart-store.ts` — Zustand + `persist` en localStorage. Cada línea
identifica el producto por `productId + talla + color`
(`cartItemKey`), así que la misma prenda en dos tallas son líneas distintas.

## SEO

- `app/sitemap.ts` y `app/robots.ts` generados desde los repositorios
  (excluye `/admin`).
- `generateMetadata` por producto y categoría (OG, Twitter card, canonical).
- **Gotcha documentado**: un `loading.tsx` en un segmento de ruta activa
  streaming (Suspense) para ese segmento. Si la página puede llamar a
  `notFound()`, el navegador ya recibió un `200` antes de que `notFound()`
  se resuelva, y el status code queda en 200 aunque el contenido sea la UI
  de 404. Por eso `producto/[slug]` y `[category]` **no** tienen
  `loading.tsx` — la corrección del status HTTP importa más que el
  esqueleto de carga en rutas que sí verifican existencia. `/catalogo` sí
  puede tenerlo porque nunca llama a `notFound()`.

## Importación masiva (pendiente de implementar)

La arquitectura ya lo permite sin cambios de esquema: un endpoint
`/admin/api/import` que reciba un CSV con las mismas columnas del tipo
`Product` (referencia, nombre, categoría, precio, descripción, tallas,
colores, disponibilidad, imagen) y llame a `createProduct`/`updateProduct`
en bucle. No se implementó todavía porque no bloquea el funcionamiento
principal, tal como indicó el brief; es la primera tarea recomendada al
recibir el catálogo real de 200–300 productos.

## Lo que falta para producción

1. Reemplazar el logo recreado por el archivo oficial.
2. Migrar `.data/*.json` a Postgres/Supabase (o similar) — requiere que el
   usuario cree la cuenta y comparta credenciales.
3. Definir `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
   `NEXT_PUBLIC_SITE_URL` reales en el entorno de despliegue.
4. Fotografía real de producto (o CGI real) reemplazando los placeholders.
5. Importación masiva del catálogo real (CSV, ver arriba).
6. Opcional: escena 3D real en el Hero — la sección ya está aislada
   (`components/home/NSHero.tsx`) para que un `<Scene3D>` cargado con
   `next/dynamic` reemplace `NSPlaceholderArt` sin tocar el resto de la home.
