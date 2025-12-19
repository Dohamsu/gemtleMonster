import { describe, it, expect } from 'vitest'
import { processStatusEffects } from './battleUtils'
import type { BattleEntity, StatusEffect } from './battleUtils'

describe('battleUtils', () => {
    describe('processStatusEffects', () => {
        const baseEntity: BattleEntity = {
            id: 'test',
            name: 'Test Entity',
            hp: 100,
            maxHp: 100,
            atk: 10,
            def: 10,
            element: 'FIRE',
            isPlayer: true,
            statusEffects: []
        }

        it('should handle BURN effect correctly', () => {
            const entity = {
                ...baseEntity,
                statusEffects: [
                    {
                        id: 'burn1',
                        type: 'BURN',
                        value: 0,
                        duration: 3,
                        sourceId: 'enemy',
                        name: 'Burn',
                        emoji: '🔥'
                    } as StatusEffect
                ]
            }

            const result = processStatusEffects(entity)

            // 5% of 100 = 5 damage
            expect(result.damageTaken).toBe(5)
            expect(result.healingReceived).toBe(0)
            expect(result.updatedEntity.hp).toBe(95)
            expect(result.updatedEntity.statusEffects[0].duration).toBe(2)
        })

        it('should handle REGEN effect correctly', () => {
            const entity = {
                ...baseEntity,
                hp: 50, // Reduced HP so healing is visible
                statusEffects: [
                    {
                        id: 'regen1',
                        type: 'REGEN',
                        value: 0,
                        duration: 3,
                        sourceId: 'player',
                        name: 'Regen',
                        emoji: '💖'
                    } as StatusEffect
                ]
            }

            const result = processStatusEffects(entity)

            // 5% of 100 = 5 healing
            expect(result.damageTaken).toBe(0)
            expect(result.healingReceived).toBe(5)
            expect(result.updatedEntity.hp).toBe(55)
            expect(result.updatedEntity.statusEffects[0].duration).toBe(2)
        })

        it('should handle both damage and healing in same turn', () => {
            const entity = {
                ...baseEntity,
                hp: 50,
                statusEffects: [
                    {
                        id: 'burn1',
                        type: 'BURN',
                        value: 0,
                        duration: 3,
                        sourceId: 'enemy',
                        name: 'Burn',
                        emoji: '🔥'
                    } as StatusEffect,
                    {
                        id: 'regen1',
                        type: 'REGEN',
                        value: 0,
                        duration: 3,
                        sourceId: 'player',
                        name: 'Regen',
                        emoji: '💖'
                    } as StatusEffect
                ]
            }

            const result = processStatusEffects(entity)

            expect(result.damageTaken).toBe(5)
            expect(result.healingReceived).toBe(5)
            // 50 - 5 + 5 = 50
            expect(result.updatedEntity.hp).toBe(50)
        })

        it('should not heal above max HP', () => {
            const entity = {
                ...baseEntity,
                hp: 98,
                statusEffects: [
                    {
                        id: 'regen1',
                        type: 'REGEN',
                        value: 0,
                        duration: 3,
                        sourceId: 'player',
                        name: 'Regen',
                        emoji: '💖'
                    } as StatusEffect
                ]
            }

            const result = processStatusEffects(entity)

            expect(result.damageTaken).toBe(0)
            expect(result.healingReceived).toBe(5)
            expect(result.updatedEntity.hp).toBe(100) // Capped at 100
        })

        it('should not damage below 0 HP', () => {
            const entity = {
                ...baseEntity,
                hp: 2,
                statusEffects: [
                    {
                        id: 'burn1',
                        type: 'BURN',
                        value: 0,
                        duration: 3,
                        sourceId: 'enemy',
                        name: 'Burn',
                        emoji: '🔥'
                    } as StatusEffect
                ]
            }

            const result = processStatusEffects(entity)

            expect(result.damageTaken).toBe(5)
            expect(result.healingReceived).toBe(0)
            expect(result.updatedEntity.hp).toBe(0) // Floored at 0
        })
    })
})
