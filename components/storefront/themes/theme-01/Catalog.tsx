import type { ThemeCatalogProps } from "@/lib/themes/types";
import { NSCatalogView } from "./NSCatalogView";

/** Theme 01's full-catalog page composition — a thin passthrough since Theme 01's catalog IS the shared catalog engine's own view. */
export async function Catalog(props: ThemeCatalogProps) {
  return <NSCatalogView {...props} />;
}
