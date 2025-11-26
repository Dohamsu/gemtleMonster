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
      alchemy_history: {
        Row: {
          crafted_at: string | null
          id: number
          materials_used: Json | null
          recipe_id: string
          result_monster_id: string | null
          success: boolean
          success_rate_used: number | null
          user_id: string
        }
        Insert: {
          crafted_at?: string | null
          id?: number
          materials_used?: Json | null
          recipe_id: string
          result_monster_id?: string | null
          success: boolean
          success_rate_used?: number | null
          user_id: string
        }
        Update: {
          crafted_at?: string | null
          id?: number
          materials_used?: Json | null
          recipe_id?: string
          result_monster_id?: string | null
          success?: boolean
          success_rate_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alchemy_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alchemy_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_location_conditions"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "alchemy_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_time_conditions"
            referencedColumns: ["recipe_id"]
          },
        ]
      }
      facility: {
        Row: {
          category: string
          config_version: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          config_version: string
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          config_version?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_level: {
        Row: {
          created_at: string | null
          facility_id: string
          id: number
          level: number
          stats: Json
          upgrade_cost: Json
        }
        Insert: {
          created_at?: string | null
          facility_id: string
          id?: number
          level: number
          stats: Json
          upgrade_cost: Json
        }
        Update: {
          created_at?: string | null
          facility_id?: string
          id?: number
          level?: number
          stats?: Json
          upgrade_cost?: Json
        }
        Relationships: [
          {
            foreignKeyName: "facility_level_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_unlock_condition: {
        Row: {
          condition_type: string
          created_at: string | null
          facility_id: string
          id: number
          min_facility_level: number | null
          min_player_level: number | null
          quest_id: string | null
          required_facility_id: string | null
        }
        Insert: {
          condition_type: string
          created_at?: string | null
          facility_id: string
          id?: number
          min_facility_level?: number | null
          min_player_level?: number | null
          quest_id?: string | null
          required_facility_id?: string | null
        }
        Update: {
          condition_type?: string
          created_at?: string | null
          facility_id?: string
          id?: number
          min_facility_level?: number | null
          min_player_level?: number | null
          quest_id?: string | null
          required_facility_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_unlock_condition_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_unlock_condition_required_facility_id_fkey"
            columns: ["required_facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
        ]
      }
      material: {
        Row: {
          created_at: string | null
          description: string | null
          family: string
          icon_url: string | null
          id: string
          is_special: boolean | null
          name: string
          rarity: string
          sell_price: number
          source_info: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          family: string
          icon_url?: string | null
          id: string
          is_special?: boolean | null
          name: string
          rarity: string
          sell_price?: number
          source_info?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          family?: string
          icon_url?: string | null
          id?: string
          is_special?: boolean | null
          name?: string
          rarity?: string
          sell_price?: number
          source_info?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      monster: {
        Row: {
          base_atk: number
          base_def: number
          base_hp: number
          created_at: string | null
          description: string | null
          element: string
          factory_trait_effect: string | null
          factory_trait_target: string | null
          factory_trait_value: number | null
          icon_url: string | null
          id: string
          is_special: boolean | null
          name: string
          rarity: string
          role: string
          updated_at: string | null
        }
        Insert: {
          base_atk?: number
          base_def?: number
          base_hp?: number
          created_at?: string | null
          description?: string | null
          element: string
          factory_trait_effect?: string | null
          factory_trait_target?: string | null
          factory_trait_value?: number | null
          icon_url?: string | null
          id: string
          is_special?: boolean | null
          name: string
          rarity: string
          role: string
          updated_at?: string | null
        }
        Update: {
          base_atk?: number
          base_def?: number
          base_hp?: number
          created_at?: string | null
          description?: string | null
          element?: string
          factory_trait_effect?: string | null
          factory_trait_target?: string | null
          factory_trait_value?: number | null
          icon_url?: string | null
          id?: string
          is_special?: boolean | null
          name?: string
          rarity?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      player_alchemy: {
        Row: {
          created_at: string | null
          experience: number
          global_success_bonus: number | null
          global_time_reduction: number | null
          level: number
          updated_at: string | null
          user_id: string
          workshop_level: number | null
        }
        Insert: {
          created_at?: string | null
          experience?: number
          global_success_bonus?: number | null
          global_time_reduction?: number | null
          level?: number
          updated_at?: string | null
          user_id: string
          workshop_level?: number | null
        }
        Update: {
          created_at?: string | null
          experience?: number
          global_success_bonus?: number | null
          global_time_reduction?: number | null
          level?: number
          updated_at?: string | null
          user_id?: string
          workshop_level?: number | null
        }
        Relationships: []
      }
      player_facility: {
        Row: {
          created_at: string | null
          current_level: number
          facility_id: string
          id: number
          last_collected_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_level?: number
          facility_id: string
          id?: number
          last_collected_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_level?: number
          facility_id?: string
          id?: number
          last_collected_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_facility_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["id"]
          },
        ]
      }
      player_material: {
        Row: {
          created_at: string | null
          id: number
          material_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          material_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          material_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_material_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material"
            referencedColumns: ["id"]
          },
        ]
      }
      player_monster: {
        Row: {
          created_at: string
          exp: number
          id: string
          level: number
          monster_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exp?: number
          id?: string
          level?: number
          monster_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exp?: number
          id?: string
          level?: number
          monster_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_monster_monster_id_fkey"
            columns: ["monster_id"]
            isOneToOne: false
            referencedRelation: "monster"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profile: {
        Row: {
          created_at: string | null
          experience: number
          player_level: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience?: number
          player_level?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience?: number
          player_level?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      player_recipe: {
        Row: {
          craft_count: number | null
          created_at: string | null
          first_discovered_at: string | null
          id: number
          is_discovered: boolean | null
          recipe_id: string
          success_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          craft_count?: number | null
          created_at?: string | null
          first_discovered_at?: string | null
          id?: number
          is_discovered?: boolean | null
          recipe_id: string
          success_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          craft_count?: number | null
          created_at?: string | null
          first_discovered_at?: string | null
          id?: number
          is_discovered?: boolean | null
          recipe_id?: string
          success_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_recipe_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_recipe_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_location_conditions"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "player_recipe_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_time_conditions"
            referencedColumns: ["recipe_id"]
          },
        ]
      }
      player_resource: {
        Row: {
          amount: number
          created_at: string | null
          id: number
          resource_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: number
          resource_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: number
          resource_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recipe: {
        Row: {
          base_success_rate: number
          cost_gold: number
          craft_time_sec: number
          created_at: string | null
          description: string | null
          exp_gain: number | null
          id: string
          is_discovered: boolean | null
          is_hidden: boolean | null
          name: string
          priority: number | null
          required_alchemy_level: number | null
          result_count: number | null
          result_monster_id: string
          updated_at: string | null
        }
        Insert: {
          base_success_rate?: number
          cost_gold?: number
          craft_time_sec?: number
          created_at?: string | null
          description?: string | null
          exp_gain?: number | null
          id: string
          is_discovered?: boolean | null
          is_hidden?: boolean | null
          name: string
          priority?: number | null
          required_alchemy_level?: number | null
          result_count?: number | null
          result_monster_id: string
          updated_at?: string | null
        }
        Update: {
          base_success_rate?: number
          cost_gold?: number
          craft_time_sec?: number
          created_at?: string | null
          description?: string | null
          exp_gain?: number | null
          id?: string
          is_discovered?: boolean | null
          is_hidden?: boolean | null
          name?: string
          priority?: number | null
          required_alchemy_level?: number | null
          result_count?: number | null
          result_monster_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipe_condition: {
        Row: {
          condition_type: string
          created_at: string | null
          description: string | null
          id: number
          recipe_id: string
          value_bool: boolean | null
          value_float: number | null
          value_int: number | null
          value_json: Json | null
          value_text: string | null
        }
        Insert: {
          condition_type: string
          created_at?: string | null
          description?: string | null
          id?: number
          recipe_id: string
          value_bool?: boolean | null
          value_float?: number | null
          value_int?: number | null
          value_json?: Json | null
          value_text?: string | null
        }
        Update: {
          condition_type?: string
          created_at?: string | null
          description?: string | null
          id?: number
          recipe_id?: string
          value_bool?: boolean | null
          value_float?: number | null
          value_int?: number | null
          value_json?: Json | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_condition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_condition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_location_conditions"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "recipe_condition_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_time_conditions"
            referencedColumns: ["recipe_id"]
          },
        ]
      }
      recipe_ingredient: {
        Row: {
          created_at: string | null
          id: number
          is_catalyst: boolean | null
          material_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_catalyst?: boolean | null
          material_id: string
          quantity?: number
          recipe_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_catalyst?: boolean | null
          material_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredient_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "material"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredient_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_location_conditions"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "recipe_ingredient_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_time_conditions"
            referencedColumns: ["recipe_id"]
          },
        ]
      }
    }
    Views: {
      recipes_with_location_conditions: {
        Row: {
          condition_type: string | null
          description: string | null
          recipe_id: string | null
          recipe_name: string | null
          value_json: Json | null
          value_text: string | null
        }
        Relationships: []
      }
      recipes_with_time_conditions: {
        Row: {
          condition_type: string | null
          description: string | null
          recipe_id: string | null
          recipe_name: string | null
          value_json: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_materials: {
        Args: { p_material_id: string; p_quantity: number; p_user_id: string }
        Returns: undefined
      }
      consume_materials: {
        Args: { p_materials: Json; p_user_id: string }
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
