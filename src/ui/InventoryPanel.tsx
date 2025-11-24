import React from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'

export const InventoryPanel: React.FC = () => {
  const {
    allMaterials,
    playerMaterials,
    inventoryTab,
    setInventoryTab,
    addIngredient
  } = useAlchemyStore()

  // 보유 재료만 필터링
  const ownedMaterials = allMaterials.filter(m => (playerMaterials[m.id] || 0) > 0)

  // 계열별로 그룹화
  const groupedMaterials = ownedMaterials.reduce((acc, material) => {
    if (!acc[material.family]) {
      acc[material.family] = []
    }
    acc[material.family].push(material)
    return acc
  }, {} as Record<string, typeof allMaterials>)

  // 등급별 색상
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return '#9ca3af'
      case 'UNCOMMON': return '#22c55e'
      case 'RARE': return '#3b82f6'
      case 'EPIC': return '#a855f7'
      case 'LEGENDARY': return '#f59e0b'
      default: return '#fff'
    }
  }

  // 계열별 배경색
  const getFamilyColor = (family: string) => {
    switch (family) {
      case 'PLANT': return '#10b981'
      case 'MINERAL': return '#6366f1'
      case 'BEAST': return '#f59e0b'
      case 'SLIME': return '#8b5cf6'
      case 'SPIRIT': return '#ec4899'
      default: return '#64748b'
    }
  }

  const handleAddToSlot = (materialId: string) => {
    addIngredient(materialId, 1)
  }

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderLeft: '2px solid #4a5568',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #4a5568'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          color: '#f0e68c',
          textAlign: 'center'
        }}>
          인벤토리
        </h2>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #4a5568',
        background: '#0f172a'
      }}>
        {(['materials', 'monsters', 'factory'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInventoryTab(tab)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: inventoryTab === tab ? '#1e293b' : 'transparent',
              color: inventoryTab === tab ? '#f0e68c' : '#94a3b8',
              border: 'none',
              borderBottom: inventoryTab === tab ? '2px solid #f0e68c' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: inventoryTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'materials' && '재료'}
            {tab === 'monsters' && '몬스터'}
            {tab === 'factory' && '공장'}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {inventoryTab === 'materials' && (
          <>
            {ownedMaterials.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                보유한 재료가 없습니다.
              </div>
            ) : (
              Object.entries(groupedMaterials).map(([family, materials]) => (
                <div key={family} style={{ marginBottom: '16px' }}>
                  {/* 계열 헤더 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    paddingLeft: '4px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getFamilyColor(family)
                    }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#f1f5f9'
                    }}>
                      {family}
                    </span>
                  </div>

                  {/* 재료 카드 */}
                  {materials.map(material => {
                    const quantity = playerMaterials[material.id] || 0
                    return (
                      <div
                        key={material.id}
                        onClick={() => handleAddToSlot(material.id)}
                        style={{
                          marginBottom: '6px',
                          padding: '10px',
                          background: '#1e293b',
                          border: `1px solid ${getRarityColor(material.rarity)}40`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#334155'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#1e293b'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: getRarityColor(material.rarity),
                              marginBottom: '2px'
                            }}>
                              {material.name}
                            </div>
                            {material.description && (
                              <div style={{
                                fontSize: '11px',
                                color: '#94a3b8'
                              }}>
                                {material.description}
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#f0e68c',
                            minWidth: '40px',
                            textAlign: 'right'
                          }}>
                            ×{quantity}
                          </div>
                        </div>

                        {/* 특수 재료 표시 */}
                        {material.is_special && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#7c3aed',
                            color: 'white',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            특수
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </>
        )}

        {inventoryTab === 'monsters' && (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            몬스터 인벤토리는 곧 구현될 예정입니다.
          </div>
        )}

        {inventoryTab === 'factory' && (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            공장 배치 정보는 곧 구현될 예정입니다.
          </div>
        )}
      </div>

      {/* 안내 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #4a5568',
        background: '#0f172a',
        fontSize: '11px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        {inventoryTab === 'materials' && '재료를 클릭하여 연금솥에 추가하세요'}
        {inventoryTab === 'monsters' && '제작한 몬스터가 여기에 표시됩니다'}
        {inventoryTab === 'factory' && '공장 배치 정보를 확인할 수 있습니다'}
      </div>
    </div>
  )
}
