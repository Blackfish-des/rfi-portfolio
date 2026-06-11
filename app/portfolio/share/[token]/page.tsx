import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DOMAINS, SKILL_LEVELS } from "@/lib/rfi-skills";
import SkillsRadar from "@/components/skills/SkillsRadar";
import PrintButton from "@/components/portfolio/PrintButton";

const DOMAIN_SHORT: Record<string, string> = {
  "earth-systems": "Earth Systems",
  "design":        "Design",
  "creative":      "Creative",
  "economics":     "Economics",
  "governance":    "Governance",
  "indigenous":    "Relational Ethics",
  "technology":    "Technology",
  "leadership":    "Leadership",
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  // Resolve token → portfolio
  const { data: link } = await supabase
    .from("assessor_links")
    .select("portfolio_id, expires_at")
    .eq("token", token)
    .single();

  if (!link) notFound();
  if (link.expires_at && new Date(link.expires_at) < new Date()) notFound();

  const portfolioId = link.portfolio_id;

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, profile_statement, bio, student_id")
    .eq("id", portfolioId)
    .single();

  if (!portfolio) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("name, cohort_year")
    .eq("id", portfolio.student_id)
    .single();

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, title, entry_date, course_title, content")
    .eq("portfolio_id", portfolioId)
    .order("entry_date", { ascending: false });

  const entryIds = (entries ?? []).map((e) => e.id);

  const { data: skillRows } = entryIds.length > 0
    ? await supabase
        .from("entry_skills")
        .select("skill_id, skill_name, domain_id, dreyfus_level, reflection, entry_id")
        .in("entry_id", entryIds)
    : { data: [] };

  const { data: methodRows } = entryIds.length > 0
    ? await supabase
        .from("entry_methods")
        .select("method_name, entry_id")
        .in("entry_id", entryIds)
    : { data: [] };

  // Skill aggregation
  const skillMap = new Map<string, { skill_name: string; domain_id: string; max_level: number }>();
  for (const row of skillRows ?? []) {
    const ex = skillMap.get(row.skill_id);
    if (!ex || row.dreyfus_level > ex.max_level) {
      skillMap.set(row.skill_id, { skill_name: row.skill_name, domain_id: row.domain_id, max_level: row.dreyfus_level });
    }
  }

  const domainMaxLevel = new Map<string, number>();
  for (const { domain_id, max_level } of skillMap.values()) {
    const cur = domainMaxLevel.get(domain_id) ?? 0;
    if (max_level > cur) domainMaxLevel.set(domain_id, max_level);
  }

  const radarData = DOMAINS.map((d) => ({
    domain: d.name,
    shortName: DOMAIN_SHORT[d.id] ?? d.id,
    level: domainMaxLevel.get(d.id) ?? 0,
    color: d.color,
  }));

  const uniqueMethods = [...new Set((methodRows ?? []).map((m) => m.method_name))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E3001B]" />
        <span className="text-sm font-semibold text-[#000054]">RFI Portfolio</span>
        <span className="text-gray-300 mx-1">·</span>
        <span className="text-sm text-gray-500">Read-only assessor view</span>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#000054] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {(student?.name ?? "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student?.name}</h1>
              <p className="text-sm text-gray-500">RFI Minor{student?.cohort_year ? ` · Cohort ${student.cohort_year}` : ""}</p>
              {portfolio.profile_statement && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{portfolio.profile_statement}</p>
              )}
            </div>
          </div>
          {portfolio.bio && (
            <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">{portfolio.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Journal entries", value: entries?.length ?? 0 },
            { label: "Skills tracked", value: skillMap.size },
            { label: "Methods used", value: uniqueMethods.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-[#000054]">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Skills radar */}
        {skillMap.size > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Skills profile</h2>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <SkillsRadar data={radarData} />
              </div>
              <div className="lg:w-1/2 space-y-2 self-center">
                {DOMAINS.filter((d) => domainMaxLevel.has(d.id)).map((d) => {
                  const level = domainMaxLevel.get(d.id) ?? 0;
                  const levelLabel = SKILL_LEVELS.find((l) => l.level === level)?.label ?? "";
                  return (
                    <div key={d.id} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-gray-600 flex-1 truncate">{DOMAIN_SHORT[d.id]}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((l) => (
                          <span key={l} className="w-3 h-1 rounded-full"
                            style={{ backgroundColor: l <= level ? d.color : "#E5E7EB" }} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 w-24 text-right">{levelLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Skills by domain */}
        {skillMap.size > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Skills detail</h2>
            </div>
            {DOMAINS.map((domain) => {
              const domainSkills = [...skillMap.entries()]
                .filter(([, s]) => s.domain_id === domain.id)
                .sort((a, b) => b[1].max_level - a[1].max_level);
              if (domainSkills.length === 0) return null;
              return (
                <div key={domain.id}>
                  <div className="px-5 py-2 flex items-center gap-2" style={{ backgroundColor: domain.color + "12" }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: domain.color }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: domain.color }}>
                      {domain.name}
                    </span>
                  </div>
                  {domainSkills.map(([skillId, skill]) => {
                    const levelLabel = SKILL_LEVELS.find((l) => l.level === skill.max_level)?.label ?? "";
                    return (
                      <div key={skillId} className="px-5 py-3 border-t border-gray-50 flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-800">{skill.skill_name}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map((l) => (
                              <span key={l} className="w-4 h-1.5 rounded-full"
                                style={{ backgroundColor: l <= skill.max_level ? domain.color : "#E5E7EB" }} />
                            ))}
                          </div>
                          <span className="text-xs font-medium" style={{ color: domain.color }}>{levelLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Journal entries */}
        {(entries?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Journal entries</h2>
            <div className="space-y-2">
              {(entries ?? []).map((entry) => (
                <div key={entry.id} className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                    {entry.course_title && <p className="text-xs text-gray-400 mt-0.5">{entry.course_title}</p>}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 ml-4">
                    {new Date(entry.entry_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pb-4">
          Shared via RFI Portfolio · Read-only
        </p>
      </div>
    </div>
  );
}
