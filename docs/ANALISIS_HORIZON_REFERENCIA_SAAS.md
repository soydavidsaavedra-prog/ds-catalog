# Análisis arquitectónico: DS Studio (Hostinger Horizons) como referencia para la evolución SaaS de DS Catalog

> **Estado de este documento:** análisis de solo lectura. No se copió ni fusionó código del
> proyecto Horizon. Ningún archivo existente de DS Catalog fue modificado — este es un archivo
> nuevo. DS Catalog (Next.js 15 + Supabase) es la arquitectura objetivo; Horizon/DS Studio es
> exclusivamente una referencia funcional de un sistema SaaS multiempresa ya construido y en uso
> real (7 clientes activos según capturas de pantalla del panel `/saas`).

## 0. Qué es el proyecto Horizon (contexto técnico)

"DS Studio" es un SaaS multiempresa de catálogos dinámicos, construido en **Hostinger
Horizons** con una pila completamente distinta a DS Catalog:

| | Horizon / DS Studio | DS Catalog (objetivo) |
|---|---|---|
| Framework | React 18 + Vite 7 + `react-router-dom` v7 (SPA pura, sin SSR) | Next.js 15 App Router (SSR/RSC) |
| Backend/datos | PocketBase (Go) — DB + Auth + Storage + reglas de acceso embebidas | Supabase (Postgres + Storage), acceso solo desde servidor con `service_role` |
| Autorización | Reglas de filtro por colección (`listRule`/`viewRule`/...) evaluadas en PocketBase | Sin RLS activo (la anon key nunca llega al browser); todo pasa por `lib/repositories/*.ts` en servidor |
| Lógica de negocio custom | `pb_hooks/*.pb.js` (hooks JS ejecutados en la JSVM de PocketBase) | Route handlers / server actions de Next.js |
| Multi-tenancy | Cada "shop" es un registro con `owner` (FK a `users`); tenant resuelto por slug de URL (`/c/:slug`) | `app/[tenant]/...` + `lib/tenant/resolve-tenant.ts` |
| Auth | Registro público (`/registro`) + login email/password + Google OAuth, sesión PocketBase por usuario real | `ADMIN_PASSWORD` compartida + cookie de sesión con scope de tenant (no hay credenciales reales por tenant todavía) |
| Componentes UI | shadcn/ui + Radix completo | Componentes propios (NSLogo, NSButton, etc.) sobre Tailwind v4 |

Esta tabla es la base de todas las comparaciones de las secciones siguientes: cada vez que
Horizon resuelve algo con una "regla de PocketBase" o un "hook JSVM", la traducción natural a DS
Catalog es una verificación en un repositorio de servidor o en un middleware/route handler, no una
copia literal.

---

## 1. Sistema de autenticación

**Horizon:** un único formulario en `/login` con tres caminos: email/password contra PocketBase
(`pb.collection('users').authWithPassword`), Google OAuth (`pb.collection('users').authWithOAuth2`),
y "olvidé mi contraseña" (`requestPasswordReset` + página `/reset-password` con token en la URL).
El registro (`/registro`) crea el `user` y autentica inmediatamente (auto-login post-signup), sin
paso de verificación de email bloqueante. La sesión vive en `pb.authStore` (localStorage) y se
propaga vía `pb.authStore.onChange`.

**DS Catalog actual:** una única contraseña de administrador (`ADMIN_PASSWORD`) compartida por
todos los tenants, con una cookie de sesión con scope al tenant resuelto por la URL. No hay
usuarios reales, ni registro, ni recuperación de contraseña — es un modelo de "admin único por
instalación", no un modelo de identidad por persona.

**Brecha clave:** para que DS Catalog sea SaaS real, cada cliente necesita una cuenta propia
(email/password como mínimo), no una contraseña compartida. Esto es el cambio de más alto impacto
de todo el análisis (ver secciones F y G).

## 2. Super Admin

**Horizon:** un rol (`users.role === 'superadmin'`) con una única pantalla, `/saas`
(`SaasPage.jsx`, ~1100 líneas), con dos pestañas: **Clientes** y **Configuración**. La pestaña
Clientes muestra tarjetas de stats (Total/Activos/Expirados/Suspendidos/Pendientes) y una lista de
clientes con, por cada uno: nombre, rubro, badges de estado, plan, fecha de vencimiento, link al
catálogo público, mini-analíticas (visitas, clics WhatsApp, ítems en carrito, productos únicos) y
botones de acción (Catálogo, Estadísticas, Editar plan/Activar, Fecha, +30 días, Suspender,
Editar, Suspender cuenta, Eliminar, WA). La pestaña Configuración edita un registro singleton
(`superadmin_config`, ver sección 14) con datos globales de la plataforma (WhatsApp de soporte,
etc.).

