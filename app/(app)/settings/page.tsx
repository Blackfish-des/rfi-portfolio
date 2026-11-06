import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, cohort_year")
    .eq("auth_user_id", user.id)
    .single();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("profile_statement, bio")
    .eq("student_id", student?.id ?? "")
    .single();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#000054] mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Your profile and portfolio details</p>

      <div className="space-y-8">
        <SettingsForm
          initial={{
            name: student?.name ?? "",
            email: student?.email ?? user.email ?? "",
            cohort_year: student?.cohort_year?.toString() ?? "",
            profile_statement: portfolio?.profile_statement ?? "",
            bio: portfolio?.bio ?? "",
          }}
        />

        {/* Privacy */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Privacy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your portfolio is private. Assessors can only see it through a share link you create, and that link expires after 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}
