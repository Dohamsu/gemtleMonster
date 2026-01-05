import { supabase } from './supabase'
import type { Equipment, PlayerEquipment } from '../types/equipment'

// ==========================================
// Master Data
// ==========================================

export async function getAllEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('id')

    if (error) throw error

    // Map snake_case keys to camelCase if needed, but TypeScript interface expects camelCase
    // Supabase returns keys as in DB (snake_case).
    // I should probably ensure the TypeScript interface matches generic DB or map it.
    // Let's assume we map it here.

    return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        slot: item.slot,
        rarity: item.rarity,
        iconUrl: item.icon_url,
        stats: item.stats,
        isSpecial: item.is_special
    }))
}

// ==========================================
// Player Data
// ==========================================

export async function getPlayerEquipment(userId: string): Promise<PlayerEquipment[]> {
    const { data, error } = await supabase
        .from('player_equipment')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        equipmentId: item.equipment_id,
        isEquipped: item.is_equipped,
        equippedMonsterId: item.equipped_monster_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
    }))
}

// ==========================================
// Actions
// ==========================================

export async function equipItem(playerEquipmentId: string, playerMonsterId: string): Promise<{ success: boolean; unequippedId?: string; message?: string }> {
    const { data, error } = await supabase
        .rpc('equip_item', {
            p_player_equipment_id: playerEquipmentId,
            p_player_monster_id: playerMonsterId
        })

    if (error) {
        console.error('Equip Error:', error)
        throw error
    }

    return data
}

export async function unequipItem(playerEquipmentId: string): Promise<{ success: boolean; message?: string }> {
    const { data, error } = await supabase
        .rpc('unequip_item', {
            p_player_equipment_id: playerEquipmentId
        })

    if (error) {
        console.error('Unequip Error:', error)
        throw error
    }

    return data
}

export async function addTestEquipment(userId: string): Promise<void> {
    const { data: equipmentList } = await supabase
        .from('equipment')
        .select('id')

    if (!equipmentList) return

    // Add one of each item
    const payloads = equipmentList.map(item => ({
        user_id: userId,
        equipment_id: item.id,
        is_equipped: false
    }))

    const { error } = await supabase
        .from('player_equipment')
        .insert(payloads)

    if (error) throw error
}
