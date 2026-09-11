import type { ReactNode } from "react";

/**
 * Adds the @modal parallel slot so "Nuevo producto" can render as an
 * intercepted overlay (@modal/(.)nuevo) on top of the products list when
 * opened via an in-app click, instead of navigating away from it — the
 * list (children) stays mounted underneath so it's still there, and still
 * editable, once the floating panel is minimized.
 */
export default function ProductosLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
