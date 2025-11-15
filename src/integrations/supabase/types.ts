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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_availability: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          last_assigned_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          last_assigned_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          last_assigned_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          assignment_method: string | null
          auto_assign_complaints: boolean | null
          created_at: string | null
          daily_digest: boolean | null
          default_complaint_status: string | null
          email_notifications: boolean | null
          escalation_auto_priority: boolean | null
          escalation_enabled: boolean | null
          escalation_max_level: number | null
          escalation_sla_breach_auto: boolean | null
          escalation_unresolved_hours: number | null
          id: string
          max_complaints_per_day: number | null
          new_complaint_notification: boolean | null
          notification_email: string | null
          notification_sound: boolean | null
          realtime_new_complaint: boolean | null
          realtime_notifications: boolean | null
          realtime_status_change: boolean | null
          require_approval: boolean | null
          sla_critical_resolution_hours: number | null
          sla_critical_response_hours: number | null
          sla_enabled: boolean | null
          sla_resolution_time_hours: number | null
          sla_response_time_hours: number | null
          status_change_notification: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_method?: string | null
          auto_assign_complaints?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          default_complaint_status?: string | null
          email_notifications?: boolean | null
          escalation_auto_priority?: boolean | null
          escalation_enabled?: boolean | null
          escalation_max_level?: number | null
          escalation_sla_breach_auto?: boolean | null
          escalation_unresolved_hours?: number | null
          id?: string
          max_complaints_per_day?: number | null
          new_complaint_notification?: boolean | null
          notification_email?: string | null
          notification_sound?: boolean | null
          realtime_new_complaint?: boolean | null
          realtime_notifications?: boolean | null
          realtime_status_change?: boolean | null
          require_approval?: boolean | null
          sla_critical_resolution_hours?: number | null
          sla_critical_response_hours?: number | null
          sla_enabled?: boolean | null
          sla_resolution_time_hours?: number | null
          sla_response_time_hours?: number | null
          status_change_notification?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_method?: string | null
          auto_assign_complaints?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          default_complaint_status?: string | null
          email_notifications?: boolean | null
          escalation_auto_priority?: boolean | null
          escalation_enabled?: boolean | null
          escalation_max_level?: number | null
          escalation_sla_breach_auto?: boolean | null
          escalation_unresolved_hours?: number | null
          id?: string
          max_complaints_per_day?: number | null
          new_complaint_notification?: boolean | null
          notification_email?: string | null
          notification_sound?: boolean | null
          realtime_new_complaint?: boolean | null
          realtime_notifications?: boolean | null
          realtime_status_change?: boolean | null
          require_approval?: boolean | null
          sla_critical_resolution_hours?: number | null
          sla_critical_response_hours?: number | null
          sla_enabled?: boolean | null
          sla_resolution_time_hours?: number | null
          sla_response_time_hours?: number | null
          status_change_notification?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      complaint_comments: {
        Row: {
          comment: string
          complaint_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          complaint_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          complaint_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_comments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_history: {
        Row: {
          changed_by: string | null
          complaint_id: string
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          changed_by?: string | null
          complaint_id: string
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          changed_by?: string | null
          complaint_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_ratings: {
        Row: {
          complaint_id: string
          created_at: string
          feedback: string | null
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_ratings_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          created_at: string | null
          description: string
          domain_id: string | null
          escalated_at: string | null
          escalation_level: number | null
          escalation_reason: string | null
          file_type: string | null
          file_url: string | null
          first_response_at: string | null
          id: string
          location_id: string
          mobile: string
          priority: Database["public"]["Enums"]["complaint_priority"]
          resolved_at: string | null
          sla_resolution_breached: boolean | null
          sla_response_breached: boolean | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          student_name: string
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          domain_id?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          escalation_reason?: string | null
          file_type?: string | null
          file_url?: string | null
          first_response_at?: string | null
          id?: string
          location_id: string
          mobile: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          sla_resolution_breached?: boolean | null
          sla_response_breached?: boolean | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          student_name: string
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          domain_id?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          escalation_reason?: string | null
          file_type?: string | null
          file_url?: string | null
          first_response_at?: string | null
          id?: string
          location_id?: string
          mobile?: string
          priority?: Database["public"]["Enums"]["complaint_priority"]
          resolved_at?: string | null
          sla_resolution_breached?: boolean | null
          sla_response_breached?: boolean | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          student_name?: string
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          mobile: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_senior: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_senior?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_senior?: boolean | null
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
      auto_assign_complaint: { Args: { complaint_id: string }; Returns: string }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      escalate_complaint: {
        Args: { p_complaint_id: string; p_reason: string }
        Returns: undefined
      }
      generate_ticket_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_system_activity_log: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      insert_system_notification: {
        Args: {
          p_entity_id?: string
          p_entity_type?: string
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "student"
      complaint_priority: "low" | "medium" | "high" | "critical"
      complaint_status: "pending" | "in_progress" | "resolved"
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
      app_role: ["admin", "student"],
      complaint_priority: ["low", "medium", "high", "critical"],
      complaint_status: ["pending", "in_progress", "resolved"],
    },
  },
} as const
