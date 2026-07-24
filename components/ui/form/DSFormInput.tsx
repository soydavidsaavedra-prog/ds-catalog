"use client";

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

import DSInput from "@/components/ui/DSInput";

type Props<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
};

export default function DSFormInput<
  T extends FieldValues = FieldValues,
>({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  required,
  helperText,
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <DSInput
            label={required ? `${label} *` : label}
            type={type}
            value={field.value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              const value =
                type === "number"
                  ? e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                  : e.target.value;

              field.onChange(value);
            }}
          />

          {helperText && (
            <p className="text-xs text-gray-500">
              {helperText}
            </p>
          )}

          {errors[name] && (
            <p className="text-sm text-red-500">
              {String(errors[name]?.message)}
            </p>
          )}
        </div>
      )}
    />
  );
}