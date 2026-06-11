export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessor_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          portfolio_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          portfolio_id: string
          token?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          portfolio_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessor_links_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_methods: {
        Row: {
          adaptation_note: string | null
          created_at: string
          entry_id: string
          id: string
          method_id: string | null
          method_name: string
        }
        Insert: {
          adaptation_note?: string | null
          created_at?: string
          entry_id: string
          id?: string
          method_id?: string | null
          method_name: string
        }
        Update: {
          adaptation_note?: string | null
          created_at?: string
          entry_id?: string
          id?: string
          method_id?: string | null
          method_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_methods_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_skills: {
        Row: {
          created_at: string
          domain_id: string
          domain_name: string
          dreyfus_level: number
          entry_id: string
          id: string
          reflection: string | null
          skill_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          domain_name: string
          dreyfus_level: number
          entry_id: string
          id?: string
          reflection?: string | null
          skill_id: string
          skill_name: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          domain_name?: string
          dreyfus_level?: number
          entry_id?: string
          id?: string
          reflection?: string | null
          skill_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_skills_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_use_notes: string | null
          content: Json
          course_id: string | null
          course_title: string | null
          created_at: string
          entry_date: string
          id: string
          portfolio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_use_notes?: string | null
          content?: Json
          course_id?: string | null
          course_title?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          portfolio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_use_notes?: string | null
          content?: Json
          course_id?: string | null
          course_title?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          portfolio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      methods: {
        Row: {
          airtable_id: string | null
          category: string
          contributor: string | null
          created_at: string
          description: string | null
          document_url: string | null
          id: string
          purpose: string | null
          resource_url: string | null
          review_status: string
          reviewer: string | null
          skill_domain_ids: string[]
          synced_at: string | null
          title: string
          visual_url: string | null
        }
        Insert: {
          airtable_id?: string | null
          category: string
          contributor?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          purpose?: string | null
          resource_url?: string | null
          review_status?: string
          reviewer?: string | null
          skill_domain_ids?: string[]
          synced_at?: string | null
          title: string
          visual_url?: string | null
        }
        Update: {
          airtable_id?: string | null
          category?: string
          contributor?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          purpose?: string | null
          resource_url?: string | null
          review_status?: string
          reviewer?: string | null
          skill_domain_ids?: string[]
          synced_at?: string | null
          title?: string
          visual_url?: string | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          profile_statement: string | null
          student_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          profile_statement?: string | null
          student_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          profile_statement?: string | null
          student_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          auth_user_id: string
          cohort_year: number | null
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          auth_user_id: string
          cohort_year?: number | null
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          auth_user_id?: string
          cohort_year?: number | null
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
