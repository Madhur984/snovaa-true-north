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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          suggestion_data: Json
          suggestion_type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          suggestion_data: Json
          suggestion_type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          suggestion_data?: Json
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoint_records: {
        Row: {
          checkpoint_id: string
          id: string
          participant_id: string
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          checkpoint_id: string
          id?: string
          participant_id: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          checkpoint_id?: string
          id?: string
          participant_id?: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkpoint_records_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "event_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoint_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoint_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          profile_id: string
          status: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          profile_id: string
          status?: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_organizers: {
        Row: {
          added_at: string
          club_id: string
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          added_at?: string
          club_id: string
          id?: string
          profile_id: string
          role?: string
        }
        Update: {
          added_at?: string
          club_id?: string
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_organizers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_organizers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          category: string
          city_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: string
          verified_at: string | null
        }
        Insert: {
          category: string
          city_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          category?: string
          city_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_blueprints: {
        Row: {
          category: string
          created_at: string
          default_config: Json
          default_modules: Json
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          default_config?: Json
          default_modules?: Json
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          default_config?: Json
          default_modules?: Json
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_checkpoints: {
        Row: {
          created_at: string
          event_id: string
          id: string
          location: string | null
          name: string
          sequence_order: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          location?: string | null
          name: string
          sequence_order: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          location?: string | null
          name?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_checkpoints_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_lifecycle_log: {
        Row: {
          changed_at: string
          changed_by: string
          event_id: string
          id: string
          new_status: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          event_id: string
          id?: string
          new_status: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          event_id?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_lifecycle_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          event_id: string
          id: string
          media_type: string
          status: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          event_id: string
          id?: string
          media_type: string
          status?: string
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          event_id?: string
          id?: string
          media_type?: string
          status?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_media_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_modules: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean
          event_id: string
          id: string
          module_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          event_id: string
          id?: string
          module_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean
          event_id?: string
          id?: string
          module_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_modules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          blueprint_id: string | null
          city_id: string | null
          club_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          max_participants: number | null
          organizer_id: string
          published_at: string | null
          start_time: string
          status: string
          title: string
          venue: string
        }
        Insert: {
          blueprint_id?: string | null
          city_id?: string | null
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          max_participants?: number | null
          organizer_id: string
          published_at?: string | null
          start_time: string
          status?: string
          title: string
          venue: string
        }
        Update: {
          blueprint_id?: string | null
          city_id?: string | null
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          max_participants?: number | null
          organizer_id?: string
          published_at?: string | null
          start_time?: string
          status?: string
          title?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "event_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participation_ledger: {
        Row: {
          action: string
          event_id: string
          id: string
          metadata: Json | null
          participant_id: string
          recorded_at: string
          recorded_by: string | null
        }
        Insert: {
          action: string
          event_id: string
          id?: string
          metadata?: Json | null
          participant_id: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Update: {
          action?: string
          event_id?: string
          id?: string
          metadata?: Json | null
          participant_id?: string
          recorded_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participation_ledger_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_ledger_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_ledger_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      reminder_log: {
        Row: {
          event_id: string
          id: string
          participant_id: string
          reminder_type: string
          sent_at: string
        }
        Insert: {
          event_id: string
          id?: string
          participant_id: string
          reminder_type?: string
          sent_at?: string
        }
        Update: {
          event_id?: string
          id?: string
          participant_id?: string
          reminder_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_log_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_access: {
        Row: {
          access_token: string
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          permissions: Json | null
          sponsor_name: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          event_id: string
          expires_at?: string | null
          id?: string
          permissions?: Json | null
          sponsor_name: string
        }
        Update: {
          access_token?: string
          created_at?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          permissions?: Json | null
          sponsor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_access_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_participation_count: {
        Args: { p_event_id: string }
        Returns: {
          attended: number
          cancelled: number
          confirmed: number
          registered: number
        }[]
      }
      get_participation_status: {
        Args: { p_event_id: string; p_participant_id: string }
        Returns: string
      }
      get_user_participation_stats: {
        Args: { p_user_id?: string }
        Returns: {
          attendance_rate: number
          total_attended: number
          total_registered: number
          unique_cities: number
          unique_clubs: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      transition_event_status: {
        Args: { p_event_id: string; p_new_status: string; p_reason?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "participant" | "organizer" | "sponsor" | "admin"
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
      app_role: ["participant", "organizer", "sponsor", "admin"],
    },
  },
} as const
