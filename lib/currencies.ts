export type Currency = {
    code: string;
    symbol: string;
    decimals: number;
  };
  
  export const CURRENCIES: Currency[] = [
    {
      code: "USD",
      symbol: "$",
      decimals: 2,
    },
    {
      code: "EUR",
      symbol: "€",
      decimals: 2,
    },
    {
      code: "CLP",
      symbol: "$",
      decimals: 0,
    },
    {
      code: "COP",
      symbol: "$",
      decimals: 0,
    },
    {
      code: "MXN",
      symbol: "$",
      decimals: 2,
    },
  ];