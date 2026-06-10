"use client";

import { useState } from "react";
import { DOMAINS, DREYFUS_LEVELS } from "@/lib/rfi-skills";
import type { SkillTagInput } from "@/app/actions/journal";
import { ChevronDown, ChevronRight, X } from "lucide-react";

type Props = {
  value: SkillTagInput[];
  onChange: (tags: SkillTagInput[]) => void;
};

export default function SkillTagPanel({ value, onChange }: Props) {
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set());
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  function toggleDomain(domainId: string) {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      next.has(domainId) ? next.delete(domainId) : next.add(domainId);
      return next;
    });
  }

  function getTag(skillId: string) {
    return value.find((t) => t.skill_id === skillId);
  }

  function addOrUpdateTag(tag: SkillTagInput) {
    onChange([...value.filter((t) => t.skill_id !== tag.skill_id), tag]);
  }

  function removeTag(skillId: string) {
    onChange(value.filter((t) => t.skill_id !== skillId));
    if (activeSkill === skillId) setActiveSkill(null);
  }

  return (
    <div className="space-y-1">
      {/* Tagged skills summary */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {value.map((tag) => {
            const domain = DOMAINS.find((d) => d.id === tag.domain_id);
            return (
              <span
                key={tag.skill_id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white font-medium"
                style={{ backgroundColor: domain?.color ?? "#6B7280" }}
              >
                {tag.skill_name}
                <span className="opacity-75">L{tag.dreyfus_level}</span>
                <button
                  onClick={() => removeTag(tag.skill_id)}
                  className="ml-0.5 hover:opacity-75"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Domain accordions */}
      {DOMAINS.map((domain) => {
        const isOpen = openDomains.has(domain.id);
        const domainTagCount = value.filter((t) => t.domain_id === domain.id).length;

        return (
          <div key={domain.id} className="rounded-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleDomain(domain.id)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: domain.color }}
                />
                <span className="text-xs font-medium text-gray-700 leading-tight">
                  {domain.name}
                </span>
                {domainTagCount > 0 && (
                  <span
                    className="text-xs font-bold text-white px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  >
                    {domainTagCount}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronDown size={13} className="text-gray-400 shrink-0" /> : <ChevronRight size={13} className="text-gray-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 py-2 space-y-1 bg-white">
                {domain.skills.map((skill) => {
                  const tag = getTag(skill.id);
                  const isActive = activeSkill === skill.id;

                  return (
                    <div key={skill.id}>
                      <button
                        onClick={() => setActiveSkill(isActive ? null : skill.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs ${
                          tag
                            ? "font-medium text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        style={tag ? { backgroundColor: domain.color } : {}}
                      >
                        <span>{skill.name}</span>
                        {tag && <span className="opacity-75 ml-1">L{tag.dreyfus_level}</span>}
                      </button>

                      {isActive && (
                        <SkillForm
                          skill={skill}
                          domain={domain}
                          existing={tag}
                          onSave={(t) => {
                            addOrUpdateTag(t);
                            setActiveSkill(null);
                          }}
                          onRemove={tag ? () => removeTag(skill.id) : undefined}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkillForm({
  skill,
  domain,
  existing,
  onSave,
  onRemove,
}: {
  skill: { id: string; name: string };
  domain: { id: string; name: string; color: string };
  existing?: SkillTagInput;
  onSave: (tag: SkillTagInput) => void;
  onRemove?: () => void;
}) {
  const [level, setLevel] = useState<number>(existing?.dreyfus_level ?? 0);
  const [reflection, setReflection] = useState(existing?.reflection ?? "");

  return (
    <div className="mt-1 mb-2 p-3 rounded-lg border bg-gray-50 space-y-3">
      <p className="text-xs font-semibold text-gray-700">
        Where are you with <span style={{ color: domain.color }}>{skill.name}</span>?
      </p>

      {/* Dreyfus selector */}
      <div className="space-y-1">
        {DREYFUS_LEVELS.map((l) => (
          <button
            key={l.level}
            onClick={() => setLevel(l.level)}
            className={`w-full text-left px-2.5 py-2 rounded-lg border transition-colors text-xs ${
              level === l.level
                ? "border-transparent text-white font-medium"
                : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
            }`}
            style={level === l.level ? { backgroundColor: domain.color } : {}}
          >
            <span className="font-semibold">{l.label}</span>
            <span className={`ml-1 ${level === l.level ? "opacity-80" : "text-gray-400"}`}>
              — {l.description}
            </span>
          </button>
        ))}
      </div>

      {/* Reflection */}
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="What were you working on with this skill? (optional)"
        rows={2}
        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
      />

      <div className="flex gap-2">
        <button
          disabled={level === 0}
          onClick={() =>
            onSave({
              skill_id: skill.id,
              skill_name: skill.name,
              domain_id: domain.id,
              domain_name: domain.name,
              dreyfus_level: level,
              reflection,
            })
          }
          className="flex-1 text-xs font-medium text-white py-1.5 rounded-lg disabled:opacity-40 transition-colors"
          style={{ backgroundColor: domain.color }}
        >
          {existing ? "Update" : "Add skill"}
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 px-2"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
