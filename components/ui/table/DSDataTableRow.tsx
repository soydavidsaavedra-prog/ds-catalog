"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DSDataTableRow({
  children,
}: Props) {
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">

      {children}

    </tr>
  );
}