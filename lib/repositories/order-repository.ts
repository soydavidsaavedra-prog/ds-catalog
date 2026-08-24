import "server-only";
import { randomUUID } from "node:crypto";
import { createJsonStore } from "@/lib/db/jsonStore";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";

const store = createJsonStore<Order[]>("orders", []);

export interface OrderInput {
  items: OrderItem[];
  total: number;
  customerName?: string | null;
  customerPhone?: string | null;
}

export async function listOrders(): Promise<Order[]> {
  const orders = await store.read();
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await store.read();
  return orders.find((o) => o.id === id) ?? null;
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const orders = await store.read();
  const order: Order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    items: input.items,
    total: input.total,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    status: "new",
  };
  await store.write([order, ...orders]);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const orders = await store.read();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated = { ...orders[index], status };
  const next = [...orders];
  next[index] = updated;
  await store.write(next);
  return updated;
}
