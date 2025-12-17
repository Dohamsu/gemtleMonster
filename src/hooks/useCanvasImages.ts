/* eslint-disable no-console */
import { useEffect, useState } from 'react'
import { MATERIALS } from '../data/alchemyData'

export interface CanvasImages {
    background: HTMLImageElement | null
    herb_farm: HTMLImageElement | null
    mine: HTMLImageElement | null
    alchemy_workshop: HTMLImageElement | null
    shop_building: HTMLImageElement | null
    shop_interior: HTMLImageElement | null
    cauldron_pixel: HTMLImageElement | null
    dungeon_forest: HTMLImageElement | null
    spirit_sanctum: HTMLImageElement | null
    blacksmith: Record<number, HTMLImageElement>
    materials: Record<string, HTMLImageElement>
}

/**
 * Custom hook to load and cache canvas images
 * Images are loaded once and cached for the lifetime of the component
 */
export function useCanvasImages() {
    const [images, setImages] = useState<CanvasImages>({
        background: null,
        herb_farm: null,
        mine: null,
        alchemy_workshop: null,
        shop_building: null,
        shop_interior: null,
        cauldron_pixel: null,
        dungeon_forest: null,
        spirit_sanctum: null,
        blacksmith: {},
        materials: {}
    })

    useEffect(() => {
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.src = src
                img.onload = () => resolve(img)
                img.onerror = reject
            })
        }

        const loadMaterialImages = async () => {
            const materialImages: Record<string, HTMLImageElement> = {}
            const promises = Object.values(MATERIALS).map(async (material) => {
                if (material.iconUrl && material.iconUrl.startsWith('/')) {
                    try {
                        const img = await loadImage(material.iconUrl)
                        materialImages[material.id] = img
                    } catch (e) {
                        console.error(`Failed to load image for ${material.id}`, e)
                    }
                }
            })
            await Promise.all(promises)
            return materialImages
        }

        Promise.all([
            loadImage('/assets/background.png'),
            loadImage('/assets/herb_farm.png'),
            loadImage('/assets/mine.png'),
            loadImage('/assets/alchemy_workshop.png'),
            loadImage('/assets/shop_building.png'),
            loadImage('/assets/shop_interior.png'),
            loadImage('/assets/cauldron_pixel.png'),
            loadImage('/assets/dungeon_entrance.png'),
            loadImage('/assets/facility/spirit_santuary.png'),
            loadMaterialImages(),
            // Load Blacksmith images for levels 1-5
            Promise.all([
                loadImage('/assets/facility/blacksmith_1.png'),
                loadImage('/assets/facility/forge_1.png'),
                loadImage('/assets/facility/forge_2.png'),
                loadImage('/assets/facility/forge_3.png'),
                loadImage('/assets/facility/forge_4.png')
            ]).then(([lv1, lv2, lv3, lv4, lv5]) => ({
                1: lv1,
                2: lv2,
                3: lv3,
                4: lv4,
                5: lv5
            }))
        ])
            .then(([bg, herbFarm, mine, alchemyWorkshop, shopBuilding, shopInterior, cauldronPixel, dungeonForest, spiritSanctum, materials, blacksmithImages]) => {
                setImages({
                    background: bg as HTMLImageElement,
                    herb_farm: herbFarm as HTMLImageElement,
                    mine: mine as HTMLImageElement,
                    alchemy_workshop: alchemyWorkshop as HTMLImageElement,
                    shop_building: shopBuilding as HTMLImageElement,
                    shop_interior: shopInterior as HTMLImageElement,
                    cauldron_pixel: cauldronPixel as HTMLImageElement,
                    dungeon_forest: dungeonForest as HTMLImageElement,
                    spirit_sanctum: spiritSanctum as HTMLImageElement,
                    blacksmith: blacksmithImages as Record<number, HTMLImageElement>,
                    materials: materials as Record<string, HTMLImageElement>
                })
            })
            .catch((err) => console.error('Failed to load images:', err))
    }, []) // Empty deps - load once on mount

    return images
}
