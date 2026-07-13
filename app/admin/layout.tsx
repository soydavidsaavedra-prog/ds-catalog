import type { ReactNode } from "react";
import DSAdminSidebar from "@/components/admin/layout/DSAdminSidebar";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <DSAdminSidebar />

      <main className="flex-1 p-10">
        {children}
      </main>

    </div>
  );
}