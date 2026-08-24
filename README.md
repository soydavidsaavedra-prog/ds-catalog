# El Nuevo Sánchez — Especialista en Jeans

Plataforma digital de catálogo, ecommerce conversacional (WhatsApp) y panel
administrativo para El Nuevo Sánchez. Ver `docs/ARCHITECTURE.md` para las
decisiones técnicas y `docs/ROADMAP.md` para el estado del proyecto.

## Getting Started

```bash
npm install
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

## Variables de entorno

Ninguna es obligatoria para correr en local (todas tienen un valor por
defecto de desarrollo), pero **deben configurarse antes de desplegar**:

| Variable | Uso | Default de desarrollo |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` | `elnuevosanchez2026` |
| `ADMIN_SESSION_SECRET` | Firma de la cookie de sesión admin | usa `ADMIN_PASSWORD` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para pedidos (solo dígitos, con código de país) | `584121234567` |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | Número formateado para mostrar en el footer | `+58 412 123 4567` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email de contacto mostrado en el footer | `ventas@elnuevosanchez.com` |
| `NEXT_PUBLIC_SITE_URL` | Dominio público (usado en sitemap, OG, links de WhatsApp) | `https://elnuevosanchez.com` |

El número de WhatsApp y los datos de marca también son editables en caliente
desde `/admin/configuracion`, sin redeploy.

## Notas

- Los datos (productos, categorías, banners, pedidos, configuración) se
  persisten en `.data/*.json` (ignorado por git) — ver "Capa de datos" en
  `docs/ARCHITECTURE.md` para el plan de migración a una base de datos real.
- El logo actual es una recreación fiel en SVG (`components/brand/NSLogo.tsx`),
  documentada como temporal hasta contar con el archivo oficial.
