import { supabase } from './supabase'
import type { Equipment, PlayerEquipment, EquipmentSlot, EquipmentRarity } from '../types/equipment'

// ==========================================
// Master Data
// ==========================================

interface DBEquipment {
    id: string
    name: string
    description: string
    slot: string
    rarity: string
    icon_url: string
    stats: Record<string, number>
    is_special: boolean
}

export async function getAllEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('id')

    if (error) throw error

    return (data as DBEquipment[]).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        slot: item.slot as EquipmentSlot,
        rarity: item.rarity as EquipmentRarity,
        iconUrl: item.icon_url,
        stats: item.stats,
        isSpecial: item.is_special
    }))
}

// ==========================================
// Player Data
// ==========================================

interface DBPlayerEquipment {
    id: string
    user_id: string
    equipment_id: string
    is_equipped: boolean
    equipped_monster_id: string | null
    created_at: string
    updated_at: string
}

export async function getPlayerEquipment(userId: string): Promise<PlayerEquipment[]> {
    const { data, error } = await supabase
        .from('player_equipment')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data as DBPlayerEquipment[]).map((item) => ({
        id: item.id,
        userId: item.user_id,
        equipmentId: item.equipment_id,
        isEquipped: item.is_equipped,
        equippedMonsterId: item.equipped_monster_id || undefined,
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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

export async function addPlayerEquipment(userId: string, equipmentId: string): Promise<void> {
    const { error } = await supabase
        .from('player_equipment')
        .insert({
            user_id: userId,
            equipment_id: equipmentId,
            is_equipped: false
        })

    if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to add player equipment:', error)
        throw error
    }
}
