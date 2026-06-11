import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DOMAINS, SKILL_LEVELS } from "@/lib/rfi-skills";
import Link from "next/link";

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: student } = await supabase
    .from("students").select("id").eq("auth_user_id", user.id).single();

  const { data: portfolio } = await supabase
    .from("portfolios").select("id").eq("student_id", student?.id ?? "").single();

  const { data: entries } = portfolio ? await supabase
    .from("journal_entries")
    .select("id, title, entry_date")
    .eq("portfolio_id", portfolio.id)
    : { data: [] };

  const entryIds = (entries ?? []).map((e) => e.id);
  const entryMap = new Map((entries ?? []).map((e) => [e.id, e]));

  const { data: skillRows } = entryIds.length > 0 ? await supabase
    .from("entry_skills")
    .select("skill_id, skill_name, domain_id, dreyfus_level, reflection, entry_id")
    .in("entry_id", entryIds)
    : { data: [] };

  type SkillInstance = {
    dreyfus_level: number;
    reflection: string | null;
    entry_id: string;
    entry_title: string;
    entry_date: string;
  };
  type SkillSummary = {
    skill_name: string;
    domain_id: string;
    max_level: number;
    instances: SkillInstance[];
  };

  const skillMap = new Map<string, SkillSummary>();
  for (const row of skillRows ?? []) {
    const entry = entryMap.get(row.entry_id);
    if (!entry) continue;
    const instance: SkillInstance = {
      dreyfus_level: row.dreyfus_level,
      reflection: row.reflection,
      entry_id: row.entry_id,
      entry_title: entry.title,
      entry_date: entry.entry_date,
    };
    const existing = skillMap.get(row.skill_id);
    if (existing) {
      existing.instances.push(instance);
      if (row.dreyfus_level > existing.max_level) existing.max_level = row.dreyfus_level;
    } else {
      skillMap.set(row.skill_id, {
        skill_name: row.skill_name,
        domain_id: row.domain_id,
        max_level: row.dreyfus_level,
        instances: [instance],
      });
    }
  }

  const totalSkills = skillMap.size;
  const totalDomains = new Set([...skillMap.values()].map((s) => s.domain_id)).size;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#000054]">Skills</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalSkills} skill{totalSkills !== 1 ? "s" : ""} across {totalDomains} domain{totalDomains !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="text-xs bg-[#E3001B] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          + New entry
        </Link>
      </div>

      {totalSkills === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            No skills tracked yet. Tag skills in your journal entries to see them here.
          </p>
          <Link
            href="/journal/new"
            className="bg-[#E3001B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Write an entry
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {DOMAINS.map((domain) => {
            const domainSkills = [...skillMap.entries()]
              .filter(([, s]) => s.domain_id === domain.id)
              .sort((a, b) => b[1].max_level - a[1].max_level);
            if (domainSkills.length === 0) return null;
            return (
              <div key={domain.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: domain.color + "15" }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: domain.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: domain.color }}>
                    {domain.name}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {domainSkills.map(([skillId, skill]) => {
                    const levelLabel = SKILL_LEVELS.find((l) => l.level === skill.max_level)?.label ?? "";
                    const sorted = [...skill.instances].sort(
                      (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
                    );
                    return (
                      <div key={skillId} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <p className="text-sm font-medium text-gray-900">{skill.skill_name}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((l) => (
                                <span
                                  key={l}
                                  className="w-4 h-1.5 rounded-full"
                                  style={{ backgroundColor: l <= skill.max_level ? domain.color : "#E5E7EB" }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium" style={{ color: domain.color }}>
                              {levelLabel}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sorted.map((inst, i) => (
                            <Link
                              key={i}
                              href={`/journal/${inst.entry_id}`}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded px-2 py-0.5 transition-colors"
                            >
                              <span>
                                {new Date(inst.entry_date).toLocaleDateString("en-AU", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="truncate max-w-[140px]">{inst.entry_title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
