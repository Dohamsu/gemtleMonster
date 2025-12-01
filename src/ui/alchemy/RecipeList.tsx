
import { useGameStore } from '../../store/useGameStore'
import { RECIPES } from '../../data/alchemyData'
import { GAME_MONSTERS as MONSTERS } from '../../data/monsterData'

export default function RecipeList() {
    const { alchemyState, selectRecipe } = useGameStore()
    const { selectedRecipeId } = alchemyState

    // Simple filter for now: Show all non-hidden recipes
    // In a real implementation, we would check if hidden recipes are discovered
    const visibleRecipes = RECIPES.filter(r => !r.isHidden)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #333' }}>
                <h3 style={{ margin: 0, color: '#ddd' }}>레시피 목록</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {visibleRecipes.map(recipe => {
                    const monster = MONSTERS[recipe.resultMonsterId]
                    const isSelected = selectedRecipeId === recipe.id

                    return (
                        <div
                            key={recipe.id}
                            onClick={() => selectRecipe(recipe.id)}
                            style={{
                                padding: '10px',
                                marginBottom: '8px',
                                background: isSelected ? '#3a3a3a' : '#2a2a2a',
                                border: isSelected ? '1px solid #666' : '1px solid #333',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: isSelected ? '#fff' : '#ccc' }}>
                                    {recipe.name}
                                </span>
                                <span style={{
                                    fontSize: '0.8em',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: monster?.rarity === 'N' ? '#444' : monster?.rarity === 'R' ? '#2563eb' : '#7c3aed',
                                    color: '#fff'
                                }}>
                                    {monster?.rarity}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '4px' }}>
                                {monster?.role} / {monster?.element}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
