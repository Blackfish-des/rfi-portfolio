"use client";

import { useState, useCallback, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import SkillTagPanel from "./SkillTagPanel";
import MethodTagPanel from "./MethodTagPanel";
import AiUsePanel from "./AiUsePanel";
import type { SkillTagInput, MethodTagInput, EntryInput } from "@/app/actions/journal";
import type { Method } from "@/app/actions/methods";
import { createEntry, updateEntry } from "@/app/actions/journal";
import {
  Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon,
  Save, BookOpen, Brain, Sparkles,
} from "lucide-react";

type Props = {
  mode: "new" | "edit";
  entryId?: string;
  methodLibrary: Method[];
  initial?: {
    title: string;
    course_title: string;
    entry_date: string;
    content: Record<string, unknown>;
    skills: SkillTagInput[];
    methods: MethodTagInput[];
    ai_use_notes: string;
  };
};

export default function EntryEditor({ mode, entryId, methodLibrary, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [courseTitle, setCourseTitle] = useState(initial?.course_title ?? "");
  const [entryDate, setEntryDate] = useState(
    initial?.entry_date ?? new Date().toISOString().split("T")[0]
  );
  const [skills, setSkills] = useState<SkillTagInput[]>(initial?.skills ?? []);
  const [methods, setMethods] = useState<MethodTagInput[]>(initial?.methods ?? []);
  const [aiUseNotes, setAiUseNotes] = useState(initial?.ai_use_notes ?? "");
  const [activeTab, setActiveTab] = useState<"skills" | "methods" | "ai">("skills");
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your field journal entry here…" }),
      Link.configure({ openOnClick: false }),
    ],
    content: initial?.content ?? "",
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none focus:outline-none min-h-[300px] px-0",
      },
    },
  });

  const buildInput = useCallback((): EntryInput => ({
    title: title || "Untitled entry",
    course_title: courseTitle || undefined,
    entry_date: entryDate,
    content: (editor?.getJSON() ?? {}) as Record<string, unknown>,
    skills,
    methods,
    ai_use_notes: aiUseNotes || undefined,
  }), [title, courseTitle, entryDate, editor, skills, methods, aiUseNotes]);

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        const input = buildInput();
        if (mode === "new") {
          await createEntry(input);
        } else if (entryId) {
          await updateEntry(entryId, input);
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full min-h-screen bg-gray-50">
      {/* Left — editor */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-300 shrink-0"
            />
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Course (e.g. Fundamentals of Regenerative Futures)"
              className="flex-1 min-w-0 text-sm text-gray-600 bg-transparent border-0 focus:outline-none placeholder-gray-300"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-[#E3001B] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <Save size={12} />
            {isPending ? "Saving…" : mode === "new" ? "Save entry" : "Save changes"}
          </button>
        </div>

        {/* Title */}
        <div className="bg-white px-6 pt-6 pb-3 border-b border-gray-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title"
            className="w-full text-2xl font-bold text-[#000054] bg-transparent border-0 focus:outline-none placeholder-gray-200"
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-1">
          {[
            { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
            { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
            { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
            { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
            { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
          ].map(({ icon: Icon, action, active }, i) => (
            <button
              key={i}
              onClick={action}
              className={`p-1.5 rounded transition-colors ${
                active ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => {
              const url = window.prompt("URL:");
              if (url) editor?.chain().focus().setLink({ href: url }).run();
            }}
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LinkIcon size={14} />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white px-6 py-5 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {saveError && (
          <div className="bg-red-50 border-t border-red-100 px-6 py-2 text-xs text-red-600">
            {saveError}
          </div>
        )}
      </div>

      {/* Right — tagging panel */}
      <div className="w-full lg:w-80 border-l border-gray-200 bg-white flex flex-col shrink-0">
        {/* Tab header */}
        <div className="flex border-b border-gray-200">
          {(["skills", "methods", "ai"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#000054] text-[#000054]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "skills" && <><Brain size={13} />{`Skills${skills.length > 0 ? ` (${skills.length})` : ""}`}</>}
              {tab === "methods" && <><BookOpen size={13} />{`Methods${methods.length > 0 ? ` (${methods.length})` : ""}`}</>}
              {tab === "ai" && (
                <>
                  <Sparkles size={13} />
                  <span>AI use{aiUseNotes ? " ✓" : ""}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "skills" && (
            <div>
              <p className="text-xs text-gray-500 mb-3">
                Which skills were you developing in this entry?
              </p>
              <SkillTagPanel value={skills} onChange={setSkills} />
            </div>
          )}
          {activeTab === "methods" && (
            <MethodTagPanel value={methods} onChange={setMethods} library={methodLibrary} />
          )}
          {activeTab === "ai" && (
            <AiUsePanel value={aiUseNotes} onChange={setAiUseNotes} />
          )}
        </div>
      </div>
    </div>
  );
}
