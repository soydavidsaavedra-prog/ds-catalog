type Props = {
    page: number;
    totalPages: number;
  
    onPrevious: () => void;
    onNext: () => void;
  };
  
  export default function DSPagination({
    page,
    totalPages,
    onPrevious,
    onNext,
  }: Props) {
    return (
      <div className="flex items-center justify-between border-t bg-white px-6 py-4">
        <button
          onClick={onPrevious}
          disabled={page === 1}
          className="rounded-lg border px-4 py-2 disabled:opacity-40"
        >
          Anterior
        </button>
  
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
  
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="rounded-lg border px-4 py-2 disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    );
  }