**Confirmado con las capturas de pantalla del usuario** (paso `/saas` real): el superadmin **no
tiene un botón para entrar al panel `/panel` del cliente** — solo puede abrir el catálogo público
(`/c/:slug`) en una pestaña nueva. Es decir, **no hay impersonación / "iniciar sesión como
cliente"** en esta versión de Horizon. Esto responde directamente al punto 13 (ver esa sección).

**DS Catalog actual:** no existe ningún concepto de super admin — solo hay tenants aislados con
su propio admin de contraseña compartida. Esta es una entidad completamente nueva a construir.

## 3. Gestión de clientes

Un "cliente" en Horizon es un registro de la colección `shops` (nombre, rubro/`business_type`,
slug, `owner` → FK a `users`). El superadmin puede:
- **Editar** metadata del shop (nombre, rubro, plan) vía un modal.
- **Cambiar fecha de vencimiento** manualmente o con el atajo **+30 días**.
- **Suspender la cuenta** (bloquea login del owner, ver sección 9) — distinto de suspender la
  suscripción.
- **Eliminar** con un flujo de hard-delete con verificación de dependencias (ver sección 10 y el
  patrón documentado en la investigación: analizar dependencias → confirmar → borrar en orden de
  FK → re-consultar para verificar cero huérfanos).
- Ver **link directo al catálogo público** y **estadísticas** (visitas, clics WhatsApp, ítems en
  carrito, conversión) por cliente.

**DS Catalog actual:** los tenants se crean manualmente por seed/SQL, no hay ninguna UI de
gestión de clientes ni de suscripciones.

## 4. Gestión de usuarios

Horizon distingue **usuario** (`users`, identidad + rol + estado de cuenta) de **cliente/shop**
(el tenant en sí). Un usuario tiene `role: 'owner' | 'superadmin'` (el valor legado `'client'` fue
backfileado a `'owner'` — ver migración `1785818633_backfill_user_roles.js`) y `status: 'active' |
'suspended'`. El superadmin puede editar el perfil de un usuario (`openEditUser`/`saveEditUser`) y
suspender/reactivar su cuenta (`suspendUser`/`reactivateUser`), lo que bloquea o permite el login
vía el hook `auth-suspended-block.pb.js`.

**Relación 1:1 implícita:** en esta versión de Horizon, cada `owner` tiene exactamente un `shop`
(no hay UI para que un usuario administre múltiples tiendas). Es una simplificación deliberada que
DS Catalog puede heredar para su primera iteración SaaS.

## 5. Gestión de planes

**Este es el punto más débil de la arquitectura de Horizon, y una lección importante para DS
Catalog (ver sección D).** Existen **dos sistemas de planes desconectados entre sí**:

1. En `SaasPage.jsx` línea 16: `const PLANS = ['Básico ($5/mes)', 'Pro ($10/mes)', 'Enterprise
   ($20/mes)']` — un array de **strings de texto libre con precio embebido en el label**, usado
   solo para poblar el `<select>` del modal "Editar plan". El valor guardado en
   `subscriptions.plan` es ese string completo, no una clave normalizada.
2. En `lib/capabilities.js`: `PLAN_OVERRIDES` con claves `basico | pro | enterprise` (minúsculas,
   sin precio, sin el signo `$`) que definen límites reales (`maxProducts`, `availableThemes`,
   `hasAdvancedAnalytics`, `analyticsRetentionDays`, etc.), consumido vía `getCapabilities(plan)`.

**No hay match exacto entre `'Básico ($5/mes)'` (lo que se guarda) y `'basico'` (lo que
`getCapabilities` espera tras `.toLowerCase().trim()`)** — el `.toLowerCase().trim()` de
`'Básico ($5/mes)'` da `'básico ($5/mes)'`, que **no coincide** con la clave `'basico'` del objeto
`PLAN_OVERRIDES` (ni siquiera considerando el acento). Esto sugiere que en la versión actual de
Horizon el gating de capacidades por plan probablemente no funciona correctamente en producción,
o cae siempre al fallback `DEFAULT_CAPABILITIES`. Es una prueba concreta de por qué el plan debe
ser una **entidad normalizada** (tabla `plans` con `key`, `label`, `price`, `limits` como columnas
separadas) y no un string de UI reutilizado como identificador de negocio — ver sección D e I.

No existe una colección `plans` en el modelo de datos de Horizon; es enteramente hardcodeado en
dos archivos de frontend, lo que también significa que cambiar un precio requiere un deploy.

