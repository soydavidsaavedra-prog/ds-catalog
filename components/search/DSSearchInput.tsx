"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function DSSearchInput({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Buscar productos..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
    />
  );
}