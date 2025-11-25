import { useEffect, useRef } from 'react'

export interface CanvasImages {
    background: HTMLImageElement | null
    herb_farm: HTMLImageElement | null
    mine: HTMLImageElement | null
    alchemy_workshop: HTMLImageElement | null
    cauldron_pixel: HTMLImageElement | null
}

/**
 * Custom hook to load and cache canvas images
 * Images are loaded once and cached for the lifetime of the component
 */
export function useCanvasImages() {
    const imagesRef = useRef<CanvasImages>({
        background: null,
        herb_farm: null,
        mine: null,
        alchemy_workshop: null,
        cauldron_pixel: null
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

        Promise.all([
            loadImage('/assets/background.png'),
            loadImage('/assets/herb_farm.png'),
            loadImage('/assets/mine.png'),
            loadImage('/assets/alchemy_workshop.png'),
            loadImage('/assets/cauldron_pixel.png')
        ])
            .then(([bg, herbFarm, mine, alchemyWorkshop, cauldronPixel]) => {
                imagesRef.current = {
                    background: bg,
                    herb_farm: herbFarm,
                    mine: mine,
                    alchemy_workshop: alchemyWorkshop,
                    cauldron_pixel: cauldronPixel
                }
            })
            .catch((err) => console.error('Failed to load images:', err))
    }, []) // Empty deps - load once on mount

    return imagesRef.current
}
