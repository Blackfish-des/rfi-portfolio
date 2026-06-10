"use client";

import { useState } from "react";
import type { MethodTagInput } from "@/app/actions/journal";
import { Plus, X } from "lucide-react";

type Props = {
  value: MethodTagInput[];
  onChange: (methods: MethodTagInput[]) => void;
};

export default function MethodTagPanel({ value, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [methodName, setMethodName] = useState("");
  const [adaptationNote, setAdaptationNote] = useState("");

  function addMethod() {
    if (!methodName.trim()) return;
    onChange([...value, { method_name: methodName.trim(), adaptation_note: adaptationNote.trim() }]);
    setMethodName("");
    setAdaptationNote("");
    setAdding(false);
  }

  function removeMethod(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {/* Existing methods */}
      {value.map((method, i) => (
        <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{method.method_name}</p>
            {method.adaptation_note && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{method.adaptation_note}</p>
            )}
          </div>
          <button onClick={() => removeMethod(i)} className="text-gray-300 hover:text-gray-500 shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}

      {/* Add form */}
      {adding ? (
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
          <input
            autoFocus
            type="text"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            placeholder="Method or approach name"
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMethod(); } }}
          />
          <textarea
            value={adaptationNote}
            onChange={(e) => setAdaptationNote(e.target.value)}
            placeholder="How did you use or adapt it? (optional)"
            rows={2}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={addMethod}
              disabled={!methodName.trim()}
              className="flex-1 text-xs font-medium bg-[#000054] text-white py-1.5 rounded-lg disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setMethodName(""); setAdaptationNote(""); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
        >
          <Plus size={12} />
          Add a method or approach
        </button>
      )}

      {value.length === 0 && !adding && (
        <p className="text-xs text-gray-400 italic">
          Tag methods from the RFI library or your own approaches.
        </p>
      )}
    </div>
  );
}
