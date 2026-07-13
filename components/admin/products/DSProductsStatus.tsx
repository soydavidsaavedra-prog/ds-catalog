type Props = {
    active: boolean;
  };
  
  export default function DSProductsStatus({
    active,
  }: Props) {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
          active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {active ? "Activo" : "Inactivo"}
      </span>
    );
  }