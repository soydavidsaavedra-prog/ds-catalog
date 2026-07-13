import Link from "next/link";

const menu = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Tienda",
    href: "/admin/store",
  },
  {
    title: "Productos",
    href: "/admin/products",
  },
  {
    title: "Categorías",
    href: "/admin/categories",
  },
  {
    title: "Tema",
    href: "/admin/theme",
  },
  {
    title: "IA",
    href: "/admin/ai",
  },
  {
    title: "Configuración",
    href: "/admin/settings",
  },
];

export default function DSAdminSidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white">

      <div className="border-b p-6">
        <h2 className="text-2xl font-bold">
          DS Commerce
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Administration
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4">

        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-4 py-3 transition hover:bg-gray-100"
          >
            {item.title}
          </Link>
        ))}

      </nav>

    </aside>
  );
}