## 6. Gestión de suscripciones

Colección `subscriptions` con `shop` (FK), `plan` (string libre, ver arriba), `status: 'pending' |
'active' | 'expired' | 'suspended'`, `expires_at`. El ciclo de vida:

- Al crearse un `shop` (fin del onboarding), el hook `auto-pending-subscription.pb.js` crea
  automáticamente una suscripción en estado `pending` — el cliente nunca "no tiene" suscripción.
- El superadmin la activa manualmente (`activateClient`) fijando `status: 'active'` y una
  `expires_at`.
- `renewClient` sencillamente suma tiempo (usado por el botón "+30 días").
- `suspendClient`/`reactivateClient` cambian `status` a `suspended`/`active` sin tocar
  `expires_at`.
- El hook `subscription-guard.pb.js` (defensa en profundidad, no solo UI) bloquea **escrituras**
  sobre `products`/`shops` cuando la suscripción del owner no está `active` — es decir, un cliente
  con suscripción vencida puede seguir *viendo* su panel pero no puede *guardar* cambios, y su
  catálogo público probablemente sigue online (no se encontró lógica que oculte `/c/:slug` por
  suscripción vencida — el bloqueo es solo de escritura).

No hay integración de pasarela de pago real: todo el ciclo pending→active→expired es gestionado
**manualmente por el superadmin** (activar tras recibir el pago por fuera del sistema, por
ejemplo WhatsApp/transferencia). El componente `SubscriptionAuthContext.jsx` sí incluye un
mecanismo de *polling* post-checkout (`subscriptionPending` en `sessionStorage`, reintentos cada
2s durante 30s) que sugiere una integración de pago prevista pero **no conectada en la práctica**
— es plantilla del generador de Horizons ("Ecommerce API"), no una funcionalidad real del negocio
de DS Studio.

## 7. Relaciones entre clientes y catálogos

Relación estrictamente 1 owner → 1 shop → N products. El slug del shop determina la URL pública
(`/c/:slug`, `/c/:slug/page/:pageKey`, `/c/:slug/product/:productId`). Esto es
conceptualmente **idéntico** al modelo de tenant de DS Catalog (`app/[tenant]/...`) — la
diferencia es de implementación (slug como parámetro dinámico de PocketBase vs. segmento dinámico
de Next.js resuelto en `resolve-tenant.ts`), no de diseño. Este es uno de los puntos de mayor
reutilización conceptual directa.

## 8. Dashboard

Hay dos dashboards con propósitos distintos:

- **Super Admin (`/saas`):** dashboard de *plataforma* — stats agregadas de todos los clientes
  (conteos por estado), no de un negocio individual.
- **Owner (`/panel`, pestaña "Estadísticas"):** dashboard de *negocio* — analíticas del propio
  catálogo (visitas, clics de WhatsApp, productos en carrito, conversión), alimentadas por la
  colección pública `analytics` (ver sección "Analytics" de los conceptos técnicos: writable de
  forma anónima, agregada client-side).

Ninguno de los dos usa gráficos server-aggregated — todo el join/aggregate ocurre en el cliente
porque PocketBase no soporta joins SQL. **Esto no debería replicarse en DS Catalog**: Postgres sí
soporta vistas/agregaciones server-side, así que el dashboard de super admin en DS Catalog debería
resolverse con una vista SQL o una consulta agregada en el repositorio, no con fetch-all-y-unir-en-
JS.

## 9. Permisos

Modelo de dos ejes independientes, y esta separación es una de las ideas más aprovechables de
Horizon:

1. **`users.status` (`active`/`suspended`)** — controla si la persona puede **iniciar sesión**,
   punto. Se aplica en el hook `auth-suspended-block.pb.js`, antes de emitir el token.
2. **`subscriptions.status`** — controla si el owner puede **escribir** en su catálogo
   (`subscription-guard.pb.js`), independientemente de si puede iniciar sesión.

Además, las reglas de acceso a nivel de colección de PocketBase (`listRule`/`viewRule`/
`createRule`/`updateRule`/`deleteRule`) son el mecanismo primario de autorización — evaluadas
en el servidor, expresadas como filtros (ej. `owner = @request.auth.id`). El equivalente en DS
Catalog no es RLS de Postgres (que está desactivado a propósito, ver arquitectura actual), sino
la verificación explícita de `tenant_id` / `owner_id` dentro de cada método de
`lib/repositories/*.ts`, que es el único punto de acceso a la base de datos.

## 10. Estados de clientes

