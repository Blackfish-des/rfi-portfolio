"use server";

import { createClient } from "@/lib/supabase/server";

export type Method = {
  id: string;
  airtable_id: string | null;
  title: string;
  category: string;
  description: string | null;
  purpose: string | null;
  resource_url: string | null;
  skill_domain_ids: string[];
};

export async function getMethods(): Promise<Method[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("methods")
    .select("id, airtable_id, title, category, description, purpose, resource_url, skill_domain_ids")
    .order("category")
    .order("title");
  return (data ?? []) as Method[];
}
