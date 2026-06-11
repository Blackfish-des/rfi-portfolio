"use client";

import { useState, useTransition } from "react";
import { createShareLink, deleteShareLink } from "@/app/actions/share";
import { Link2, Copy, Trash2, Plus, CheckCircle } from "lucide-react";

type ShareLink = {
  id: string;
  token: string;
  label: string | null;
  created_at: string;
  expires_at: string | null;
};

type Props = {
  shareLinks: ShareLink[];
  baseUrl: string;
  portfolioId: string;
};

export default function SharePanel({ shareLinks: initial, baseUrl }: Props) {
  const [links, setLinks] = useState(initial);
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCreate() {
    startTransition(async () => {
      const token = await createShareLink(label.trim() || undefined);
      // Optimistic update — page will revalidate on next load
      setLinks((prev) => [
        {
          id: crypto.randomUUID(),
          token,
          label: label.trim() || null,
          created_at: new Date().toISOString(),
          expires_at: null,
        },
        ...prev,
      ]);
      setLabel("");
    });
  }

  function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    startTransition(() => deleteShareLink(id));
  }

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(`${baseUrl}/portfolio/share/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Link2 size={14} className="text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Share with assessors</h2>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Generate a read-only link to share your portfolio. Links don't expire unless you delete them.
      </p>

      {/* Create */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Semester 1 assessor)"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
        />
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-medium bg-[#000054] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 shrink-0"
        >
          <Plus size={12} />
          Generate link
        </button>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No share links yet.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {link.label ?? "Untitled link"}
                </p>
                <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                  {baseUrl}/portfolio/share/{link.token.slice(0, 8)}…
                </p>
              </div>
              <button
                onClick={() => copyLink(link.token, link.id)}
                className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                title="Copy link"
              >
                {copiedId === link.id ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="Delete link"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