Los estados visibles en el panel `/saas` (confirmados en captura de pantalla: Activo/Sin
actividad, y las columnas Total/Activos/Expirados/Suspendidos/Pendientes) son en realidad una
combinación derivada de `subscriptions.status` (`pending|active|expired|suspended`) con un badge
adicional puramente informativo ("Sin actividad") que probablemente se deriva de analíticas
recientes (no de una columna de estado propia). No hay un estado de cliente unificado en el
modelo de datos — es siempre `subscriptions.status` + `users.status` leídos juntos y presentados
como un badge compuesto en la UI.

## 11. Flujo para crear un nuevo cliente

**El hallazgo más importante de esta sección: el superadmin nunca "crea" un cliente
manualmente.** El flujo es 100% self-service:

1. Visitante anónimo se registra en `/registro` (`AuthPage` en modo signup) → se crea el `user`
   con `role: 'owner'` por defecto (hook `new-user-defaults.pb.js`) → auto-login inmediato.
2. `ProtectedOnboarding` (guard de ruta en `App.jsx`) redirige a `/onboarding` mientras
   `onboarding_completed !== true`.
3. `OnboardingPage.jsx` — wizard multi-paso con progreso persistido en `localStorage` (resumible
   si el usuario cierra el navegador a mitad de camino), incluyendo selección de rubro
   (`business_type`, del catálogo de 16 tipos de `businessTypes.js`) y un slug con
   **reintento automático en caso de colisión** (si el slug ya existe, genera una variante y
   reintenta).
4. Al finalizar, se crea el registro `shops` → dispara automáticamente `auto-pending-
   subscription.pb.js` → el cliente queda con suscripción `pending`.
5. El superadmin ve al nuevo cliente aparecer solo en `/saas` con badge "Pendiente" y botón
   "Activar" — su única acción de "creación" es la **activación**, no el alta.

Esto es una diferencia estructural, no cosmética, frente al modelo actual de DS Catalog donde los
tenants se dan de alta manualmente por SQL/seed. Adoptar este patrón (registro público +
onboarding + activación manual/automática) es el cambio de mayor apalancamiento para convertir DS
Catalog en un SaaS real.

## 12. Flujo para editar un cliente

Dos caminos distintos, sin superposición:
- **El propio owner** edita su negocio íntegramente dentro de `/panel` (tema, productos,
  contenido, cuenta) — el superadmin no participa en absoluto en la operación diaria del catálogo.
- **El superadmin** solo edita los campos de **relación plataforma-cliente**: plan, fecha de
  vencimiento, estado de cuenta/suscripción, y los metadatos básicos del shop (nombre, rubro) vía
  el modal "Editar" de `/saas` — nunca contenido del catálogo (productos, tema, banners).

Esta separación de responsabilidades (plataforma vs. negocio) es limpia y directamente
trasladable a DS Catalog.

## 13. Flujo para acceder a la administración de un cliente

Respondido con evidencia directa de código y de captura de pantalla: **no existe impersonación**.
Los únicos accesos del superadmin a un cliente específico son:
- Un link "Catálogo" que abre `/c/:slug` (el **catálogo público**, no el panel de administración)
  en pestaña nueva (`target="_blank"`).
- Un botón "Estadísticas" que muestra las analíticas de ese cliente **dentro del propio `/saas`**
  (no navega a `/panel`).
- Los modales "Editar"/"Editar plan"/"Fecha" que editan campos de `shops`/`subscriptions`
  directamente desde `/saas`, sin nunca cargar `AdminPage.jsx`.

`AdminPage.jsx` (el componente de `/panel`) resuelve su shop internamente vía
`pb.authStore.record` + `pb.collection('shops').getFullList({ filter: `owner = "${user.id}"` })`
— es decir, está **atado a la identidad del usuario autenticado**, no a un parámetro de URL, lo
que técnicamente hace imposible visitarlo "como" otro usuario sin mecanismos de impersonación que
Horizon no implementó (como un token de suplantación firmado por el servidor). Este es un gap real
del sistema de referencia: si un cliente necesita soporte, el superadmin no tiene forma de ver su
panel administrativo, solo su catálogo público y sus métricas. **Ver recomendación en la sección
C (mejoras)** — es una funcionalidad que Horizon no resolvió y que DS Catalog sí debería
implementar correctamente desde el principio (con auditoría, ver sección J).

## 14. Modelo de datos

Colecciones (PocketBase) relevantes, reconstruidas de las migraciones:

- **`users`** — auth base + `role` (`owner`|`superadmin`) + `status` (`active`|`suspended`) +
  `onboarding_completed` (bool).
