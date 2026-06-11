"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Save, CheckCircle } from "lucide-react";

type Props = {
  initial: {
    name: string;
    email: string;
    cohort_year: string;
    profile_statement: string;
    bio: string;
  };
};

export default function SettingsForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProfile(form);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Personal */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal</h2>

        <Field label="Full name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          />
        </Field>

        <Field label="Email" hint="Managed by your institution">
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white opacity-50 cursor-not-allowed outline-none"
          />
        </Field>

        <Field label="Cohort year">
          <input
            type="number"
            value={form.cohort_year}
            onChange={(e) => set("cohort_year", e.target.value)}
            placeholder="e.g. 2024"
            className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          />
        </Field>
      </section>

      {/* Portfolio */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Portfolio</h2>
          <p className="text-xs text-gray-400 mt-1">Visible to assessors on your shared portfolio page</p>
        </div>

        <Field label="Profile statement" hint="1–2 sentences on your practice focus and values">
          <textarea
            value={form.profile_statement}
            onChange={(e) => set("profile_statement", e.target.value)}
            rows={3}
            placeholder="e.g. I'm an interdisciplinary designer working at the intersection of systems thinking and community-led ecological restoration…"
            className="input resize-none"
          />
        </Field>

        <Field label="Bio" hint="Background, disciplines, what drew you to regenerative practice">
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={5}
            placeholder="Share your background and what brings you to this work…"
            className="input resize-none"
          />
        </Field>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 bg-[#000054] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle size={14} />
            Saved
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}
