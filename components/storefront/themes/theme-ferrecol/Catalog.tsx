import type { ThemeCatalogProps } from "@/lib/themes/types";
import { CatalogView } from "./CatalogView";

export async function Catalog(props: ThemeCatalogProps) {
  return <CatalogView {...props} />;
}
