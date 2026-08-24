import type { Banner } from "@/lib/types/catalog";

export const bannersSeed: Banner[] = [
  {
    id: "ban-001",
    title: "De la fábrica a tus manos",
    subtitle: "Nueva colección de temporada ya disponible",
    image: "placeholder:hero:1",
    ctaLabel: "Explorar colección",
    ctaHref: "/catalogo",
    active: true,
    order: 1,
  },
  {
    id: "ban-002",
    title: "Colección Skinny",
    subtitle: "Ajuste perfecto que realza tu estilo y figura",
    image: "placeholder:skinny:banner",
    ctaLabel: "Ver Skinny",
    ctaHref: "/skinny",
    active: true,
    order: 2,
  },
];
