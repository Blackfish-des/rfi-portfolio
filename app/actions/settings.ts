"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateVisibility(visibility: "private" | "open") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: student } = await supabase
    .from("students").select("id").eq("auth_user_id", user.id).single();
  if (!student) throw new Error("Student not found");

  await supabase
    .from("portfolios")
    .update({ visibility })
    .eq("student_id", student.id);

  revalidatePath("/settings");
  revalidatePath("/portfolio");
}

export async function updateProfile(data: {
  name: string;
  cohort_year: string;
  profile_statement: string;
  bio: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: student } = await supabase
    .from("students").select("id").eq("auth_user_id", user.id).single();
  if (!student) throw new Error("Student not found");

  await supabase
    .from("students")
    .update({
      name: data.name,
      cohort_year: data.cohort_year ? parseInt(data.cohort_year) : null,
    })
    .eq("id", student.id);

  await supabase
    .from("portfolios")
    .update({
      profile_statement: data.profile_statement || null,
      bio: data.bio || null,
    })
    .eq("student_id", student.id);

  revalidatePath("/settings");
  revalidatePath("/portfolio");
}
