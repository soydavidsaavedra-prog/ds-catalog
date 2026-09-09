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

## Categorías jerárquicas (Dama/Caballero/Niño → subcategorías)

`Category` tiene un campo `parentId` (nullable, self-referencing vía
`ns_categories.parent_id`). Una categoría con `parentId: null` es principal
(ej. Dama); una con `parentId` apuntando a otra categoría es una subcategoría
(ej. Skinny bajo Dama). `buildCategoryTree()` en
`lib/repositories/category-repository.ts` agrupa la lista plana en árbol para
el admin y el header; `getDescendantSlugs()` resuelve los slugs de una
categoría principal + sus hijas, usado por `/[categoria]/page.tsx` (vía
`NSCatalogView`'s `forcedCategorySlugs`) para que la página de una categoría
principal agregue productos de todas sus subcategorías. Los productos siguen
apuntando a una sola categoría (la subcategoría, nivel hoja) — no hubo cambio
de esquema en `ns_products`. El campo `audience` (dama/caballero/nino/unisex)
sigue existiendo por separado como filtro rápido del catálogo — no se fusionó
con esta jerarquía para no arriesgar el filtrado existente.

## Portada del home editable (`/admin/inicio`)

El Hero (`components/home/NSHero.tsx`) recibe todo su contenido por props
(texto, imagen, posición) en lugar de tenerlo hardcodeado; los valores por
defecto de esas props son exactamente la copy original de lanzamiento, así
que el home no cambia visualmente hasta que un admin lo edite.
`SiteSettings` tiene los campos `hero*` (persistidos en `ns_settings`) y
`/admin/inicio` los edita con vista previa en vivo: el mismo componente
`<NSHero>` se renderiza dentro de una caja escalada con `transform: scale()`
(su altura usa `vh`, así que se ve auto-contenido y proporcional en el
panel). La imagen se sube al bucket `ns-product-images` de Supabase Storage
(mismo endpoint `/admin/api/upload` que usan los productos) y su posición se
ajusta con dos sliders (0-100%) que se traducen a `object-position` vía la
nueva prop `objectPosition` de `NSMedia`.

## Logo de marca e ícono de método de pago (Cashea)

Ambos son campos de `SiteSettings` (`brandLogo`, `paymentBadgeIcon`,
`paymentBadgeLabel`), subidos por el admin desde `/admin/configuracion` vía
`NSSingleImageUploader` (mismo endpoint `/admin/api/upload`, ahora también
acepta SVG). `NSLogo` recibe un `src` opcional: si `SiteSettings.brandLogo`
tiene una URL real, la renderiza directamente (el archivo subido ya trae el
mark + wordmark completos); si está vacío, cae al recreation en SVG de
siempre — cero riesgo de romper el branding mientras el admin no sube nada.

El ícono de pago se muestra vía `NSPaymentBadge` en tarjetas de producto y en
la ficha de producto — nada se ve si `paymentBadgeIcon` está vacío, y cada
producto puede ocultarlo individualmente con `Product.hidePaymentBadge`.
Importante: `NSProductCard`, `NSFeaturedProducts` y todo lo que cuelga de
ellos se importan también desde componentes cliente (ej. la home usa
`NSFeaturedProducts`, que es `"use client"`), así que **no** pueden llamar a
`getSettings()` directamente (rompería con `server-only`) — el ícono/label
se resuelven una sola vez donde ya hay un Server Component (`getSettings()`
está envuelto en `cache()` de React para deduplicar esa consulta) y bajan
como prop plano (`paymentBadge: {icon, label}`) a través de
`NSProductGrid` → `NSProductCard`.

## Orden de categorías

`reorderCategories`/`moveCategoryAction` (`app/admin/actions.ts`) intercambian
el campo `order` con el hermano (misma `parentId`) adyacente — es lo que
`/admin/categorias` usa en los botones ↑/↓, y lo que determina el orden en el
header, footer, y las secciones del home.

## Foto real por categoría

`/admin/categorias` ahora tiene `NSSingleImageUploader` en el campo `image`
de cada categoría (antes solo se auto-asignaba `placeholder:<slug>:1`, sin
forma de subir una foto real). Sube al mismo bucket que todo lo demás; si
queda vacío, sigue cayendo al arte de placeholder generado.

## Sección "Nuestra fábrica" editable

`NSFactoryStory` (home) sigue el mismo patrón que `NSHero`: recibe
`eyebrow`/`title`/`description`/`stepImages` por props con la copy original
como default. Las 5 etiquetas de paso (Tela/Corte/Confección/Detalle/
Producto) se mantienen fijas a propósito — solo el texto del encabezado y
las 5 fotos son editables, vía `/admin/inicio` (`NSStoryEditorForm`, mismo
patrón de vista previa en vivo con `transform: scale()` que el editor del
Hero). `NSSingleImageUploader` ahora acepta un `onChange` opcional para que
un formulario padre pueda reflejar la nueva URL en su propio estado (así la
vista previa se actualiza al subir, no solo al guardar).

## Contacto/footer conectado a SiteSettings

El footer usaba `siteConfig` (constantes del código) para redes sociales,
correo y ubicación — el formulario de `/admin/configuracion` ya permitía
editar instagram/facebook/tiktok, pero esos cambios nunca se reflejaban en
el sitio. `SiteSettings` ganó `brandDescription`, `whatsappDisplay`,
`contactEmail`, `contactAddress`, `contactMapsUrl`; `NSFooter` y `NSHeader`
ahora leen todo desde `getSettings()`. La dirección se muestra como link a
`contactMapsUrl` (un enlace de "Compartir" de Google Maps) cuando está
configurado, texto plano si no. `siteConfig` sigue existiendo solo como
fallback de build-time/env (ver `lib/data/seed/settings.ts`).

## Autenticación de administrador

Identidad real por correo, vía Supabase Auth — no hay contraseñas
compartidas ni por slug. `/acceder` (`app/acceder/`) es el único login de
la plataforma, tanto para el dueño de un tenant como para Super Admin: pide
correo + contraseña, valida contra Supabase Auth
(`lib/auth/supabase-auth.ts`), busca el perfil en `ds_app_users` (columna
`role`: `"owner"` con `tenant_id`, o `"superadmin"` con `tenant_id` nulo) y
abre la sesión que corresponda. `/acceder/recuperar` +
`/acceder/restablecer` cubren "olvidé mi contraseña" con el correo nativo
de Supabase (sin SMTP propio) — ver el comentario de
`getUserFromAccessToken` en `lib/auth/supabase-auth.ts` para por qué el
paso de confirmación nunca necesita exponer la anon key al navegador.

Una vez autenticado, cada rol sigue con su propio mecanismo de sesión (sin
cambios respecto a antes): el tenant-admin usa una cookie firmada derivada
del slug (`lib/auth/admin-token.ts`, protegida por `middleware.ts` en todo
`/[tenant]/admin/*`) y Super Admin usa una cookie separada
(`lib/auth/superadmin-token.ts`, protegida en `/superadmin/*`). Lo único
que cambió es *cómo se prueba la identidad antes* de emitir esa cookie —
antes una contraseña comparada localmente, ahora Supabase Auth.

`/[tenant]/admin/login` y `/superadmin/login` sobreviven solo como stubs
que redirigen a `/acceder` (por si algún enlace viejo quedó guardado);
`middleware.ts` ya redirige ahí directamente en cualquier caso nuevo.

Cuentas de Super Admin creadas antes de este cambio (tabla legada
`super_admin_users`, `scripts/create-superadmin.ts`) se migran solas la
primera vez que esa persona inicia sesión en `/acceder`: si Supabase Auth
rechaza el intento pero la contraseña coincide con la fila legada,
`accederAction` (`app/acceder/actions.ts`) crea la cuenta real de Supabase
Auth con esa misma contraseña y una fila en `ds_app_users` — logins
siguientes ya nunca vuelven a tocar la tabla vieja.

**Antes de desplegar a producción**: define `SUPABASE_ANON_KEY` (además de
`SUPABASE_SERVICE_ROLE_KEY`), y en el dashboard de Supabase agrega la URL
`{tu dominio}/acceder/restablecer` a Authentication → URL Configuration →
Redirect URLs, o el correo de recuperación no llevará a nadie ahí.

## Registro y onboarding de nuevos tenants

Primer tramo de la evolución a SaaS descrita en
`docs/ANALISIS_HORIZON_REFERENCIA_SAAS.md` (secciones A/E/F/G/H/I): alta
de cliente por autoservicio, sin intervención manual por SQL.

- **`/registro`** (`app/registro/`) — ruta pública de nivel raíz, fuera de
  `app/[tenant]/...`. Pide nombre del negocio, correo, slug (auto-sugerido
  desde el nombre, editable en vivo, con verificación de colisión — a
  diferencia del reintento silencioso de Horizon, aquí se informa el
  conflicto y se sugiere una alternativa) y una contraseña real.
  `registerTenantAction` crea la cuenta en Supabase Auth, la fila en
  `ds_tenants` (`status: "active"` de inmediato — todavía no existe gating
  por suscripción, ver sección 6 del análisis), una fila `ns_settings` con
  copy neutro (ver nota abajo) y su perfil en `ds_app_users`
  (`role: "owner"`), abre sesión automáticamente y redirige a onboarding —
  sin paso de verificación de correo bloqueante, igual que Horizon.
- **`/[tenant]/admin/onboarding`** — wizard de 2 pasos (marca; contacto y
  WhatsApp) protegido por la misma cookie de sesión que el resto de
  `/admin/*`. Guarda todo en un solo Server Action al finalizar
  (`completeOnboardingAction`), marca `ds_tenants.onboarding_completed` y
  redirige al panel. Los tenants existentes antes de esta migración
  (elnuevosanchez, demo) se backfillearon con `onboarding_completed = true`
  para no verse enviados al wizard retroactivamente.
- **Copy neutro, no defaults de El Nuevo Sánchez**: las columnas de
  `ns_settings` en `supabase/schema.sql` todavía tienen como `default` SQL
  el copy de El Nuevo Sánchez ("Especialista en Jeans", imágenes denim,
  etc.) de antes de la migración multi-tenant. `createDefaultSettings()`
  (`lib/repositories/tenant-repository.ts`) por eso nunca depende de esos
  defaults: inserta explícitamente strings vacíos/genéricos para un tenant
  nuevo, igual que ya hacía `scripts/seed-demo-tenant.ts` para "demo" — es
  la misma clase de bug que las fugas de marca cruzada ya corregidas
  (NSLogo/NSPlaceholderArt), solo que a nivel de fila de base de datos en
  vez de componente.

**Deliberadamente fuera de este alcance** (ver sección G del análisis):
todavía no hay planes/suscripciones aplicados al alta en sí — un tenant
registrado queda activo e ilimitado de inmediato (el enforcement de límites
de plan es una capa aparte, ver `lib/tenant/plan-limits.ts`). Identidad
real de usuario y Super Admin ya están resueltos — ver "Autenticación de
administrador" arriba.

**Dos ajustes hechos tras las primeras pruebas reales de este flujo:**
- `/` (la landing raíz) se marcó `export const dynamic = "force-dynamic"`.
  Sin dynamic APIs (cookies/params), Next.js la pre-renderizaba una sola
  vez como página estática y servía esa misma foto siempre — un tenant
  creado después por `/registro` nunca aparecía ahí sin un nuevo deploy.
- El acento de color de la plataforma (`--accent`/`--accent-strong`/
  `--focus-ring` en `app/globals.css`) pasó de dorado a turquesa (tomado
  del logo de DS Catalog, `public/ds-catalog-mark.png`, `#00a19a`). El
  dorado era en realidad la marca de El Nuevo Sánchez filtrándose como
  "color por defecto de la plataforma" a cualquier tenant nuevo (incluido
  "demo") — la misma familia de bug que las fugas de marca cruzada ya
  documentadas arriba, aquí en el sistema de color en vez de en el logo o
  el texto. `ns_settings` ganó tres columnas opcionales
  (`accent_color`/`accent_color_strong`/`accent_foreground`, ver
  `lib/utils/brand.ts` `buildAccentOverrideCss`) para que un tenant pueda
  anular el default de la plataforma — hoy solo El Nuevo Sánchez lo usa,
  fijado a su dorado original para no cambiarle nada visualmente. El
  badge de logo generado por `NSLogo` (usado cuando un tenant no subió su
  propio logo) también dejó de leer el swatch crudo `--color-gold-400` y
  ahora lee el token semántico `--accent`, por la misma razón.

**Personalización de marca por tenant**, agregada tras las mismas pruebas:
- `/admin/configuracion` ganó un selector "Personalizar color de marca"
  (checkbox + dos `<input type="color">` para `accentColor`/
  `accentColorStrong`). El color de texto/ícono sobre el acento
  (`accentForeground`) se calcula solo por luminancia WCAG
  (`lib/utils/brand.ts` `readableForegroundFor`) — el admin no tiene que
  razonar sobre contraste, solo elige un color. Desmarcar el checkbox
  vuelve a `null` (hereda el turquesa de plataforma). Esto es lo que
  `buildAccentOverrideCss` ya sabía leer desde el ajuste anterior; ahora
  cualquier tenant puede escribir ahí, no solo El Nuevo Sánchez por SQL.
- Los 5 labels de "Nuestra fábrica" (Tela/Corte/Confección/Detalle/
  Producto) estaban hardcodeados en dos archivos (`NSFactoryStory.tsx` y
  su editor `NSStoryEditorForm.tsx`) — tenía sentido para jeans, no para
  cualquier otro rubro. `ns_settings` ganó `story_step_label1..5`
  (nulos = usan el wording original, exportado como
  `NSFactoryStory.DEFAULT_STEP_LABELS`), y el editor de `/admin/inicio`
  los expone como texto editable junto a cada foto del proceso.

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
