import type { Equipment } from '../types/equipment'

export const EQUIPMENT_DATA: Record<string, Equipment> = {
    // Weapons
    // 'sword_rusty': { ... } // Asset missing
    'sword_iron': {
        id: 'sword_iron',
        name: '철검',
        description: '8비트 감성이 느껴지는 철검. 날카로운 픽셀이 인상적입니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_iron_sword.png',
        stats: {
            attack: 18,
            criticalRate: 3
        }
    },
    // 'sword_mithril': { ... } // Asset missing
    'bow_wood': {
        id: 'bow_wood',
        name: '나무 활',
        description: '나무 픽셀로 만들어진 활. 가볍고 튼튼합니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_wood_bow.png',
        stats: {
            attack: 15,
            criticalRate: 5
        }
    },
    'staff_magic': {
        id: 'staff_magic',
        name: '마법 지팡이',
        description: '푸른 픽셀 보석이 박힌 지팡이. 마력이 느껴집니다.',
        slot: 'WEAPON',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_magic_staff.png',
        stats: {
            attack: 35,
            hp: 50
        }
    },

    // Armor
    'armor_leather': {
        id: 'armor_leather',
        name: '가죽 갑옷',
        description: '질긴 갈색 픽셀로 만든 갑옷. 활동성이 좋습니다.',
        slot: 'ARMOR',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_leather_armor.png',
        stats: {
            defense: 10,
            hp: 30
        }
    },
    // 'armor_chain': { ... } // Asset missing
    'armor_plate': {
        id: 'armor_plate',
        name: '판금 갑옷',
        description: '단단한 회색 픽셀로 이루어진 갑옷. 묵직한 방어력을 자랑합니다.',
        slot: 'ARMOR',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_iron_plate.png',
        stats: {
            defense: 45,
            hp: 100
        }
    },
    'robe_magic': {
        id: 'robe_magic',
        name: '마법 로브',
        description: '신비로운 보라색 픽셀로 짜여진 로브. 마법 저항력이 높을 것 같습니다.',
        slot: 'ARMOR',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_magic_robe.png',
        stats: {
            defense: 20,
            hp: 80,
            attack: 10
        }
    },

    // Accessories
    // 'ring_old': { ... } // Asset missing
    // 'ring_ruby': { ... } // Asset missing
    // 'amulet_power': { ... } // Asset missing
    'ring_silver': {
        id: 'ring_silver',
        name: '은반지',
        description: '투박하지만 빛나는 은색 픽셀 반지.',
        slot: 'ACCESSORY',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_silver_ring.png',
        stats: {
            hp: 40,
            defense: 5
        }
    },
    'necklace_gold': {
        id: 'necklace_gold',
        name: '금 목걸이',
        description: '화려한 노란색 픽셀로 장식된 목걸이. 부의 상징입니다.',
        slot: 'ACCESSORY',
        rarity: 'SR',
        iconUrl: '/assets/equipment/pixel_gold_necklace.png',
        stats: {
            attack: 15,
            defense: 10,
            hp: 50
        }
    }
}
