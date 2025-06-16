export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_level: {
        Row: {
          access_level: string | null
          created_at: string | null
          description: string | null
          id: number
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
        }
        Relationships: []
      }
      article_image_usage: {
        Row: {
          article_id: number
          created_at: string
          id: number
          image_id: number
        }
        Insert: {
          article_id: number
          created_at?: string
          id?: number
          image_id: number
        }
        Update: {
          article_id?: number
          created_at?: string
          id?: number
          image_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_image_usage_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_image_usage_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "article_images"
            referencedColumns: ["id"]
          },
        ]
      }
      article_images: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          hash: string
          height: number | null
          id: number
          mime_type: string
          original_name: string
          public_url: string
          reference_count: number
          updated_at: string
          width: number | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          hash: string
          height?: number | null
          id?: number
          mime_type: string
          original_name: string
          public_url: string
          reference_count?: number
          updated_at?: string
          width?: number | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          hash?: string
          height?: number | null
          id?: number
          mime_type?: string
          original_name?: string
          public_url?: string
          reference_count?: number
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      article_tags: {
        Row: {
          article_id: number
          tag_id: number
        }
        Insert: {
          article_id: number
          tag_id: number
        }
        Update: {
          article_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          alternativeHeadline: string | null
          articleBody: Json | null
          articleSection: string | null
          author: string | null
          created_at: string | null
          description: string | null
          draft: boolean | null
          editor: string | null
          headline: string | null
          id: number
          image: string | null
          index: number | null
          keywords: string | null
          modified_at: string | null
          published_at: string | null
          slug: string | null
          wordCount: number | null
        }
        Insert: {
          alternativeHeadline?: string | null
          articleBody?: Json | null
          articleSection?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          draft?: boolean | null
          editor?: string | null
          headline?: string | null
          id?: number
          image?: string | null
          index?: number | null
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          slug?: string | null
          wordCount?: number | null
        }
        Update: {
          alternativeHeadline?: string | null
          articleBody?: Json | null
          articleSection?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          draft?: boolean | null
          editor?: string | null
          headline?: string | null
          id?: number
          image?: string | null
          index?: number | null
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          slug?: string | null
          wordCount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_editor_fkey"
            columns: ["editor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          alternativeHeadline: string | null
          articleBody: Json | null
          articleSection: string | null
          author: string | null
          created_at: string | null
          description: string | null
          draft: boolean | null
          editor: string | null
          headline: string | null
          id: number
          image: string | null
          index: number | null
          keywords: string | null
          modified_at: string | null
          published_at: string | null
          slug: string | null
          wordCount: number | null
        }
        Insert: {
          alternativeHeadline?: string | null
          articleBody?: Json | null
          articleSection?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          draft?: boolean | null
          editor?: string | null
          headline?: string | null
          id?: number
          image?: string | null
          index?: number | null
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          slug?: string | null
          wordCount?: number | null
        }
        Update: {
          alternativeHeadline?: string | null
          articleBody?: Json | null
          articleSection?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          draft?: boolean | null
          editor?: string | null
          headline?: string | null
          id?: number
          image?: string | null
          index?: number | null
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          slug?: string | null
          wordCount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_editor_fkey"
            columns: ["editor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_relations: {
        Row: {
          created_at: string | null
          id: number
          relationship_type: string | null
          source_id: number
          source_type: string
          target_id: number
          target_type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          relationship_type?: string | null
          source_id: number
          source_type: string
          target_id: number
          target_type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          relationship_type?: string | null
          source_id?: number
          source_type?: string
          target_id?: number
          target_type?: string
        }
        Relationships: []
      }
      operation_log: {
        Row: {
          completed_at: string | null
          created_at: string | null
          entity_id: number | null
          entity_type: string
          error_message: string | null
          id: string
          operation_data: Json | null
          operation_type: string
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          entity_id?: number | null
          entity_type: string
          error_message?: string | null
          id?: string
          operation_data?: Json | null
          operation_type: string
          status: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          entity_id?: number | null
          entity_type?: string
          error_message?: string | null
          id?: string
          operation_data?: Json | null
          operation_type?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          bio: string
          created_at: string
          first_name: string | null
          full_name: string
          id: string
          images: string[] | null
          last_name: string | null
          metrics: string
          occupation: string | null
          privacy: string
          settings: string
          social_media: string[] | null
          spacial_location: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          bio: string
          created_at?: string
          first_name?: string | null
          full_name: string
          id: string
          images?: string[] | null
          last_name?: string | null
          metrics?: string
          occupation?: string | null
          privacy?: string
          settings?: string
          social_media?: string[] | null
          spacial_location?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          bio?: string
          created_at?: string
          first_name?: string | null
          full_name?: string
          id?: string
          images?: string[] | null
          last_name?: string | null
          metrics?: string
          occupation?: string | null
          privacy?: string
          settings?: string
          social_media?: string[] | null
          spacial_location?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_images: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_avatar: {
        Args: { avatar_url: string }
        Returns: Record<string, unknown>
      }
      delete_storage_object: {
        Args: { bucket: string; object: string }
        Returns: Record<string, unknown>
      }
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
