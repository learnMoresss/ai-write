// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          description: string
          world_setting: Json | null
          entities: Json | null
          relationships: Json | null
          plot_events: Json | null
          timeline: Json | null
          triggers: Json | null
          status: Database['public']['Enums']['story_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          world_setting?: Json | null
          entities?: Json | null
          relationships?: Json | null
          plot_events?: Json | null
          timeline?: Json | null
          triggers?: Json | null
          status?: Database['public']['Enums']['story_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          world_setting?: Json | null
          entities?: Json | null
          relationships?: Json | null
          plot_events?: Json | null
          timeline?: Json | null
          triggers?: Json | null
          status?: Database['public']['Enums']['story_status']
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      story_entities: {
        Row: {
          id: string
          story_id: string
          type: string
          label: string
          properties: Json
          position: Json
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          story_id: string
          type: string
          label: string
          properties?: Json
          position?: Json
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          type?: string
          label?: string
          properties?: Json
          position?: Json
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_entities_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          }
        ]
      }
      story_relationships: {
        Row: {
          id: string
          story_id: string
          source: string
          target: string
          relation: string
          weight: number
          properties: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          story_id: string
          source: string
          target: string
          relation: string
          weight?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          source?: string
          target?: string
          relation?: string
          weight?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_relationships_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      story_status: "draft" | "in-progress" | "completed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}