- **`shops`** — `owner` (FK users), `name`, `slug` (único), `business_type`, campos de tema/marca
  (banners, galería, colores — ver `1785785007_add_theme_banners_gallery.js`).
- **`products`** — `shop` (FK), campos base + `attributes` (json, variable por `business_type`) +
  variantes (`1785771671_add_profile_and_variant_fields.js`).
- **`subscriptions`** — `shop` (FK, 1:1), `plan` (string libre — ver crítica en sección 5),
  `status` (`pending`|`active`|`expired`|`suspended`), `expires_at`.
- **`analytics`** — público de escritura (`createRule=""`), `shop` (FK), `event`, `visitor_id`,
  `metadata` — sin relación fuerte de integridad, es un event log.
- **`superadmin_config`** — colección **singleton** (un solo registro global) con configuración
  de plataforma (contacto de soporte, etc.).

No hay tabla/colección `plans` normalizada (ver sección 5) — es la ausencia más notable del
modelo de datos frente a lo que DS Catalog debería construir.

## 15. Componentes reutilizables

`apps/web/src/components/ui/*` (51 archivos) es el kit shadcn/ui + Radix estándar (Button, Dialog,
Select, Tabs, Card, Badge, etc.) — sin ninguna personalización de negocio visible en los nombres
de archivo. **No hay nada aquí específico de DS Studio que valga la pena estudiar como patrón**:
es exactamente el boilerplate que cualquier proyecto Vite+shadcn tiene de fábrica. El valor real
reutilizable está en la **capa lógica**, no en los componentes visuales:
- `lib/businessTypes.js` — el "motor de tipos de negocio" (ver sección 18).
- `lib/capabilities.js` — el patrón de gating por plan (a pesar de su bug de matching, el *patrón*
  de "un único punto de verdad para límites por plan" es sólido).
- El patrón de guards de ruta (`ProtectedAuth`/`ProtectedSuperadmin`/`ProtectedOwner`/
  `ProtectedOnboarding`) en `App.jsx` — cuatro wrappers pequeños y explícitos, cada uno con una
  sola responsabilidad de redirección. Vale la pena como patrón de organización de middleware en
  DS Catalog, aunque la implementación en Next.js será distinta (middleware.ts + checks de sesión
  server-side en vez de un guard de React Router client-side).

## 16. Navegación del panel

`/panel` (`AdminPage.jsx`) organiza su navegación en un tab principal "Diseño" con **11
subsecciones** (tema, colores, header, navegación, beneficios, hero, logo, cards, tipografía,
botones, banners, footer) más tabs de nivel superior para Productos, Contenido, Cuenta y
Estadísticas, con tabs adicionales de dispositivo de previsualización (desktop/tablet/mobile) y
una barra inferior de navegación para móvil (Diseño/Productos/Preview/Cuenta/Tienda). La
granularidad de 11 subsecciones dentro de "Diseño" es notable: sugiere que el editor de tema de
Horizon es exhaustivo pero también potencialmente abrumador — es una referencia útil de **qué
ejes de personalización visual vale la pena exponer** (colores, header, hero, logo, tarjetas,
tipografía, botones, banners, footer), no necesariamente de cómo agruparlos en la UI.

## 17. UX/UI

Confirmado por las 3 capturas de pantalla del usuario: tema oscuro consistente (fondo casi negro,
acentos turquesa/verde-agua `#`teal), tipografía sans limpia, tarjetas con bordes sutiles y
esquinas redondeadas, badges de estado con color semántico (verde=activo). El login es un único
card centrado sin distracciones, con Google OAuth priorizado visualmente sobre el formulario de
email. El dashboard de superadmin prioriza densidad de información (5 stat-tiles + lista de
tarjetas de cliente con hasta 9 acciones por fila) sobre estética minimalista — es una UI de
herramienta operativa interna, no una landing de producto. Nada de esto es código reutilizable,
pero sí es una referencia de tono válida si DS Catalog quiere un panel de superadmin con esa
misma densidad operativa.

## 18. Funciones útiles para DS Catalog (fuera de las ya cubiertas en 1–17)

- **Motor de tipos de negocio (`businessTypes.js`, 555 líneas, 16 rubros):** cada tipo de negocio
  define su propio sustantivo de producto, labels, placeholders, categorías sugeridas, atributos
  dinámicos, tipos de variante y tema recomendado, con el objetivo explícito documentado en el
  propio código de que "agregar un rubro nuevo = agregar una entrada, nada más cambia". Esto es
  directamente valioso para DS Catalog si el objetivo es servir más de un vertical de negocio
  (hoy DS Catalog está fuertemente especializado en jeans/moda vía `NSPlaceholderArt`,
  `config/theme/*`, etc.) — aunque adoptar esto en DS Catalog probablemente implica introducir un
  concepto de "tema de tenant" configurable que hoy no existe (el theming actual es a nivel de
  código, no de datos).
