"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createShareLink(label?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: student } = await supabase
    .from("students").select("id").eq("auth_user_id", user.id).single();
  if (!student) throw new Error("Student not found");

  const { data: portfolio } = await supabase
    .from("portfolios").select("id").eq("student_id", student.id).single();
  if (!portfolio) throw new Error("Portfolio not found");

  const token = randomUUID();

  const { data: link, error } = await supabase
    .from("assessor_links")
    .insert({ portfolio_id: portfolio.id, token, label: label ?? null })
    .select("id, token, label, created_at, expires_at")
    .single();
  if (error) throw new Error("Could not create share link");

  revalidatePath("/portfolio");
  return link;
}

export async function deleteShareLink(linkId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("assessor_links").delete().eq("id", linkId);
  if (error) throw new Error("Could not delete share link");
  revalidatePath("/portfolio");
}
