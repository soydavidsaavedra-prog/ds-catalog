export type TableColumn<T> = {

    key: keyof T;
  
    label: string;
  
    sortable?: boolean;
  
    width?: number;
  
  };