- **Suspensión con dos ejes independientes** (login vs. escritura) — ver sección 9, patrón
  limpio y trasladable.
- **Análisis de dependencias antes de hard-delete** (analizar → confirmar → borrar en orden FK →
  re-verificar cero huérfanos) — buen patrón de seguridad para el "Eliminar cliente" que DS
  Catalog necesitará.
- **Analíticas públicas por evento** (colección con `createRule=""`, sin necesidad de sesión) para
  medir visitas/clics de WhatsApp/carrito por tenant, agregadas para alertas simples
  (inactivo/baja conversión/creciendo) — patrón de bajo costo de implementar sobre Postgres con
  una tabla `analytics_events` + inserts anónimos desde una API route pública.

---

## Comparación conceptual: síntesis

Horizon resuelve el problema de "SaaS multiempresa" con: registro público → onboarding
autoservicio → activación manual de suscripción por superadmin → aislamiento por slug → dos ejes
de suspensión independientes → panel de superadmin *separado* del panel de negocio, sin
impersonación. DS Catalog hoy resuelve una fracción de esto (aislamiento por tenant vía slug de
URL) pero no tiene identidad real de usuario, ni suscripciones, ni superadmin, ni onboarding.
Horizon confirma con un sistema en producción real que el modelo "self-service signup + activación
manual + guardas de dos ejes" es viable y suficientemente simple de operar por una sola persona
(el superadmin activando manualmente pagos recibidos por fuera del sistema).

## A. Funcionalidades que debemos recuperar (conceptualmente, no el código)

1. Registro público de cliente + login con identidad real (email/password como mínimo).
2. Onboarding wizard multi-paso, resumible, que termina creando el tenant (`shop`) del cliente.
3. Rol `superadmin` con panel propio, separado del panel de negocio del tenant.
4. Modelo de suscripción con estados `pending|active|expired|suspended` y activación/renovación
   manual por el superadmin (sin necesidad de integrar una pasarela de pago desde el día uno).
5. Dos ejes de suspensión independientes: cuenta de usuario (bloquea login) vs. suscripción
   (bloquea escritura, no necesariamente lectura del catálogo público).
6. Flujo de eliminación de cliente con análisis de dependencias + confirmación + verificación
   post-borrado.
7. Analíticas públicas por evento (visitas, clics de WhatsApp, conversión) agregadas por tenant,
   visibles tanto al superadmin (vista de plataforma) como al owner (vista de su negocio).
8. Separación de responsabilidades en la edición: el superadmin solo toca plan/vigencia/estado de
   cuenta; el owner controla contenido del catálogo íntegramente.

## B. Funcionalidades que debemos descartar

1. El "plan como string de texto libre con precio embebido en el label" (`PLANS` en
   `SaasPage.jsx`) — es la causa raíz del bug de matching descrito en la sección 5. Debe
   reemplazarse desde el diseño por una tabla `plans` normalizada.
2. El mecanismo de *polling* post-checkout de `SubscriptionAuthContext.jsx` — es plantilla no
   conectada a ninguna pasarela real en este proyecto; no aporta nada sin una integración de pago
   real detrás.
3. `useUserTier.js` — un segundo sistema de gating por "tier" (`product_title`, literal `'Free'`)
   completamente desconectado de `capabilities.js`/`PLAN_OVERRIDES`. Es plantilla del generador de
   Horizons, no código de negocio de DS Studio; adoptar dos sistemas de gating paralelos sería
   heredar confusión, no una funcionalidad.
4. El agregado de analíticas 100% client-side (fetch-all + join en JS) — es una limitación de
   PocketBase (sin joins SQL), no un patrón a imitar cuando ya se cuenta con Postgres.

## C. Funcionalidades que debemos mejorar respecto a Horizon

1. **Impersonación/acceso de soporte al panel de un cliente** (punto 13): Horizon no lo resolvió
   en absoluto. DS Catalog debería implementarlo correctamente desde el inicio: un
   endpoint de servidor que, solo para `superadmin` y con auditoría (quién, cuándo, qué tenant),
   emite una sesión de administración con scope al tenant elegido — nunca reutilizando ni
   revelando la credencial del cliente.
2. **Plan/capacidades como entidad normalizada** con una única clave (`plan_key`) referenciada
   tanto por `subscriptions.plan_id` como por la tabla de límites — eliminando la clase de bug
   descrita en la sección 5 por diseño.
