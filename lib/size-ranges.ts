export type SizeRange = {
    id: string;
    name: string;
    sizes: number[];
  };
  
  export const SIZE_RANGES: SizeRange[] = [
    {
      id: "women",
      name: "Dama",
      sizes: [35, 36, 37, 38, 39, 40],
    },
  
    {
      id: "men",
      name: "Caballero",
      sizes: [39, 40, 41, 42, 43, 44, 45],
    },
  
    {
      id: "kids",
      name: "Niño",
      sizes: [
        22,23,24,25,26,27,
        28,29,30,31,32,33,34
      ],
    },
  
    {
      id: "baby",
      name: "Bebé",
      sizes:[
        16,17,18,19,20,21
      ],
    },
  
    {
      id:"boots",
      name:"Botas",
      sizes:[
        35,36,37,38,39,
        40,41,42,43,44,45,46
      ],
    },
  ];
  
  export function getSizeRange(
    id: string
  ) {
    return (
      SIZE_RANGES.find(
        (range) => range.id === id
      ) ?? SIZE_RANGES[0]
    );
  }