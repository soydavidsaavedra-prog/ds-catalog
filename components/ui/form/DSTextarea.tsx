"use client";

type Props = {
  label: string;
  value: string;
  rows?: number;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export default function DSTextarea({
  label,
  value,
  rows = 5,
  onChange,
}: Props) {
  return (
    <div>

      <label className="mb-2 block font-medium">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-black"
      />

    </div>
  );
}