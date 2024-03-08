import { JSONContent } from "@tiptap/react"

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
      articles: {
        Row: {
          alternativeHeadline: string | null
          articleBody: JSONContent | null
          articleSection: string | null
          author: Database["public"]["Tables"]["profiles"]["Row"] | null
          created_at: string | null
          description: string | null
          draft: boolean | null
          editor: string | null
          headline: string | null
          id: number
          image: string | null
          keywords: string | null
          modified_at: string | null
          published_at: string | null
          wordCount: number | null
          slug: string | null
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
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          wordCount?: number | null
          slug?: string | null
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
          keywords?: string | null
          modified_at?: string | null
          published_at?: string | null
          wordCount?: number | null
          slug?: string | null
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
          }
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
          images: string[]
          last_name: string | null
          metrics: string
          occupation: string | null
          privacy: string
          settings: string
          social_media: string[]
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
          images?: string[]
          last_name?: string | null
          metrics?: string
          occupation?: string | null
          privacy?: string
          settings?: string
          social_media?: string[]
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
          images?: string[]
          last_name?: string | null
          metrics?: string
          occupation?: string | null
          privacy?: string
          settings?: string
          social_media?: string[]
          spacial_location?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
