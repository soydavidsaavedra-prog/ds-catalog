import type { DSDataTableColumn } from "./DSDataTableColumn";

type Props<T> = {
  data: T[];

  columns: DSDataTableColumn<T>[];

  getRowId?: (
    row: T
  ) => string | number;
};

export default function DSDataTableBody<T>({
  data,
  columns,
  getRowId,
}: Props<T>) {
  return (
    <tbody>
      {data.map((row, index) => (
        <tr
          key={
            getRowId
              ? getRowId(row)
              : index
          }
          className="border-b transition-colors hover:bg-gray-50"
        >
          {columns.map((column) => {
            const alignment =
              column.align === "right"
                ? "text-right"
                : column.align === "center"
                ? "text-center"
                : "text-left";

            return (
              <td
                key={column.key}
                className={`px-6 py-5 ${alignment} ${
                  column.cellClassName ?? ""
                }`}
              >
                {column.render(row)}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}