export type OrderStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface OrderItem {
  productId: string;
  reference: string;
  name: string;
  image: string;
  slug: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  status: OrderStatus;
}
