"use client";

type Props = {
  onSelect: (files: FileList | null) => void;
  disabled?: boolean;
};

export default function DSUploadButton({
  onSelect,
  disabled = false,
}: Props) {
  return (
    <label
      className={`flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed transition ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60"
          : "cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="text-center">
        <p className="font-medium">
          Seleccionar imágenes
        </p>

        <p className="mt-2 text-sm text-gray-500">
          JPG, PNG o WEBP
        </p>
      </div>

      <input
        hidden
        multiple
        disabled={disabled}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) =>
          onSelect(e.target.files)
        }
      />
    </label>
  );
}