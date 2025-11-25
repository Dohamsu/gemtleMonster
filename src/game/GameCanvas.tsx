import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { user } = useAuth()
    const { facilities, canvasView, setCanvasView } = useGameStore()
    const {
        allRecipes,
        allMaterials,
        playerMaterials,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        brewStartTime,
        selectRecipe,
        addIngredient,
        startBrewing,
        completeBrewing,
        loadAllData
    } = useAlchemyStore()

    // Load alchemy data on mount
    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
    }, [user, loadAllData])

    const imagesRef = useRef<{
        background: HTMLImageElement | null
        herb_farm: HTMLImageElement | null
        mine: HTMLImageElement | null
        alchemy_workshop: HTMLImageElement | null
    }>({
        background: null,
        herb_farm: null,
        mine: null,
        alchemy_workshop: null
    })

    useEffect(() => {
        const loadImage = (src: string) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
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
            loadImage('/assets/alchemy_workshop.png')
        ]).then(([bg, herbFarm, mine, alchemyWorkshop]) => {
            imagesRef.current = {
                background: bg,
                herb_farm: herbFarm,
                mine: mine,
                alchemy_workshop: alchemyWorkshop
            }
        }).catch(err => console.error('Failed to load images:', err))
    }, [])

    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (event.clientX - rect.left) * scaleX
        const y = (event.clientY - rect.top) * scaleY

        if (canvasView === 'map') {
            // Check if clicking on alchemy workshop
            const workshopX = canvas.width * 0.5 - 64
            const workshopY = canvas.height * 0.7 - 64
            if (x >= workshopX && x <= workshopX + 128 &&
                y >= workshopY && y <= workshopY + 128) {
                setCanvasView('alchemy_workshop')
            }
        } else if (canvasView === 'alchemy_workshop') {
            // Back button
            const backBtnX = 20
            const backBtnY = 20
            const backBtnW = 100
            const backBtnH = 40
            if (x >= backBtnX && x <= backBtnX + backBtnW &&
                y >= backBtnY && y <= backBtnY + backBtnH) {
                setCanvasView('map')
                return
            }

            // Recipe list clicks
            const recipeX = 40
            const recipeY = 120
            const recipeW = 220
            const recipeItemH = 60
            const recipePadding = 5

            const visibleRecipes = allRecipes.filter(r => !r.is_hidden)
            for (let i = 0; i < visibleRecipes.length; i++) {
                const itemY = recipeY + 40 + (i * (recipeItemH + recipePadding))
                if (x >= recipeX && x <= recipeX + recipeW &&
                    y >= itemY && y <= itemY + recipeItemH) {
                    selectRecipe(visibleRecipes[i].id)
                    console.log('Selected recipe:', visibleRecipes[i].name)
                    return
                }
            }

            // Inventory clicks (right side) - add ingredient
            const invX = canvas.width - 260
            const invY = 120
            const invW = 220
            const invItemH = 40
            const invPadding = 3

            const materialsList = allMaterials.filter(m => (playerMaterials[m.id] || 0) > 0)
            for (let i = 0; i < materialsList.length; i++) {
                const itemY = invY + 40 + (i * (invItemH + invPadding))
                if (x >= invX && x <= invX + invW &&
                    y >= itemY && y <= itemY + invItemH) {
                    const material = materialsList[i]
                    addIngredient(material.id, 1)
                    console.log('Added ingredient:', material.name)
                    return
                }
            }

            // Brew button
            if (!isBrewing) {
                const brewBtnW = 180
                const brewBtnH = 50
                const brewBtnX = canvas.width / 2 - brewBtnW / 2
                const brewBtnY = canvas.height - 80
                if (x >= brewBtnX && x <= brewBtnX + brewBtnW &&
                    y >= brewBtnY && y <= brewBtnY + brewBtnH) {
                    if (selectedRecipeId) {
                        const recipe = allRecipes.find(r => r.id === selectedRecipeId)
                        if (recipe && recipe.ingredients) {
                            // Check if we have enough materials in inventory
                            const hasEnough = recipe.ingredients.every(ing =>
                                (playerMaterials[ing.material_id] || 0) >= ing.quantity
                            )

                            if (hasEnough) {
                                startBrewing(selectedRecipeId)
                                console.log('🧪 Brewing started!')

                                // Auto-complete after craftTime
                                setTimeout(() => {
                                    const success = Math.random() * 100 < recipe.base_success_rate
                                    completeBrewing(success)
                                    console.log(success ? '✅ Brewing success!' : '❌ Brewing failed!')
                                }, recipe.craft_time_sec * 1000)
                            } else {
                                console.log('❌ Not enough materials in inventory!')
                            }
                        }
                    }
                }
            }
        }
    }, [canvasView, setCanvasView, allRecipes, allMaterials, playerMaterials, selectedRecipeId, selectedIngredients, isBrewing, selectRecipe, addIngredient, startBrewing, completeBrewing])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        let animationFrameId: number

        const render = () => {
            if (canvas.width !== canvas.parentElement?.clientWidth || canvas.height !== canvas.parentElement?.clientHeight) {
                canvas.width = canvas.parentElement?.clientWidth || 800
                canvas.height = canvas.parentElement?.clientHeight || 600
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const imgs = imagesRef.current

            if (canvasView === 'map') {
                // Render Map View
                ctx.fillStyle = '#000000'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                if (imgs.herb_farm && facilities['herb_farm']) {
                    const farmX = canvas.width * 0.3 - 64
                    const farmY = canvas.height * 0.4 - 64
                    ctx.drawImage(imgs.herb_farm, farmX, farmY, 128, 128)
                    ctx.fillStyle = 'white'
                    ctx.font = 'bold 14px Arial'
                    ctx.shadowColor = 'black'
                    ctx.shadowBlur = 4
                    ctx.fillText(`Lv.${facilities['herb_farm']} `, farmX + 30, farmY + 140)
                    ctx.shadowBlur = 0
                }
                if (imgs.mine && facilities['mine'] && facilities['mine'] > 0) {
                    const mineX = canvas.width * 0.7 - 64
                    const mineY = canvas.height * 0.4 - 64
                    ctx.drawImage(imgs.mine, mineX, mineY, 128, 128)
                    ctx.fillStyle = 'white'
                    ctx.font = 'bold 14px Arial'
                    ctx.shadowColor = 'black'
                    ctx.shadowBlur = 4
                    ctx.fillText(`Lv.${facilities['mine']} `, mineX + 30, mineY + 140)
                    ctx.shadowBlur = 0
                }
                if (imgs.alchemy_workshop) {
                    const workshopX = canvas.width * 0.5 - 64
                    const workshopY = canvas.height * 0.7 - 64
                    ctx.drawImage(imgs.alchemy_workshop, workshopX, workshopY, 128, 128)
                    ctx.fillStyle = 'white'
                    ctx.font = 'bold 14px Arial'
                    ctx.shadowColor = 'black'
                    ctx.shadowBlur = 4
                    ctx.fillText('연금술 공방', workshopX + 20, workshopY + 140)
                    ctx.shadowBlur = 0
                }
            } else if (canvasView === 'alchemy_workshop') {
                // Render Alchemy Workshop Interior
                ctx.fillStyle = '#2a1810'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Back button
                const backBtnX = 20
                const backBtnY = 20
                const backBtnW = 100
                const backBtnH = 40
                ctx.fillStyle = '#4a3020'
                ctx.fillRect(backBtnX, backBtnY, backBtnW, backBtnH)
                ctx.strokeStyle = '#8a6040'
                ctx.lineWidth = 2
                ctx.strokeRect(backBtnX, backBtnY, backBtnW, backBtnH)
                ctx.fillStyle = 'white'
                ctx.font = 'bold 16px Arial'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('← 돌아가기', backBtnX + backBtnW / 2, backBtnY + backBtnH / 2)

                // Title
                ctx.fillStyle = '#f0d090'
                ctx.font = 'bold 32px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('🧪 연금술 공방', canvas.width / 2, 60)

                // Central Cauldron Area
                const cauldronX = canvas.width / 2 - 100
                const cauldronY = canvas.height / 2 - 100
                const cauldronSize = 200

                ctx.fillStyle = '#1a1410'
                ctx.beginPath()
                ctx.arc(cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2, cauldronSize / 2, 0, Math.PI * 2)
                ctx.fill()

                ctx.strokeStyle = '#6a4020'
                ctx.lineWidth = 4
                ctx.stroke()

                ctx.font = 'bold 80px Arial'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('🍯', cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2)

                // Recipe List (Left Side)
                const recipeX = 40
                const recipeY = 120
                const recipeW = 220
                const recipeH = canvas.height - 160

                ctx.fillStyle = '#3a2520'
                ctx.fillRect(recipeX, recipeY, recipeW, recipeH)
                ctx.strokeStyle = '#7a5040'
                ctx.lineWidth = 2
                ctx.strokeRect(recipeX, recipeY, recipeW, recipeH)

                ctx.fillStyle = '#f0d090'
                ctx.font = 'bold 18px Arial'
                ctx.textAlign = 'left'
                ctx.textBaseline = 'top'
                ctx.fillText('📜 레시피', recipeX + 10, recipeY + 10)

                // Render recipe items
                const visibleRecipes = allRecipes.filter(r => !r.is_hidden)
                const recipeItemH = 60
                const recipePadding = 5

                visibleRecipes.forEach((recipe, i) => {
                    const itemY = recipeY + 40 + (i * (recipeItemH + recipePadding))
                    const isSelected = selectedRecipeId === recipe.id

                    ctx.fillStyle = isSelected ? '#5a4030' : '#4a3020'
                    ctx.fillRect(recipeX + 5, itemY, recipeW - 10, recipeItemH)

                    if (isSelected) {
                        ctx.strokeStyle = '#facc15'
                        ctx.lineWidth = 2
                        ctx.strokeRect(recipeX + 5, itemY, recipeW - 10, recipeItemH)
                    }

                    ctx.fillStyle = '#f0d090'
                    ctx.font = 'bold 14px Arial'
                    ctx.fillText(recipe.name, recipeX + 10, itemY + 8)

                    // Materials required
                    if (recipe.ingredients) {
                        recipe.ingredients.forEach((ing, idx) => {
                            const mat = allMaterials.find(m => m.id === ing.material_id)
                            const owned = playerMaterials[ing.material_id] || 0
                            const hasEnough = owned >= ing.quantity
                            const yPos = itemY + 28 + (idx * 12)

                            ctx.fillStyle = hasEnough ? '#aaa' : '#ff6666'
                            ctx.font = '11px Arial'
                            ctx.fillText(`${mat?.name || ing.material_id} ${owned}/${ing.quantity}`, recipeX + 10, yPos, recipeW - 20)
                        })
                    }

                    ctx.fillStyle = '#888'
                    ctx.font = '10px Arial'
                    ctx.fillText(`⏱️ ${recipe.craft_time_sec}초`, recipeX + 10, itemY + 45)
                })

                // Inventory (Right Side)
                const invX = canvas.width - 260
                const invY = 120
                const invW = 220
                const invH = canvas.height - 160

                ctx.fillStyle = '#3a2520'
                ctx.fillRect(invX, invY, invW, invH)
                ctx.strokeStyle = '#7a5040'
                ctx.lineWidth = 2
                ctx.strokeRect(invX, invY, invW, invH)

                ctx.fillStyle = '#f0d090'
                ctx.font = 'bold 18px Arial'
                ctx.textAlign = 'left'
                ctx.fillText('🎒 보유 재료', invX + 10, invY + 10)

                // Render inventory items
                const materialsList = allMaterials.filter(m => (playerMaterials[m.id] || 0) > 0)
                const invItemH = 40
                const invPadding = 3

                materialsList.forEach((material, i) => {
                    const count = playerMaterials[material.id] || 0
                    const itemY = invY + 40 + (i * (invItemH + invPadding))

                    ctx.fillStyle = '#4a3020'
                    ctx.fillRect(invX + 5, itemY, invW - 10, invItemH)

                    ctx.fillStyle = count > 0 ? '#f0d090' : '#666'
                    ctx.font = 'bold 13px Arial'
                    ctx.fillText(material.name, invX + 10, itemY + 12)

                    ctx.fillStyle = count > 0 ? '#aaa' : '#555'
                    ctx.font = '12px Arial'
                    ctx.fillText(`보유: ${count}개`, invX + 10, itemY + 28)
                })

                // Brew Button
                const brewBtnW = 180
                const brewBtnH = 50
                const brewBtnX = canvas.width / 2 - brewBtnW / 2
                const brewBtnY = canvas.height - 80

                if (isBrewing) {
                    // Progress bar
                    ctx.fillStyle = '#3a2a20'
                    ctx.fillRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)
                    ctx.strokeStyle = '#7a5a40'
                    ctx.lineWidth = 3
                    ctx.strokeRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)

                    const selectedRecipe = allRecipes.find(r => r.id === selectedRecipeId)
                    if (selectedRecipe && brewStartTime) {
                        const elapsed = Date.now() - brewStartTime
                        const progress = Math.min(elapsed / (selectedRecipe.craft_time_sec * 1000), 1)

                        const progressW = (brewBtnW - 10) * progress
                        ctx.fillStyle = '#facc15'
                        ctx.fillRect(brewBtnX + 5, brewBtnY + 5, progressW, brewBtnH - 10)

                        ctx.fillStyle = '#fff'
                        ctx.font = 'bold 18px Arial'
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillText(`⚗️ 제조 중... ${Math.floor(progress * 100)}%`, brewBtnX + brewBtnW / 2, brewBtnY + brewBtnH / 2)
                    }
                } else {
                    const canBrew = selectedRecipeId !== null
                    const selectedRecipe = allRecipes.find(r => r.id === selectedRecipeId)
                    let hasEnough = false
                    if (selectedRecipe && selectedRecipe.ingredients) {
                        hasEnough = selectedRecipe.ingredients.every(ing =>
                            (playerMaterials[ing.material_id] || 0) >= ing.quantity
                        )
                    }

                    ctx.fillStyle = (canBrew && hasEnough) ? '#5a3a20' : '#3a2520'
                    ctx.fillRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)
                    ctx.strokeStyle = (canBrew && hasEnough) ? '#9a6a40' : '#5a4030'
                    ctx.lineWidth = 3
                    ctx.strokeRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)

                    ctx.fillStyle = (canBrew && hasEnough) ? '#f0d090' : '#666'
                    ctx.font = 'bold 20px Arial'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('⚗️ 연금술 시작', brewBtnX + brewBtnW / 2, brewBtnY + brewBtnH / 2)
                }

                ctx.textAlign = 'left'
                ctx.textBaseline = 'alphabetic'
            }

            animationFrameId = requestAnimationFrame(render)
        }
        render()
        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [facilities, canvasView, allRecipes, allMaterials, playerMaterials, selectedRecipeId, selectedIngredients, isBrewing, brewStartTime])

    return (
        <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
        />
    )
}
