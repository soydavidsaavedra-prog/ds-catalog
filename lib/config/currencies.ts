/**
 * Curated list of currencies a tenant can pick for their storefront. Each
 * entry carries its own `locale` (not a single global one) so `formatPrice`
 * renders the symbol/grouping a shopper in that currency actually expects —
 * e.g. VES as "Bs.S 1.234,56" via es-VE, not "VES 1,234.56" via en-US.
 */
export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "Dólar estadounidense", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "es-ES" },
  { code: "VES", label: "Bolívar venezolano", symbol: "Bs.S", locale: "es-VE" },
  { code: "COP", label: "Peso colombiano", symbol: "$", locale: "es-CO" },
  { code: "ARS", label: "Peso argentino", symbol: "$", locale: "es-AR" },
  { code: "MXN", label: "Peso mexicano", symbol: "$", locale: "es-MX" },
  { code: "PEN", label: "Sol peruano", symbol: "S/", locale: "es-PE" },
  { code: "CLP", label: "Peso chileno", symbol: "$", locale: "es-CL" },
  { code: "BOB", label: "Boliviano", symbol: "Bs", locale: "es-BO" },
  { code: "BRL", label: "Real brasileño", symbol: "R$", locale: "pt-BR" },
  { code: "GBP", label: "Libra esterlina", symbol: "£", locale: "en-GB" },
];

const CURRENCY_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

const FALLBACK: CurrencyOption = { code: "USD", label: "Dólar estadounidense", symbol: "$", locale: "en-US" };

export function getCurrencyMeta(code: string): CurrencyOption {
  return CURRENCY_BY_CODE.get(code) ?? { ...FALLBACK, code: code || FALLBACK.code };
}
