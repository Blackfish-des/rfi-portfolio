import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EntryEditor from "@/components/journal/EntryEditor";
import type { SkillTagInput, MethodTagInput } from "@/app/actions/journal";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!entry) notFound();

  const { data: skillTags } = await supabase
    .from("entry_skills")
    .select("*")
    .eq("entry_id", id);

  const { data: methodTags } = await supabase
    .from("entry_methods")
    .select("*")
    .eq("entry_id", id);

  const skills: SkillTagInput[] = (skillTags ?? []).map((s) => ({
    skill_id: s.skill_id,
    skill_name: s.skill_name,
    domain_id: s.domain_id,
    domain_name: s.domain_name,
    dreyfus_level: s.dreyfus_level,
    reflection: s.reflection ?? "",
  }));

  const methods: MethodTagInput[] = (methodTags ?? []).map((m) => ({
    method_id: m.method_id ?? undefined,
    method_name: m.method_name,
    adaptation_note: m.adaptation_note ?? "",
  }));

  return (
    <EntryEditor
      mode="edit"
      entryId={entry.id}
      initial={{
        title: entry.title,
        course_title: entry.course_title ?? "",
        entry_date: entry.entry_date,
        content: entry.content as Record<string, unknown>,
        skills,
        methods,
      }}
    />
  );
}
