import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_DOMAINS: Record<string, string[]> = {
  "Relational Observation":                     ["indigenous", "earth-systems", "creative"],
  "Systems Thinking":                           ["earth-systems"],
  "Speculative Futures":                        ["creative", "earth-systems"],
  "Participatory Design":                       ["design", "indigenous", "governance"],
  "Policy & Governance":                        ["governance", "economics", "technology"],
  "Collaborative Enquiry":                      ["indigenous", "governance"],
  "Positionality Practice":                     ["indigenous", "earth-systems"],
  "Place-Based Engagement":                     ["earth-systems", "indigenous"],
  "Regenerative Design":                        ["design", "earth-systems", "indigenous"],
  "Circular Design":                            ["design", "earth-systems"],
  "The Regenerative Design Decision Evaluator": ["design", "economics"],
  "Speculative Storytelling":                   ["creative", "earth-systems"],
  "Interdisciplinary Practices":                ["earth-systems", "leadership"],
};

export async function POST(req: Request) {
  // Simple secret check — set SYNC_SECRET in .env.local
  const secret = req.headers.get("x-sync-secret");
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_METHODS_TABLE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !tableId || !pat) {
    return NextResponse.json({ error: "Airtable env vars missing" }, { status: 500 });
  }

  // Paginate Airtable
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Airtable fetch failed", status: res.status }, { status: 502 });
    }

    const data = await res.json() as { records: AirtableRecord[]; offset?: string };
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  // Map records
  const rows = records
    .map((r) => {
      const f = r.fields;
      const title = (f["Title"] as string ?? "").trim();
      if (!title) return null;
      const cat = ((f["Primary Category Name"] as string[]) ?? [])[0] ?? "Unknown";
      const domains = CATEGORY_DOMAINS[cat] ?? [];
      const visuals = (f["Visual Example"] as Attachment[] | undefined) ?? [];
      const resourceUrls = (f["Resource URLs"] as string | undefined) ?? "";
      const resourceUrl = resourceUrls.split("\n")[0].trim() || null;
      return {
        airtable_id: r.id,
        title,
        category: cat,
        description: (f["Description"] as string | null) ?? null,
        purpose: (f["Purpose"] as string | null) ?? null,
        resource_url: resourceUrl,
        visual_url: visuals[0]?.url ?? null,
        skill_domain_ids: domains,
        review_status: "approved",
        synced_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  const supabase = await createClient();

  const { error } = await supabase
    .from("methods")
    .upsert(rows as never[], { onConflict: "airtable_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: rows.length, timestamp: new Date().toISOString() });
}

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type Attachment = {
  id: string;
  url: string;
};
