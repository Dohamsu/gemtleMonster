/* eslint-disable no-console */
/**
 * Material API
 * 재료 관련 데이터베이스 작업
 */

import { supabase } from './supabase'
import type { Material, PlayerMaterial } from '../types'

/**
 * 모든 재료 목록 가져오기
 */
export async function getAllMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('material')
    .select('*')
    .order('family, rarity')

  if (error) {
    console.error('재료 목록 로드 실패:', error)
    throw error
  }

  // Transform snake_case to camelCase
  return (data || []).map((item: any) => ({
    ...item,
    iconUrl: item.icon_url,
    isSpecial: item.is_special,
    sellPrice: item.sell_price
  }))
}

/**
 * 특정 계열의 재료 가져오기
 */
export async function getMaterialsByFamily(family: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('material')
    .select('*')
    .eq('family', family)
    .order('rarity')

  if (error) {
    console.error(`${family} 재료 로드 실패:`, error)
    throw error
  }

  // Transform snake_case to camelCase
  return (data || []).map((item: any) => ({
    ...item,
    iconUrl: item.icon_url,
    isSpecial: item.is_special,
    sellPrice: item.sell_price
  }))
}

/**
 * 플레이어의 재료 인벤토리 가져오기
 */
export async function getPlayerMaterials(userId: string): Promise<PlayerMaterial[]> {
  const { data, error } = await supabase
    .from('player_material')
    .select('material_id, quantity')
    .eq('user_id', userId)
    .gt('quantity', 0)

  if (error) {
    console.error('플레이어 재료 로드 실패:', error)
    throw error
  }

  // Transform snake_case to camelCase
  return (data || []).map((item: any) => ({
    materialId: item.material_id, // Map material_id -> materialId
    quantity: item.quantity
  }))
}

/**
 * 재료 수량 추가
 *
 * @param userId - 사용자 ID
 * @param materialId - 재료 ID
 * @param quantity - 추가할 수량
 */
export async function addMaterialToPlayer(
  userId: string,
  materialId: string,
  quantity: number
): Promise<void> {
  const { error } = await supabase.rpc('add_materials', {
    p_user_id: userId,
    p_material_id: materialId,
    p_quantity: quantity
  })

  if (error) {
    console.error('재료 추가 실패:', error)
    throw error
  }
}

/**
 * 재료 소비 (조합, 판매 등에 사용)
 *
 * @param userId - 사용자 ID
 * @param materials - 소비할 재료 목록 (materialId -> quantity)
 * @returns 성공 여부
 */
export async function consumeMaterials(
  userId: string,
  materials: Record<string, number>
): Promise<boolean> {
  const { error } = await supabase.rpc('consume_materials', {
    p_user_id: userId,
    p_materials: materials
  })

  if (error) {
    console.error('재료 소비 실패:', error)
    return false
  }

  return true
}

/**
 * 여러 재료를 한 번에 추가
 *
 * @param userId - 사용자 ID
 * @param materials - 추가할 재료 목록 (materialId -> quantity)
 */
export async function batchAddMaterials(
  userId: string,
  materials: Record<string, number>
): Promise<void> {
  const { error } = await supabase.rpc('batch_add_materials', {
    p_user_id: userId,
    p_materials: materials
  })

  if (error) {
    console.error('배치 재료 추가 실패:', error)
    throw error
  }
}

/**
 * 골드 추가
 *
 * @param userId - 사용자 ID
 * @param amount - 추가할 골드 양
 */
export async function addGold(userId: string, amount: number): Promise<void> {
  // 먼저 현재 골드 조회
  const { data: currentData, error: fetchError } = await supabase
    .from('player_resource')
    .select('amount')
    .eq('user_id', userId)
    .eq('resource_id', 'gold')
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('골드 조회 실패:', fetchError)
    throw fetchError
  }

  const currentGold = currentData?.amount || 0
  const newGold = currentGold + amount

  // 골드 업데이트 (upsert)
  const { error: updateError } = await supabase
    .from('player_resource')
    .upsert({
      user_id: userId,
      resource_id: 'gold',
      amount: newGold
    }, { onConflict: 'user_id,resource_id' })

  if (updateError) {
    console.error('골드 업데이트 실패:', updateError)
    throw updateError
  }

  console.log(`✅ 골드 업데이트 완료: ${currentGold} -> ${newGold} (+${amount})`)
}
