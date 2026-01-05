import type { Equipment } from '../types/equipment'

export const EQUIPMENT_DATA: Record<string, Equipment> = {
    // Weapons
    'sword_rusty': {
        id: 'sword_rusty',
        name: '녹슨 검',
        description: '오랫동안 방치되어 녹이 슨 검. 날이 무뎌 보이지만 없는 것보다는 낫습니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/sword_rusty.png',
        stats: {
            attack: 5
        }
    },
    'sword_iron': {
        id: 'sword_iron',
        name: '철검',
        description: '대장간에서 잘 벼려진 튼튼한 철검. 기본적인 호신용 무기입니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/sword_iron.png',
        stats: {
            attack: 15,
            criticalRate: 2
        }
    },
    'sword_mithril': {
        id: 'sword_mithril',
        name: '미스릴 검',
        description: '가볍고 단단한 미스릴로 제작된 검. 마력 전도율이 높아 몬스터에게 효과적입니다.',
        slot: 'WEAPON',
        rarity: 'R',
        iconUrl: '/assets/equipment/sword_mithril.png',
        stats: {
            attack: 40,
            criticalRate: 5
        }
    },

    // Armor
    'armor_leather': {
        id: 'armor_leather',
        name: '가죽 튜닉',
        description: '짐승의 가죽을 무두질해 만든 옷. 활동하기 편합니다.',
        slot: 'ARMOR',
        rarity: 'N',
        iconUrl: '/assets/equipment/armor_leather.png',
        stats: {
            defense: 5,
            hp: 20
        }
    },
    'armor_chain': {
        id: 'armor_chain',
        name: '사슬 갑옷',
        description: '쇠고리를 엮어 만든 갑옷. 베기 공격을 잘 막아줍니다.',
        slot: 'ARMOR',
        rarity: 'N',
        iconUrl: '/assets/equipment/armor_chain.png',
        stats: {
            defense: 15,
            hp: 50
        }
    },
    'armor_plate': {
        id: 'armor_plate',
        name: '판금 갑옷',
        description: '두꺼운 강철 판으로 전신을 감싸는 갑옷. 무겁지만 방어력은 확실합니다.',
        slot: 'ARMOR',
        rarity: 'R',
        iconUrl: '/assets/equipment/armor_plate.png',
        stats: {
            defense: 40,
            hp: 150
        }
    },

    // Accessories
    'ring_old': {
        id: 'ring_old',
        name: '낡은 반지',
        description: '누군가 잃어버린 듯한 낡은 반지. 미약한 마력이 느껴집니다.',
        slot: 'ACCESSORY',
        rarity: 'N',
        iconUrl: '/assets/equipment/ring_old.png',
        stats: {
            hp: 10
        }
    },
    'ring_ruby': {
        id: 'ring_ruby',
        name: '루비 반지',
        description: '붉은 보석이 박힌 반지. 착용하면 힘이 솟아납니다.',
        slot: 'ACCESSORY',
        rarity: 'R',
        iconUrl: '/assets/equipment/ring_ruby.png',
        stats: {
            attack: 10,
            hp: 30
        }
    },
    'amulet_power': {
        id: 'amulet_power',
        name: '힘의 부적',
        description: '고대 문자가 새겨진 부적. 잠재된 능력을 끌어올립니다.',
        slot: 'ACCESSORY',
        rarity: 'SR',
        iconUrl: '/assets/equipment/amulet_power.png',
        stats: {
            attack: 25,
            defense: 15,
            criticalRate: 3
        }
    },

    // Pixel Art Weapons
    'pixel_sword_iron': {
        id: 'pixel_sword_iron',
        name: '픽셀 철검',
        description: '8비트 감성이 느껴지는 철검. 날카로운 픽셀이 인상적입니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_iron_sword.png',
        stats: { attack: 18, criticalRate: 3 }
    },
    'pixel_bow_wood': {
        id: 'pixel_bow_wood',
        name: '픽셀 나무 활',
        description: '나무 픽셀로 만들어진 활. 가볍고 튼튼합니다.',
        slot: 'WEAPON',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_wood_bow.png',
        stats: { attack: 15, criticalRate: 5 }
    },
    'pixel_staff_magic': {
        id: 'pixel_staff_magic',
        name: '픽셀 마법 지팡이',
        description: '푸른 픽셀 보석이 박힌 지팡이. 마력이 느껴집니다.',
        slot: 'WEAPON',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_magic_staff.png',
        stats: { attack: 35, hp: 50 }
    },

    // Pixel Art Armor
    'pixel_armor_leather': {
        id: 'pixel_armor_leather',
        name: '픽셀 가죽 갑옷',
        description: '질긴 갈색 픽셀로 만든 갑옷. 활동성이 좋습니다.',
        slot: 'ARMOR',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_leather_armor.png',
        stats: { defense: 10, hp: 30 }
    },
    'pixel_armor_plate': {
        id: 'pixel_armor_plate',
        name: '픽셀 판금 갑옷',
        description: '단단한 회색 픽셀로 이루어진 갑옷. 묵직한 방어력을 자랑합니다.',
        slot: 'ARMOR',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_iron_plate.png',
        stats: { defense: 45, hp: 100 }
    },
    'pixel_robe_magic': {
        id: 'pixel_robe_magic',
        name: '픽셀 마법 로브',
        description: '신비로운 보라색 픽셀로 짜여진 로브. 마법 저항력이 높을 것 같습니다.',
        slot: 'ARMOR',
        rarity: 'R',
        iconUrl: '/assets/equipment/pixel_magic_robe.png',
        stats: { defense: 20, hp: 80, attack: 10 }
    },

    // Pixel Art Accessories
    'pixel_ring_silver': {
        id: 'pixel_ring_silver',
        name: '픽셀 은반지',
        description: '투박하지만 빛나는 은색 픽셀 반지.',
        slot: 'ACCESSORY',
        rarity: 'N',
        iconUrl: '/assets/equipment/pixel_silver_ring.png',
        stats: { hp: 40, defense: 5 }
    },
    'pixel_necklace_gold': {
        id: 'pixel_necklace_gold',
        name: '픽셀 금 목걸이',
        description: '화려한 노란색 픽셀로 장식된 목걸이. 부의 상징입니다.',
        slot: 'ACCESSORY',
        rarity: 'SR',
        iconUrl: '/assets/equipment/pixel_gold_necklace.png',
        stats: { attack: 15, defense: 10, hp: 50 }
    }
}
