import DSProductGrid from "@/components/catalog/grid/DSProductGrid";
import { catalogEngine } from "@/engines/catalog/catalog.engine";
import { storeEngine } from "@/engines/store/store.engine";

export default async function Home() {
  const products = await catalogEngine.getAllProducts();

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <h1 className="text-center text-5xl font-bold">
        {storeEngine.getName()}
      </h1>

      <p className="mt-3 text-center text-gray-500">
        {storeEngine.getSlogan()}
      </p>

      <div className="mt-10">
        <DSProductGrid products={products} />
      </div>
    </main>
  );
}
