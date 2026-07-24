import { CURRENCIES } from "./currencies";

export function formatCurrency(
  value: number,
  code: string
) {
  const currency =
    CURRENCIES.find(
      (c) => c.code === code
    );

  return new Intl.NumberFormat(
    "es-ES",
    {
      style: "currency",
      currency: code,
      minimumFractionDigits:
        currency?.decimals ?? 2,
    }
  ).format(value);
} 