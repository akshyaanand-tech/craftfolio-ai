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
      career_goals: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          target_industry: string | null
          target_role: string | null
          timeline: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          target_industry?: string | null
          target_role?: string | null
          timeline?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          target_industry?: string | null
          target_role?: string | null
          timeline?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          company: string | null
          content: string | null
          created_at: string
          id: string
          role: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          content?: string | null
          created_at?: string
          id?: string
          role?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          content?: string | null
          created_at?: string
          id?: string
          role?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string | null
          end_date: string | null
          field: string | null
          gpa: string | null
          id: string
          school: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          end_date?: string | null
          field?: string | null
          gpa?: string | null
          id?: string
          school: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          end_date?: string | null
          field?: string | null
          gpa?: string | null
          id?: string
          school?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          role: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string | null
          company: string
          created_at: string
          id: string
          notes: string | null
          position: number
          role: string
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          role: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          role?: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          about: string | null
          created_at: string
          hero: Json | null
          id: string
          sections: Json | null
          slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          hero?: Json | null
          id?: string
          sections?: Json | null
          slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          created_at?: string
          hero?: Json | null
          id?: string
          sections?: Json | null
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          career_path: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          onboarding_completed: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          career_path?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id: string
          onboarding_completed?: boolean
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          career_path?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          onboarding_completed?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: Json
          created_at: string
          id: string
          template: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          template?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          level: string | null
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          level?: string | null
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          repo: string | null
          tags: string[] | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          repo?: string | null
          tags?: string[] | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          repo?: string | null
          tags?: string[] | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      job_status: "applied" | "assessment" | "interview" | "offer" | "rejected"
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
    Enums: {
      job_status: ["applied", "assessment", "interview", "offer", "rejected"],
    },
  },
} as const
