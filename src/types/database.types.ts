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
          recipe_id: string | null
          result_item_id: string | null
          result_monster_id: string | null
          success: boolean
          success_rate_used: number | null
          user_id: string
        }
        Insert: {
          crafted_at?: string | null
          id?: number
          materials_used?: Json | null
          recipe_id?: string | null
          result_item_id?: string | null
          result_monster_id?: string | null
          success: boolean
          success_rate_used?: number | null
          user_id: string
        }
        Update: {
          crafted_at?: string | null
          id?: number
          materials_used?: Json | null
          recipe_id?: string | null
          result_item_id?: string | null
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
          name: string | null
          stats: Json
          upgrade_cost: Json
        }
        Insert: {
          created_at?: string | null
          facility_id: string
          id?: number
          level: number
          name?: string | null
          stats: Json
          upgrade_cost: Json
        }
        Update: {
          created_at?: string | null
          facility_id?: string
          id?: number
          level?: number
          name?: string | null
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
          drops: Json | null
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
          drops?: Json | null
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
          drops?: Json | null
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
      monster_skill: {
        Row: {
          cooldown: number | null
          created_at: string | null
          description: string | null
          effect_duration: number | null
          effect_target: string
          effect_type: string
          effect_value: number
          emoji: string | null
          id: string
          monster_id: string | null
          name: string
          role: string | null
          skill_type: string
          unlock_level: number
          updated_at: string | null
        }
        Insert: {
          cooldown?: number | null
          created_at?: string | null
          description?: string | null
          effect_duration?: number | null
          effect_target: string
          effect_type: string
          effect_value?: number
          emoji?: string | null
          id: string
          monster_id?: string | null
          name: string
          role?: string | null
          skill_type: string
          unlock_level?: number
          updated_at?: string | null
        }
        Update: {
          cooldown?: number | null
          created_at?: string | null
          description?: string | null
          effect_duration?: number | null
          effect_target?: string
          effect_type?: string
          effect_value?: number
          emoji?: string | null
          id?: string
          monster_id?: string | null
          name?: string
          role?: string | null
          skill_type?: string
          unlock_level?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monster_skill_monster_id_fkey"
            columns: ["monster_id"]
            isOneToOne: false
            referencedRelation: "monster"
            referencedColumns: ["id"]
          },
        ]
      }
      player_alchemy: {
        Row: {
          created_at: string | null
          experience: number
          global_success_bonus: number | null
          global_time_reduction: number | null
          last_collected_at: string | null
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
          last_collected_at?: string | null
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
          last_collected_at?: string | null
          level?: number
          updated_at?: string | null
          user_id?: string
          workshop_level?: number | null
        }
        Relationships: []
      }
      player_facility: {
        Row: {
          assigned_monster_id: string | null
          assigned_monster_ids: string[] | null
          created_at: string | null
          current_level: number
          facility_id: string
          id: number
          last_collected_at: string | null
          production_mode: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_monster_id?: string | null
          assigned_monster_ids?: string[] | null
          created_at?: string | null
          current_level?: number
          facility_id: string
          id?: number
          last_collected_at?: string | null
          production_mode?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_monster_id?: string | null
          assigned_monster_ids?: string[] | null
          created_at?: string | null
          current_level?: number
          facility_id?: string
          id?: number
          last_collected_at?: string | null
          production_mode?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_facility_assigned_monster_id_fkey"
            columns: ["assigned_monster_id"]
            isOneToOne: false
            referencedRelation: "player_monster"
            referencedColumns: ["id"]
          },
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
          awakening_level: number
          created_at: string
          exp: number
          id: string
          is_locked: boolean | null
          level: number
          monster_id: string
          unlocked_skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          awakening_level?: number
          created_at?: string
          exp?: number
          id?: string
          is_locked?: boolean | null
          level?: number
          monster_id: string
          unlocked_skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          awakening_level?: number
          created_at?: string
          exp?: number
          id?: string
          is_locked?: boolean | null
          level?: number
          monster_id?: string
          unlocked_skills?: string[] | null
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
          discovered_ingredients: Json | null
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
          discovered_ingredients?: Json | null
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
          discovered_ingredients?: Json | null
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
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nickname: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nickname: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nickname?: string
          updated_at?: string | null
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
          result_item_id: string | null
          result_monster_id: string | null
          type: string | null
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
          result_item_id?: string | null
          result_monster_id?: string | null
          type?: string | null
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
          result_item_id?: string | null
          result_monster_id?: string | null
          type?: string | null
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
      add_materials_batch: {
        Args: { p_materials: Json; p_user_id: string }
        Returns: undefined
      }
      batch_add_materials: {
        Args: { p_materials: Json; p_user_id: string }
        Returns: undefined
      }
      consume_materials: {
        Args: { p_materials: Json; p_user_id: string }
        Returns: boolean
      }
      decompose_monsters:
      | {
        Args: { monster_ids: string[] }
        Returns: {
          deleted_count: number
          rewards: Json
        }[]
      }
      | {
        Args: { p_monster_uids: string[]; p_user_id: string }
        Returns: Json
      }
      discover_recipe_ingredient: {
        Args: { p_material_id: string; p_recipe_id: string; p_user_id: string }
        Returns: Json
      }
      generate_random_nickname: { Args: never; Returns: string }
      perform_alchemy:
      | {
        Args: {
          p_ingredients: Json
          p_recipe_id: string
          p_success_rate: number
          p_user_id: string
        }
        Returns: Json
      }
      | {
        Args: {
          p_ingredients: Json
          p_quantity?: number
          p_recipe_id: string
          p_success_rate: number
          p_user_id: string
        }
        Returns: Json
      }
      update_recipe_craft_count: {
        Args: { p_recipe_id: string; p_success: boolean; p_user_id: string }
        Returns: undefined
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