3. **Auditoría de acciones del superadmin** (activar, suspender, eliminar, impersonar) — Horizon
   no registra quién hizo qué; para un SaaS con soporte al cliente esto es importante desde el
   principio.
4. **Agregación de analíticas en el servidor** (vista SQL o consulta agregada), no en el cliente.

## D. Partes de Horizon que NO debemos reutilizar

1. El sistema dual de gating por plan (`capabilities.js` + `useUserTier.js`) — reutilizar el
   *patrón* de "un único punto de verdad para límites", no la implementación con dos sistemas
   paralelos y desconectados.
2. Cualquier lógica atada a las particularidades de PocketBase: reglas de filtro como strings,
   hooks JSVM con scope aislado por callback (el propio código de Horizon documenta que las
   funciones helper a nivel de archivo quedan `undefined` dentro de cada callback y hay que
   duplicarlas dentro de cada uno — un "gotcha" específico de la JSVM de PocketBase que no aplica
   a Supabase/Postgres, pero que vale la pena recordar como ejemplo de qué evitar: no dupliques
   lógica de autorización en varios sitios sin una función compartida real).
3. El componente `SubscriptionAuthContext.jsx` casi completo — es plantilla del generador
   ("Ecommerce API") sin integración de pago real conectada.
4. La UI de shadcn/ui/Radix en sí (51 archivos de componentes) — no hay nada específico del
   negocio ahí; DS Catalog ya tiene su propio sistema de componentes (NSLogo, NSButton, etc.) y
   debe mantenerlo, no importar un segundo kit de UI en paralelo.

## E. Cómo implementarlas con la arquitectura actual de DS Catalog

- **Identidad real de cliente:** usar Supabase Auth (email/password, y opcionalmente OAuth) en
  lugar de la `ADMIN_PASSWORD` compartida actual. La sesión seguiría teniendo scope de tenant,
  pero el `user_id` de Supabase Auth reemplaza a la contraseña compartida como fuente de verdad de
  "quién eres", y una tabla `tenant_users` (o `shops.owner_id`) enlaza usuario↔tenant.
- **Registro + onboarding:** una ruta pública `/registro` (route handler de Next.js) que crea el
  usuario en Supabase Auth, y una serie de rutas `/onboarding/[paso]` (o un wizard de un solo
  cliente con estado en `localStorage`, igual que Horizon) que termina invocando el repositorio
  `lib/repositories/tenants.ts` (nuevo) para crear el tenant — reutilizando el patrón de
  repositorio ya existente en el proyecto, no el patrón de colección PocketBase.
- **Superadmin:** un rol adicional (`is_superadmin: boolean` o `role` enum en la tabla de
  usuarios), verificado en middleware.ts para las rutas `/superadmin/*`, con acceso vía
  `service_role` a nivel de servidor igual que el resto del admin actual — sin necesidad de RLS
  porque el patrón ya establecido de DS Catalog es "todo acceso a datos pasa por el servidor".
- **Suscripciones y planes:** tablas nuevas en Supabase (ver sección F/I) consultadas y
  modificadas exclusivamente desde repositorios de servidor, con `getCapabilities(planKey)` como
  función pura de servidor (mismo patrón que `capabilities.js` de Horizon, pero con `planKey`
  como clave normalizada compartida entre `subscriptions` y `plans`).
- **Guardas de dos ejes:** un check de `user.status === 'suspended'` en el login (Supabase Auth
  hook o verificación post-login en el route handler), y un check de
  `subscription.status !== 'active'` dentro de cada mutación de servidor sobre productos/tema del
  tenant (en los repositorios existentes, como una verificación adicional antes de escribir) —
  igual de "defensa en profundidad" que `subscription-guard.pb.js`, pero como función TypeScript
  compartida invocada desde cada repositorio de escritura, no un hook de plataforma.

## F. Cambios requeridos en Supabase

1. Nuevas tablas: `plans`, `subscriptions`, `tenant_users` (o columna `owner_id` en la tabla de
   tenants existente), `analytics_events`, y opcionalmente `superadmin_settings` (singleton, como
   `superadmin_config` de Horizon).
2. Columnas nuevas en la tabla de tenants (o el análogo actual): `status`
   (`active`/`suspended`), `business_type` (si se adopta el motor de tipos de negocio de la
   sección 18), `onboarding_completed`.
3. Un rol/columna de superadmin en la tabla de usuarios de Supabase Auth (vía tabla de perfil
   asociada, ya que Supabase Auth no permite columnas custom directas en `auth.users`).
