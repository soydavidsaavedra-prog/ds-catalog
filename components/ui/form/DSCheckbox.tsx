"use client";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function DSCheckbox({
  label,
  checked,
  onChange,
}: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3">

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-5 w-5 rounded"
      />

      <span>{label}</span>

    </label>
  );
}