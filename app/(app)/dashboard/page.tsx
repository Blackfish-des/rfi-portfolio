import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Network, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: student } = await supabase
    .from("students")
    .select("id, name, cohort_year")
    .eq("auth_user_id", user.id)
    .single();

  if (!student) redirect("/auth/signup");

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, visibility")
    .eq("student_id", student.id)
    .single();

  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select("id, title, course_title, entry_date")
    .eq("portfolio_id", portfolio?.id ?? "")
    .order("entry_date", { ascending: false })
    .limit(5);

  const entryIds = (recentEntries ?? []).map((e) => e.id);

  const { data: skillTags } = entryIds.length > 0
    ? await supabase
        .from("entry_skills")
        .select("skill_name, domain_name, domain_id, dreyfus_level")
        .in("entry_id", entryIds)
    : { data: [] };

  // Aggregate: highest dreyfus level per skill
  const skillMap = new Map<string, { domain_id: string; max_level: number }>();
  for (const tag of skillTags ?? []) {
    const existing = skillMap.get(tag.skill_name);
    if (!existing || tag.dreyfus_level > existing.max_level) {
      skillMap.set(tag.skill_name, { domain_id: tag.domain_id, max_level: tag.dreyfus_level });
    }
  }

  const totalEntries = recentEntries?.length ?? 0;
  const totalSkills = skillMap.size;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#000054]">
          Welcome back, {student.name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          RFI Minor · Cohort {student.cohort_year}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <BookOpen size={14} />
            Journal entries
          </div>
          <p className="text-3xl font-bold text-[#000054]">{totalEntries}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Network size={14} />
            Skills tracked
          </div>
          <p className="text-3xl font-bold text-[#000054]">{totalSkills}</p>
        </div>
      </div>

      {/* Skills snapshot */}
      {skillMap.size > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Skills developing
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(skillMap.entries()).map(([skillName, { domain_id, max_level }]) => (
              <span
                key={skillName}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: domainColor(domain_id) }}
              >
                {skillName}
                <span className="opacity-75">L{max_level}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent entries */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Recent entries
          </h2>
          <Link
            href="/journal/new"
            className="flex items-center gap-1 text-xs text-[#E3001B] font-medium hover:underline"
          >
            <Plus size={12} />
            New entry
          </Link>
        </div>

        {totalEntries === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-4">No journal entries yet.</p>
            <Link
              href="/journal/new"
              className="bg-[#E3001B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Write your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries!.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#000054]">
                    {entry.title}
                  </p>
                  {entry.course_title && (
                    <p className="text-xs text-gray-500 mt-0.5">{entry.course_title}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(entry.entry_date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function domainColor(domainId: string): string {
  const colors: Record<string, string> = {
    "earth-systems": "#065F46",
    "design":        "#1D4ED8",
    "creative":      "#7C3AED",
    "economics":     "#B45309",
    "governance":    "#000054",
    "indigenous":    "#9F1239",
    "technology":    "#0369A1",
    "leadership":    "#374151",
  };
  return colors[domainId] ?? "#6B7280";
}