4. Dado que DS Catalog ya evita RLS (todo acceso es `service_role` desde servidor), estas tablas
   nuevas deben seguir el mismo patrón: sin políticas RLS activas, con la autorización aplicada en
   los repositorios de servidor — consistente con la arquitectura ya documentada en
   `docs/ARCHITECTURE.md`.
5. Migraciones idempotentes en `supabase/schema.sql`, siguiendo la convención ya usada en el
   proyecto (ver referencia a "re-correr `schema.sql`" en `docs/ROADMAP.md`).

## G. Cambios requeridos en autenticación

1. Sustituir (o complementar) `ADMIN_PASSWORD` por Supabase Auth con usuarios reales por tenant.
   Esto es un cambio de fondo: hoy el middleware/cookie de sesión de DS Catalog valida contra un
   secreto de entorno; el nuevo flujo debe validar contra una sesión de Supabase Auth y resolver
   el tenant a partir del `user_id`, no (solo) del segmento de URL.
2. Nuevo claim/rol de `superadmin` verificado server-side antes de servir cualquier ruta
   `/superadmin/*`.
3. Mecanismo de impersonación auditada (sección C.1) — un endpoint de servidor exclusivo para
   superadmin que emite una sesión de admin con scope al tenant, con registro de auditoría.
4. Decisión pendiente de producto (no técnica): si se mantiene `ADMIN_PASSWORD` como fallback para
   tenants ya existentes (migración gradual) o se fuerza a todos a re-registrarse — esto afecta
   directamente a los tenants `elnuevosanchez` y `demo` ya desplegados.

## H. Nuevas rutas necesarias

- `/registro` — alta pública de cliente.
- `/onboarding` (o `/onboarding/[paso]`) — wizard de creación de tenant.
- `/superadmin` — dashboard de plataforma (equivalente a `/saas` de Horizon).
- `/superadmin/clientes/[tenantId]` — detalle/edición de un cliente (plan, vigencia, estado).
- `/superadmin/configuracion` — configuración global de la plataforma.
- Endpoint de servidor para impersonación (no necesariamente una ruta visible, un route handler
  que emite la sesión con scope de tenant).
- `/[tenant]/admin/cuenta` (o análogo) — donde el propio owner ve su plan y estado de suscripción,
  equivalente a `SubscriptionsPage.jsx` de Horizon.

## I. Nuevas entidades necesarias

1. **`plans`** — `id`, `key` (única, normalizada, ej. `basico`/`pro`/`enterprise`), `label`,
   `price_cents`, `limits` (jsonb: `max_products`, `available_themes`, `has_advanced_analytics`,
   `analytics_retention_days`, etc.) — corrigiendo por diseño el defecto de Horizon descrito en la
   sección 5.
2. **`subscriptions`** — `id`, `tenant_id` (FK), `plan_id` (FK a `plans`, no un string), `status`
   (`pending|active|expired|suspended`), `expires_at`, `created_at`.
3. **`tenant_users`** (o columna `owner_id` en tenants, según si se permite multi-owner a
   futuro) — vínculo usuario↔tenant.
4. **`analytics_events`** — `tenant_id`, `event_type`, `visitor_id`, `metadata` (jsonb),
   `created_at` — insertable públicamente desde un route handler sin sesión.
5. **`superadmin_settings`** — singleton con configuración global de la plataforma.
6. Columna `status` (`active|suspended`) en la tabla de usuarios (perfil ligado a Supabase Auth).

## J. Permisos necesarios

1. **`superadmin`** — acceso total a `/superadmin/*`, puede: activar/suspender/renovar
   suscripciones, suspender/reactivar cuentas de usuario, editar metadata de tenant, eliminar
   tenant (con verificación de dependencias), impersonar con auditoría, editar configuración
   global.
2. **`owner` (dueño de tenant)** — acceso total a su propio panel de administración
   (`/[tenant]/admin/*`), bloqueado a nivel de escritura si su suscripción no está `active`,
   bloqueado a nivel de login si su cuenta de usuario está `suspended`.
3. **Visitante anónimo** — puede leer catálogos públicos, puede registrarse, puede insertar
   eventos de analíticas (sin sesión).
4. **Regla de aislamiento transversal**: todo repositorio de servidor que toque datos de tenant
   debe verificar `tenant_id` contra el tenant resuelto de la sesión/URL antes de leer o escribir
   — el mismo principio que las `listRule`/`updateRule` de PocketBase en Horizon, pero aplicado
   como chequeo explícito en TypeScript dentro de cada función de repositorio, consistente con
   cómo ya está construido `lib/repositories/*.ts` hoy.
