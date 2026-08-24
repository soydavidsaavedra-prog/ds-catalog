import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { OrderRow } from "@/lib/db/supabase-types";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";

export interface OrderInput {
  items: OrderItem[];
  total: number;
  customerName?: string | null;
  customerPhone?: string | null;
}

function fromRow(row: OrderRow): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    items: row.items,
    total: Number(row.total),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status,
  };
}

export async function listOrders(tenantId: string): Promise<Order[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(fromRow);
}

export async function getOrderById(tenantId: string, id: string): Promise<Order | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as OrderRow) : null;
}

export async function createOrder(tenantId: string, input: OrderInput): Promise<Order> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_orders")
    .insert({
      tenant_id: tenantId,
      items: input.items,
      total: input.total,
      customer_name: input.customerName ?? null,
      customer_phone: input.customerPhone ?? null,
      status: "new",
    })
    .select("*")
    .single();

  if (error) throw error;
  return fromRow(data as OrderRow);
}

export async function updateOrderStatus(tenantId: string, id: string, status: OrderStatus): Promise<Order | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_orders")
    .update({ status })
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as OrderRow) : null;
}
