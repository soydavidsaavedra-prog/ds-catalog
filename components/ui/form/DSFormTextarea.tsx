"use client";

import { Controller, useFormContext } from "react-hook-form";
import DSTextarea from "./DSTextarea";

type Props = {
  name: string;
  label: string;
  rows?: number;
};

export default function DSFormTextarea({
  name,
  label,
  rows = 5,
}: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          <DSTextarea
            label={label}
            rows={rows}
            value={field.value ?? ""}
            onChange={field.onChange}
          />

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