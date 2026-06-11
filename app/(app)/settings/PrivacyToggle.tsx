"use client";

import { useState, useTransition } from "react";
import { updateVisibility } from "@/app/actions/settings";
import { Globe, Lock } from "lucide-react";

type Props = {
  current: "private" | "open";
};

export default function PrivacyToggle({ current }: Props) {
  const [visibility, setVisibility] = useState(current);
  const [isPending, startTransition] = useTransition();

  function toggle(v: "private" | "open") {
    if (v === visibility) return;
    setVisibility(v);
    startTransition(() => updateVisibility(v));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 leading-relaxed">
        Controls whether your portfolio can be discovered publicly. Assessor share links always work regardless of this setting.
      </p>
      <div className="flex gap-2">
        {(["private", "open"] as const).map((v) => {
          const active = visibility === v;
          const Icon = v === "private" ? Lock : Globe;
          return (
            <button
              key={v}
              onClick={() => toggle(v)}
              disabled={isPending}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
                active
                  ? "bg-[#000054] text-white border-[#000054]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon size={14} />
              {v === "private" ? "Private" : "Open"}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">
        {visibility === "private"
          ? "Only you and people with a share link can view your portfolio."
          : "Anyone with the URL can view your portfolio."}
      </p>
    </div>
  );
}
