import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const result = await supabase
    .from("products")
    .select("*");

  console.log(result);

  return (
    <main className="p-10">
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}