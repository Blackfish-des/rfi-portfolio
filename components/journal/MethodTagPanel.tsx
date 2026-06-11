"use client";

import { useState, useMemo } from "react";
import type { MethodTagInput } from "@/app/actions/journal";
import type { Method } from "@/app/actions/methods";
import { Search, X, ChevronDown, ChevronRight, ExternalLink, Plus } from "lucide-react";

type Props = {
  value: MethodTagInput[];
  onChange: (methods: MethodTagInput[]) => void;
  library: Method[];
};

const CATEGORY_ORDER = [
  "Relational Observation",
  "Systems Thinking",
  "Speculative Futures",
  "Speculative Storytelling",
  "Participatory Design",
  "Collaborative Enquiry",
  "Positionality Practice",
  "Place-Based Engagement",
  "Regenerative Design",
  "Circular Design",
  "The Regenerative Design Decision Evaluator",
  "Policy & Governance",
  "Interdisciplinary Practices",
];

export default function MethodTagPanel({ value, onChange, library }: Props) {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [adaptationNote, setAdaptationNote] = useState("");

  // Group library by category
  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? library.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q) ||
            (m.description ?? "").toLowerCase().includes(q)
        )
      : library;

    const map = new Map<string, Method[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const m of filtered) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    // Remove empty categories
    for (const [k, v] of map) if (v.length === 0) map.delete(k);
    return map;
  }, [library, search]);

  // Open all categories when searching
  const visibleOpenCategories = search.trim()
    ? new Set(grouped.keys())
    : openCategories;

  function toggleCategory(cat: string) {
    if (search.trim()) return; // search overrides accordion
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function isTagged(methodId: string) {
    return value.some((t) => t.method_id === methodId);
  }

  function tagMethod(method: Method, note: string) {
    if (isTagged(method.id)) return;
    onChange([
      ...value,
      {
        method_id: method.id,
        method_name: method.title,
        adaptation_note: note,
      },
    ]);
    setActiveMethod(null);
    setAdaptationNote("");
  }

  function removeMethod(methodId: string) {
    onChange(value.filter((t) => t.method_id !== methodId));
  }

  function openMethod(id: string) {
    if (activeMethod === id) {
      setActiveMethod(null);
      setAdaptationNote("");
    } else {
      setActiveMethod(id);
      setAdaptationNote("");
    }
  }

  return (
    <div className="space-y-3">
      {/* Tagged methods */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((tag, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2.5 py-2 bg-[#000054]/5 rounded-lg border border-[#000054]/10"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#000054] truncate">{tag.method_name}</p>
                {tag.adaptation_note && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tag.adaptation_note}</p>
                )}
              </div>
              <button
                onClick={() => removeMethod(tag.method_id!)}
                className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search methods…"
          className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Category accordions */}
      <div className="space-y-1">
        {grouped.size === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4">No methods found</p>
        )}
        {[...grouped.entries()].map(([category, methods]) => {
          const isOpen = visibleOpenCategories.has(category);
          const taggedCount = methods.filter((m) => isTagged(m.id)).length;

          return (
            <div key={category} className="rounded-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-gray-700 truncate">{category}</span>
                  <span className="text-xs text-gray-400 shrink-0">({methods.length})</span>
                  {taggedCount > 0 && (
                    <span className="text-xs font-bold text-white bg-[#000054] px-1.5 py-0.5 rounded-full shrink-0">
                      {taggedCount}
                    </span>
                  )}
                </div>
                {isOpen
                  ? <ChevronDown size={13} className="text-gray-400 shrink-0" />
                  : <ChevronRight size={13} className="text-gray-400 shrink-0" />
                }
              </button>

              {isOpen && (
                <div className="bg-white divide-y divide-gray-50">
                  {methods.map((method) => {
                    const tagged = isTagged(method.id);
                    const isActive = activeMethod === method.id;

                    return (
                      <div key={method.id}>
                        <button
                          onClick={() => !tagged && openMethod(method.id)}
                          className={`w-full text-left px-3 py-2 transition-colors ${
                            tagged
                              ? "opacity-40 cursor-default"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-medium ${tagged ? "text-gray-400" : "text-gray-800"}`}>
                              {method.title}
                            </span>
                            {tagged ? (
                              <span className="text-xs text-gray-400 shrink-0">added</span>
                            ) : (
                              <Plus size={12} className="text-gray-300 shrink-0" />
                            )}
                          </div>
                          {method.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {method.description}
                            </p>
                          )}
                        </button>

                        {isActive && !tagged && (
                          <div className="mx-3 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                            {method.purpose && (
                              <p className="text-xs text-gray-500 leading-relaxed">
                                <span className="font-medium text-gray-600">Purpose: </span>
                                {method.purpose}
                              </p>
                            )}
                            {method.resource_url && (
                              <a
                                href={method.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#000054] hover:underline"
                              >
                                <ExternalLink size={10} />
                                View resource
                              </a>
                            )}
                            <textarea
                              autoFocus
                              value={adaptationNote}
                              onChange={(e) => setAdaptationNote(e.target.value)}
                              placeholder="How did you use or adapt this method? (optional)"
                              rows={2}
                              className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white placeholder-gray-300"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => tagMethod(method, adaptationNote)}
                                className="flex-1 text-xs font-medium bg-[#000054] text-white py-1.5 rounded-lg"
                              >
                                Add to entry
                              </button>
                              <button
                                onClick={() => { setActiveMethod(null); setAdaptationNote(""); }}
                                className="text-xs text-gray-400 hover:text-gray-600 px-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
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
    </div>
  );
}
