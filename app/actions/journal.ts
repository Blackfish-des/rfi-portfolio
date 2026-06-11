"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";

export type SkillTagInput = {
  skill_id: string;
  skill_name: string;
  domain_id: string;
  domain_name: string;
  dreyfus_level: number;
  reflection: string;
};

export type MethodTagInput = {
  method_id?: string;
  method_name: string;
  adaptation_note: string;
};

export type EntryInput = {
  title: string;
  course_id?: string;
  course_title?: string;
  entry_date: string;
  content: Record<string, unknown>;
  skills: SkillTagInput[];
  methods: MethodTagInput[];
  ai_use_notes?: string;
};

async function getPortfolioId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (!student) return null;

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("student_id", student.id)
    .single();

  return portfolio?.id ?? null;
}

export async function createEntry(input: EntryInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const portfolioId = await getPortfolioId(supabase, user.id);
  if (!portfolioId) throw new Error("Portfolio not found");

  const { data: entry, error } = await supabase
    .from("journal_entries")
    .insert({
      portfolio_id: portfolioId,
      title: input.title,
      course_id: input.course_id ?? null,
      course_title: input.course_title ?? null,
      entry_date: input.entry_date,
      content: input.content as Json,
      ai_use_notes: input.ai_use_notes ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Insert skill tags
  if (input.skills.length > 0) {
    await supabase.from("entry_skills").insert(
      input.skills.map((s) => ({ ...s, entry_id: entry.id }))
    );
  }

  // Insert method tags
  if (input.methods.length > 0) {
    await supabase.from("entry_methods").insert(
      input.methods.map((m) => ({ ...m, entry_id: entry.id }))
    );
  }

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  redirect(`/journal/${entry.id}`);
}

export async function updateEntry(entryId: string, input: EntryInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("journal_entries")
    .update({
      title: input.title,
      course_id: input.course_id ?? null,
      course_title: input.course_title ?? null,
      entry_date: input.entry_date,
      content: input.content as Json,
      ai_use_notes: input.ai_use_notes ?? null,
    })
    .eq("id", entryId);

  if (error) throw new Error(error.message);

  // Replace skill tags
  await supabase.from("entry_skills").delete().eq("entry_id", entryId);
  if (input.skills.length > 0) {
    await supabase.from("entry_skills").insert(
      input.skills.map((s) => ({ ...s, entry_id: entryId }))
    );
  }

  // Replace method tags
  await supabase.from("entry_methods").delete().eq("entry_id", entryId);
  if (input.methods.length > 0) {
    await supabase.from("entry_methods").insert(
      input.methods.map((m) => ({ ...m, entry_id: entryId }))
    );
  }

  revalidatePath(`/journal/${entryId}`);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}
