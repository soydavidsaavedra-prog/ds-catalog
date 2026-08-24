# El Nuevo Sánchez — Especialista en Jeans

Plataforma digital de catálogo, ecommerce conversacional (WhatsApp) y panel
administrativo para El Nuevo Sánchez. Ver `docs/ARCHITECTURE.md` para las
decisiones técnicas y `docs/ROADMAP.md` para el estado del proyecto.

## Getting Started

1. Crea un proyecto en [supabase.com](https://supabase.com) (o usa uno existente).
2. Abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql`
   y ejecútalo una vez. Crea las tablas (`categories`, `products`, `banners`,
   `orders`, `settings`) y el bucket público `product-images`.
3. En **Project Settings → API**, copia `Project URL`, `anon public key` y
   `service_role key` a un `.env.local` en la raíz (ver `.env.example`).
4. Instala dependencias, siembra el catálogo de demo y arranca:

```bash
npm install
npm run seed:supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la tienda y
[http://localhost:3000/admin](http://localhost:3000/admin) para el panel
administrativo (contraseña por defecto en desarrollo: `elnuevosanchez2026`
— ver Variables de entorno abajo).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — sirve el build de producción
- `npm run lint` — ESLint
- `npm run seed:supabase` — puebla el catálogo de demo en Supabase (seguro de re-ejecutar)

## Variables de entorno

Las variables de Supabase son **obligatorias** (no tienen default); el resto
tiene un valor de desarrollo pero **debe configurarse antes de desplegar**:

| Variable | Uso | Default de desarrollo |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | — (obligatoria) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon (no se usa desde el navegador hoy, reservada) | — (obligatoria) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio, solo servidor — evita RLS | — (obligatoria, secreta) |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` | `elnuevosanchez2026` |
| `ADMIN_SESSION_SECRET` | Firma de la cookie de sesión admin | usa `ADMIN_PASSWORD` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para pedidos (solo dígitos, con código de país) | `584121234567` |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | Número formateado para mostrar en el footer | `+58 412 123 4567` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email de contacto mostrado en el footer | `ventas@elnuevosanchez.com` |
| `NEXT_PUBLIC_SITE_URL` | Dominio público (usado en sitemap, OG, links de WhatsApp) | `https://elnuevosanchez.com` |

En Vercel, configura las mismas variables en **Project Settings →
Environment Variables** — sin las 3 de Supabase el build falla (páginas de
producto/categoría usan `generateStaticParams`, que consulta la base de
datos en build time).

El número de WhatsApp y los datos de marca también son editables en caliente
desde `/admin/configuracion`, sin redeploy.

## Notas

- Los datos (productos, categorías, banners, pedidos, configuración) se
  persisten en Supabase (Postgres) — ver "Capa de datos" en
  `docs/ARCHITECTURE.md`. Las imágenes subidas desde el admin van al bucket
  público `product-images` de Supabase Storage.
- El logo actual es una recreación fiel en SVG (`components/brand/NSLogo.tsx`),
  documentada como temporal hasta contar con el archivo oficial.
