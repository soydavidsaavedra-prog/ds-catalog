# El Nuevo Sánchez — Roadmap

Estado del proyecto: 🟢 V1 funcional — de la fábrica a tus manos

Ver `docs/ARCHITECTURE.md` para decisiones técnicas y pendientes detallados.

---

## Hecho

- [x] Design system de marca (negro, dorado #F8C909, denim) — `config/theme/*`, `app/globals.css`
- [x] Capa de datos: tipos, seed (~36 productos demo / categorías jerárquicas / banners / settings),
      repositorios CRUD sobre Supabase (Postgres) — persiste en Vercel
- [x] Subida de imágenes de admin a Supabase Storage (bucket público `ns-product-images`)
- [x] Categorías en 2 niveles (Dama/Caballero/Niño → Skinny/Cargo/Jogger/...), con selector de
      categoría padre en el admin y páginas `/[categoria]` que agregan productos de subcategorías
- [x] Referencia de producto autogenerada (`NS-XXX` consecutivo) al crear, editable manualmente
- [x] Editor visual de portada del home (`/admin/inicio`): imagen subida desde el computador,
      posición ajustable, textos y botón editables, con vista previa en vivo del componente real
- [x] Carrito (Zustand + localStorage) y motor de pedido por WhatsApp
- [x] Componentes base: NSLogo, NSButton, NSBadge, NSPrice, NSInput, NSMedia (+ placeholders)
- [x] Header/nav/menú móvil/búsqueda, footer, cart drawer, botón flotante de WhatsApp
- [x] Home: hero, storytelling "De la fábrica a tus manos", colecciones, destacados, brand statement
- [x] Catálogo: `/catalogo` + `/[categoria]` sobre el mismo motor (filtros, búsqueda, orden)
- [x] Ficha de producto: galería, variantes, disponibilidad, compartir, relacionados
- [x] Panel admin: login, dashboard, productos (CRUD + subida de imágenes), categorías,
      banners, pedidos (seguimiento), configuración (WhatsApp, marca, redes)
- [x] SEO: sitemap, robots, metadata/OG por producto y categoría, 404 de marca, loading states
- [x] Responsive de extremo a extremo; `prefers-reduced-motion` respetado

## Pendiente (ver "Lo que falta para producción" en ARCHITECTURE.md)

- [ ] Logo oficial real (hoy: recreación fiel en SVG, documentada)
- [ ] Volver a ejecutar `supabase/schema.sql` (agrega `parent_id` en categorías y los campos
      `hero_*` en settings — idempotente, seguro de re-correr) y `npm run seed:supabase`
      (pendiente de que el usuario lo haga localmente, ver ARCHITECTURE.md)
- [ ] Fotografía real de producto
- [ ] Importación masiva vía CSV (arquitectura lista, falta el endpoint)
- [ ] Variables de entorno de producción (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
      `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Escena 3D real en el Hero (punto de extensión ya aislado)

## MVP (cumplido)

- [x] Mostrar productos
- [x] Buscar productos
- [x] Mostrar variantes
- [x] Abrir galería de imágenes
- [x] Contactar por WhatsApp
- [x] Adaptarse a dispositivos móviles
- [x] Configurar un negocio sin modificar código (`/admin/configuracion`)
