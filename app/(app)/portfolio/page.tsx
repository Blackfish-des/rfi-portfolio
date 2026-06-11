import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DOMAINS, SKILL_LEVELS } from "@/lib/rfi-skills";
import Link from "next/link";
import SkillsRadar from "@/components/skills/SkillsRadar";
import SharePanel from "./SharePanel";
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

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: student } = await supabase
    .from("students").select("id, name, email, cohort_year").eq("auth_user_id", user.id).single();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, profile_statement, bio, visibility")
    .eq("student_id", student?.id ?? "")
    .single();

  const { data: entries } = portfolio ? await supabase
    .from("journal_entries").select("id, title, entry_date, course_title").eq("portfolio_id", portfolio.id)
    .order("entry_date", { ascending: false })
    : { data: [] };

  const entryIds = (entries ?? []).map((e) => e.id);

  const { data: skillRows } = entryIds.length > 0 ? await supabase
    .from("entry_skills")
    .select("skill_id, skill_name, domain_id, dreyfus_level, entry_id")
    .in("entry_id", entryIds)
    : { data: [] };

  const { data: methodRows } = entryIds.length > 0 ? await supabase
    .from("entry_methods")
    .select("method_name, entry_id")
    .in("entry_id", entryIds)
    : { data: [] };

  // Highest skill level per skill
  const skillMap = new Map<string, { skill_name: string; domain_id: string; max_level: number }>();
  for (const row of skillRows ?? []) {
    const ex = skillMap.get(row.skill_id);
    if (!ex || row.dreyfus_level > ex.max_level) {
      skillMap.set(row.skill_id, { skill_name: row.skill_name, domain_id: row.domain_id, max_level: row.dreyfus_level });
    }
  }

  // Max level per domain for radar
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

  const { data: shareLinks } = await supabase
    .from("assessor_links")
    .select("id, token, label, created_at, expires_at")
    .eq("portfolio_id", portfolio?.id ?? "")
    .order("created_at", { ascending: false });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000054]">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">How your practice looks to an assessor or reviewer</p>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
          <Link
            href="/settings"
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: "#000054" }}
          >
            {(student?.name ?? "S").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{student?.name}</h2>
            <p className="text-sm text-gray-500">
              RFI Minor{student?.cohort_year ? ` · Cohort ${student.cohort_year}` : ""}
            </p>
            {portfolio?.profile_statement ? (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{portfolio.profile_statement}</p>
            ) : (
              <Link href="/settings" className="text-xs text-gray-400 hover:text-gray-600 mt-2 inline-block">
                + Add a profile statement
              </Link>
            )}
          </div>
        </div>
        {portfolio?.bio && (
          <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">
            {portfolio.bio}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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

      {/* Radar + domain level breakdown */}
      {skillMap.size > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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

      {/* Recent entries */}
      {(entries?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Journal entries</h2>
          <div className="space-y-1">
            {(entries ?? []).slice(0, 8).map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="flex items-start justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-[#000054]">{entry.title}</p>
                  {entry.course_title && <p className="text-xs text-gray-400 mt-0.5">{entry.course_title}</p>}
                </div>
                <p className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(entry.entry_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share panel */}
      <SharePanel shareLinks={shareLinks ?? []} baseUrl={baseUrl} portfolioId={portfolio?.id ?? ""} />
    </div>
  );
}
