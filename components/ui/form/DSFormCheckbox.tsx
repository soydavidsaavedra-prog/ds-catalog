"use client";

import { Controller, useFormContext } from "react-hook-form";
import DSCheckbox from "./DSCheckbox";

type Props = {
  name: string;
  label: string;
};

export default function DSFormCheckbox({
  name,
  label,
}: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DSCheckbox
          label={label}
          checked={field.value ?? false}
          onChange={field.onChange}
        />
      )}
    />
  );
}