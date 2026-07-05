export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      issues: {
        Row: {
          id: string;
          reporter_id: string | null;
          title: string;
          description: string;
          category: Database["public"]["Enums"]["issue_category"];
          urgency: Database["public"]["Enums"]["issue_urgency"];
          status: Database["public"]["Enums"]["issue_status"];
          latitude: number;
          longitude: number;
          address_label: string | null;
          image_path: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          search_tsv: string | null;
          upvote_count: number;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          title: string;
          description: string;
          category: Database["public"]["Enums"]["issue_category"];
          urgency?: Database["public"]["Enums"]["issue_urgency"];
          status?: Database["public"]["Enums"]["issue_status"];
          latitude: number;
          longitude: number;
          address_label?: string | null;
          image_path?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          title?: string;
          description?: string;
          category?: Database["public"]["Enums"]["issue_category"];
          urgency?: Database["public"]["Enums"]["issue_urgency"];
          status?: Database["public"]["Enums"]["issue_status"];
          latitude?: number;
          longitude?: number;
          address_label?: string | null;
          image_path?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "issues_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      issue_status_history: {
        Row: {
          id: string;
          issue_id: string;
          changed_by: string | null;
          from_status: Database["public"]["Enums"]["issue_status"] | null;
          to_status: Database["public"]["Enums"]["issue_status"];
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          changed_by?: string | null;
          from_status?: Database["public"]["Enums"]["issue_status"] | null;
          to_status: Database["public"]["Enums"]["issue_status"];
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          changed_by?: string | null;
          from_status?: Database["public"]["Enums"]["issue_status"] | null;
          to_status?: Database["public"]["Enums"]["issue_status"];
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "issue_status_history_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issue_status_history_changed_by_fkey";
            columns: ["changed_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      issue_comments: {
        Row: {
          id: string;
          issue_id: string;
          author_id: string | null;
          body: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          author_id?: string | null;
          body: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          author_id?: string | null;
          body?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "issue_comments_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issue_comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      issue_upvotes: {
        Row: {
          issue_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          issue_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          issue_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "issue_upvotes_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issue_upvotes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          issue_id: string | null;
          channel: string;
          event_type: string;
          status: string;
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id?: string | null;
          channel: string;
          event_type: string;
          status?: string;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string | null;
          channel?: string;
          event_type?: string;
          status?: string;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_issue_id_fkey";
            columns: ["issue_id"];
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      nearby_public_issues: {
        Args: {
          origin_lat: number;
          origin_lng: number;
          search_text?: string | null;
          filter_status?: Database["public"]["Enums"]["issue_status"] | null;
          filter_category?:
            | Database["public"]["Enums"]["issue_category"]
            | null;
          filter_urgency?: Database["public"]["Enums"]["issue_urgency"] | null;
          max_results?: number;
        };
        Returns: Array<
          Omit<Database["public"]["Tables"]["issues"]["Row"], "search_tsv"> & {
            distance_meters: number;
          }
        >;
      };
    };
    Enums: {
      user_role: "user" | "admin";
      issue_status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "rejected"
        | "duplicate";
      issue_category:
        | "pothole"
        | "streetlight"
        | "sidewalk"
        | "trash"
        | "water_leak"
        | "fallen_tree"
        | "accessibility"
        | "other";
      issue_urgency: "low" | "medium" | "high" | "critical";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
