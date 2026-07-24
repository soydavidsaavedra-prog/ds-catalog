import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  columns?: 1 | 2;
};

export default function DSFormGrid({
  children,
  columns = 2,
}: Props) {
  return (
    <div
      className={
        columns === 2
          ? "grid gap-6 md:grid-cols-2"
          : "grid gap-6"
      }
    >
      {children}
    </div>
  );
}