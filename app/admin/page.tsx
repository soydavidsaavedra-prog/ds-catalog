import DSHeading from "@/components/ui/DSHeading";
import DSDashboardCard from "@/components/admin/dashboard/DSDashboardCard";

import { statisticsEngine } from "@/engines/statistics/statistics.engine";

export default function AdminPage() {
  return (
    <div className="space-y-10">

      <DSHeading
        title="Dashboard"
        subtitle="Resumen general de la tienda."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <DSDashboardCard
          title="Productos"
          value={statisticsEngine.totalProducts()}
        />

        <DSDashboardCard
          title="Marcas"
          value={statisticsEngine.totalBrands()}
        />

        <DSDashboardCard
          title="Categorías"
          value={statisticsEngine.totalCategories()}
        />

        <DSDashboardCard
          title="Stock"
          value={statisticsEngine.totalStock()}
        />

        <DSDashboardCard
          title="Destacados"
          value={statisticsEngine.totalFeaturedProducts()}
        />

        <DSDashboardCard
          title="Precio promedio"
          value={`$ ${statisticsEngine.averagePrice()}`}
        />

      </div>

    </div>
  );
}