# El Nuevo Sánchez — Roadmap

Estado del proyecto: 🟢 V1 funcional — de la fábrica a tus manos

Ver `docs/ARCHITECTURE.md` para decisiones técnicas y pendientes detallados.

---

## Hecho

- [x] Design system de marca (negro, dorado #F8C909, denim) — `config/theme/*`, `app/globals.css`
- [x] Capa de datos: tipos, seed (~36 productos demo / 9 categorías / banners / settings),
      repositorios CRUD sobre `.data/*.json` (preparado para migrar a Supabase)
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
- [ ] Migración de datos a Postgres/Supabase (requiere cuenta del usuario)
- [ ] Fotografía real de producto
- [ ] Importación masiva vía CSV (arquitectura lista, falta el endpoint)
- [ ] Variables de entorno de producción (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
      `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`)
- [ ] Escena 3D real en el Hero (punto de extensión ya aislado)

## MVP (cumplido)

- [x] Mostrar productos
- [x] Buscar productos
- [x] Mostrar variantes
- [x] Abrir galería de imágenes
- [x] Contactar por WhatsApp
- [x] Adaptarse a dispositivos móviles
- [x] Configurar un negocio sin modificar código (`/admin/configuracion`)
