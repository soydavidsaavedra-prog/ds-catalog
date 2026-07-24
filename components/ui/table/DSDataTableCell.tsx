"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  header?: boolean;
};

export default function DSDataTableCell({
  children,
  header = false,
}: Props) {
  if (header) {
    return (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
        {children}
      </th>
    );
  }

  return (
    <td className="px-4 py-3 text-sm text-gray-700">
      {children}
    </td>
  );
}