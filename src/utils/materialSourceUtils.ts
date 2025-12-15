/**
 * 재료 획득처 유틸리티
 * 시설 및 던전 데이터에서 재료별 획득처를 동적으로 추출
 */

import idleConst from '../data/idleConst.json'
import { DUNGEONS } from '../data/dungeonData'

// 시설 레벨 타입 정의
interface FacilityLevel {
    level: number
    name?: string
    stats: {
        dropRates?: Record<string, number>
    }
}

// 시설 타입 정의
interface Facility {
    id: string
    name: string
    levels: FacilityLevel[]
}

// 획득처 정보 인터페이스
export interface MaterialSource {
    type: 'facility' | 'dungeon'
    name: string        // 시설명 또는 던전명
    detail?: string     // 레벨명 또는 몬스터명
    dropRate?: number   // 드랍 확률 (0-100 또는 0-1 비율)
}

/**
 * 시설 데이터에서 특정 재료를 드랍하는 시설 목록 추출
 */
function getFacilitySources(materialId: string): MaterialSource[] {
    const sources: MaterialSource[] = []
    const facilities = (idleConst as { facilities: Facility[] }).facilities

    for (const facility of facilities) {
        for (const level of facility.levels) {
            const dropRates = level.stats?.dropRates
            if (dropRates && materialId in dropRates) {
                const rate = dropRates[materialId]
                // 중복 방지: 같은 시설의 다른 레벨은 하나로 합침
                const existingSource = sources.find(
                    s => s.type === 'facility' && s.name === facility.name
                )
                if (!existingSource) {
                    sources.push({
                        type: 'facility',
                        name: facility.name,
                        detail: level.name || `Lv.${level.level}`,
                        dropRate: Math.round(rate * 100) // 0-1 비율을 퍼센트로 변환
                    })
                }
            }
        }
    }

    return sources
}

/**
 * 던전 데이터에서 특정 재료를 드랍하는 몬스터 목록 추출
 */
function getDungeonSources(materialId: string): MaterialSource[] {
    const sources: MaterialSource[] = []

    for (const dungeon of DUNGEONS) {
        for (const enemy of dungeon.enemies) {
            const drop = enemy.drops.find(d => d.materialId === materialId)
            if (drop) {
                sources.push({
                    type: 'dungeon',
                    name: dungeon.name,
                    detail: enemy.name,
                    dropRate: drop.chance
                })
            }
        }
    }

    return sources
}

/**
 * 재료 ID로 모든 획득처 정보를 조회
 * @param materialId 재료 ID (예: 'herb_common', 'slime_fluid')
 * @returns 획득처 목록
 */
export function getMaterialSources(materialId: string): MaterialSource[] {
    const facilitySources = getFacilitySources(materialId)
    const dungeonSources = getDungeonSources(materialId)

    return [...facilitySources, ...dungeonSources]
}

/**
 * 획득처 정보를 사람이 읽기 쉬운 문자열로 변환
 */
export function formatMaterialSource(source: MaterialSource): string {
    const icon = source.type === 'facility' ? '🏭' : '⚔️'
    const rateStr = source.dropRate !== undefined ? ` (${source.dropRate}%)` : ''

    if (source.detail) {
        return `${icon} ${source.name} - ${source.detail}${rateStr}`
    }
    return `${icon} ${source.name}${rateStr}`
}
