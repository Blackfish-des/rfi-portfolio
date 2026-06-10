import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, ChevronRight } from "lucide-react";

export default async function JournalPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("student_id", student?.id ?? "")
    .single();

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, title, course_title, entry_date")
    .eq("portfolio_id", portfolio?.id ?? "")
    .order("entry_date", { ascending: false });

  // Group by course
  const grouped = new Map<string, typeof entries>();
  for (const entry of entries ?? []) {
    const key = entry.course_title ?? "General";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000054]">Field Journal</h1>
          <p className="text-gray-500 text-sm mt-1">
            {entries?.length ?? 0} {entries?.length === 1 ? "entry" : "entries"} across your minor
          </p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 bg-[#E3001B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus size={14} />
          New entry
        </Link>
      </div>

      {grouped.size === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">Your field journal is empty.</p>
          <Link
            href="/journal/new"
            className="bg-[#E3001B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Write your first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([courseName, courseEntries]) => (
            <div key={courseName}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#E3001B]" />
                <h2 className="text-sm font-semibold text-gray-700">{courseName}</h2>
                <span className="text-xs text-gray-400">{courseEntries?.length} {courseEntries?.length === 1 ? "entry" : "entries"}</span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {(courseEntries ?? []).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-[#000054]">
                        {entry.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.entry_date).toLocaleDateString("en-AU", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
