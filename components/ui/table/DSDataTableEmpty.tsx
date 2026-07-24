type Props = {
    colSpan: number;
    message?: string;
  };
  
  export default function DSDataTableEmpty({
    colSpan,
    message = "No hay registros.",
  }: Props) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={colSpan}
            className="py-12 text-center text-gray-500"
          >
            {message}
          </td>
        </tr>
      </tbody>
    );
  }