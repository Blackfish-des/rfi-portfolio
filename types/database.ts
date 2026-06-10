export type DreyfusLevel = 1 | 2 | 3 | 4 | 5;
export type Visibility = "private" | "cohort" | "public";
export type ReviewStatus = "draft" | "in-review" | "approved";

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          auth_user_id: string;
          name: string;
          email: string;
          cohort_year: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      portfolios: {
        Row: {
          id: string;
          student_id: string;
          visibility: Visibility;
          bio: string | null;
          profile_statement: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["portfolios"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["portfolios"]["Insert"]>;
      };
      journal_entries: {
        Row: {
          id: string;
          portfolio_id: string;
          course_id: string | null;
          course_title: string | null;
          title: string;
          content: Record<string, unknown>; // Tiptap JSON
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["journal_entries"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
      };
      entry_skills: {
        Row: {
          id: string;
          entry_id: string;
          skill_id: string;
          skill_name: string;
          domain_id: string;
          domain_name: string;
          dreyfus_level: DreyfusLevel;
          reflection: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["entry_skills"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["entry_skills"]["Insert"]>;
      };
      entry_methods: {
        Row: {
          id: string;
          entry_id: string;
          method_id: string | null;
          method_name: string;
          adaptation_note: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["entry_methods"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["entry_methods"]["Insert"]>;
      };
      methods: {
        Row: {
          id: string;
          airtable_id: string | null;
          title: string;
          category: string;
          description: string | null;
          purpose: string | null;
          visual_url: string | null;
          document_url: string | null;
          resource_url: string | null;
          contributor: string | null;
          reviewer: string | null;
          review_status: ReviewStatus;
          skill_domain_ids: string[];
          synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["methods"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["methods"]["Insert"]>;
      };
      assessor_links: {
        Row: {
          id: string;
          portfolio_id: string;
          token: string;
          label: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assessor_links"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["assessor_links"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
