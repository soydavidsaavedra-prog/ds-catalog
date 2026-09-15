import "server-only";
import { getSupabaseClient } from "@/lib/db/supabaseClient";
import type { TestimonialRow } from "@/lib/db/supabase-types";
import type { Testimonial } from "@/lib/types/catalog";

export type TestimonialInput = Omit<Testimonial, "id">;

function fromRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    authorName: row.author_name,
    authorRole: row.author_role,
    quote: row.quote,
    rating: row.rating,
    active: row.active,
    order: row.order,
  };
}

function toRow(input: Partial<TestimonialInput>): Partial<TestimonialRow> {
  const row: Partial<TestimonialRow> = {};
  if (input.authorName !== undefined) row.author_name = input.authorName;
  if (input.authorRole !== undefined) row.author_role = input.authorRole;
  if (input.quote !== undefined) row.quote = input.quote;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.active !== undefined) row.active = input.active;
  if (input.order !== undefined) row.order = input.order;
  return row;
}

export async function listTestimonials(tenantId: string, opts?: { activeOnly?: boolean }): Promise<Testimonial[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("ns_testimonials").select("*").eq("tenant_id", tenantId).order("order", { ascending: true });
  if (opts?.activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data as TestimonialRow[]).map(fromRow);
}

export async function getTestimonialById(tenantId: string, id: string): Promise<Testimonial | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_testimonials")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as TestimonialRow) : null;
}

export async function createTestimonial(tenantId: string, input: TestimonialInput): Promise<Testimonial> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_testimonials")
    .insert({ ...toRow(input), tenant_id: tenantId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as TestimonialRow);
}

export async function updateTestimonial(
  tenantId: string,
  id: string,
  patch: Partial<TestimonialInput>,
): Promise<Testimonial | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ns_testimonials")
    .update(toRow(patch))
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data as TestimonialRow) : null;
}

export async function deleteTestimonial(tenantId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("ns_testimonials").delete().eq("tenant_id", tenantId).eq("id", id);
  if (error) throw error;
}
