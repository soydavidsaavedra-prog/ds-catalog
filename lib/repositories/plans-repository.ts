import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { PlanRow } from "@/lib/db/supabase-types";

export interface Plan {
  id: string;
  key: string;
  name: string;
  description: string;
  priceCents: number;
  maxProducts: number | null;
  maxStorageMb: number | null;
  maxImages: number | null;
  features: string[];
  active: boolean;
}

function fromRow(row: PlanRow): Plan {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    maxProducts: row.max_products,
    maxStorageMb: row.max_storage_mb,
    maxImages: row.max_images,
    features: row.features,
    active: row.active,
  };
}

export async function listPlans(): Promise<Plan[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("plans").select("*").order("price_cents", { ascending: true });
  if (error) throw error;
  return (data as PlanRow[]).map(fromRow);
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as PlanRow) : null;
}

export interface PlanInput {
  key: string;
  name: string;
  description: string;
  priceCents: number;
  maxProducts: number | null;
  maxStorageMb: number | null;
  maxImages: number | null;
  features: string[];
}

export async function createPlan(input: PlanInput): Promise<Plan> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plans")
    .insert({
      key: input.key,
      name: input.name,
      description: input.description,
      price_cents: input.priceCents,
      max_products: input.maxProducts,
      max_storage_mb: input.maxStorageMb,
      max_images: input.maxImages,
      features: input.features,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as PlanRow);
}

export async function setPlanActive(id: string, active: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("plans").update({ active }).eq("id", id);
  if (error) throw error;
}
