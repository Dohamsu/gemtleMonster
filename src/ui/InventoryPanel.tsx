import React, { useState, useEffect } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { isMobileView } from '../utils/responsiveUtils'
import { getFamilyColor, getRarityColor } from '../utils/materialUtils'
import ResourceIcon from './ResourceIcon'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'

export const InventoryPanel: React.FC = () => {
  const [isMobile, setIsMobile] = useState(isMobileView())
  const {
    allMaterials,
    addIngredient,
    removeIngredient,
    selectedIngredients
  } = useAlchemyStore()

  const { materialCounts: playerMaterials } = useUnifiedInventory()

  const [activeTab, setActiveTab] = useState<'materials' | 'consumables'>('materials')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)

  // 반응형 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileView())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter materials based on tab and ownership
  const filteredMaterials = allMaterials
    .filter(m => {
      const isConsumable = m.family === 'CONSUMABLE'
      if (activeTab === 'materials' && isConsumable) return false
      if (activeTab === 'consumables' && !isConsumable) return false
      return true
    })
    .filter(m => !showOnlyOwned || (playerMaterials[m.id] || 0) > 0)

  const handleAddToSlot = (materialId: string) => {
    const currentQty = selectedIngredients[materialId] || 0
    if (currentQty > 0) {
      removeIngredient(materialId, currentQty)
    } else {
      addIngredient(materialId, 1)
    }
  }

  return (
    <div style={{
      width: isMobile ? '100%' : '320px',
      height: '100%', // Mobile also takes 100% now inside the drawer
      flex: isMobile ? 1 : 'none',
      minHeight: 0,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderLeft: isMobile ? 'none' : '2px solid #4a5568',
      borderTop: isMobile ? '2px solid #4a5568' : 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 (모바일에서는 숨김, 데스크톱에서는 타이틀만 표시) */}
      {!isMobile && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #4a5568',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            color: '#f0e68c'
          }}>
            인벤토리
          </h2>
        </div>
      )}

      {/* 탭 & 필터 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #4a5568',
        background: '#0f172a',
        paddingRight: '8px' // 버튼 여백
      }}>
        <div
          onClick={() => setActiveTab('materials')}
          style={{
            flex: 1,
            padding: '12px 8px',
            background: activeTab === 'materials' ? '#1e293b' : 'transparent',
            color: activeTab === 'materials' ? '#f0e68c' : '#64748b',
            borderBottom: activeTab === 'materials' ? '2px solid #f0e68c' : '2px solid transparent',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          재료
        </div>
        <div
          onClick={() => setActiveTab('consumables')}
          style={{
            flex: 1,
            padding: '12px 8px',
            background: activeTab === 'consumables' ? '#1e293b' : 'transparent',
            color: activeTab === 'consumables' ? '#f0e68c' : '#64748b',
            borderBottom: activeTab === 'consumables' ? '2px solid #f0e68c' : '2px solid transparent',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          소모품
        </div>

        {/* Show Only Owned Toggle (탭 바 우측으로 이동) */}
        <div style={{
          width: '1px',
          height: '20px',
          background: '#334155',
          margin: '0 8px'
        }} />
        <button
          onClick={() => setShowOnlyOwned(!showOnlyOwned)}
          style={{
            width: '32px',
            height: '32px',
            background: showOnlyOwned ? '#334155' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: showOnlyOwned ? '#facc15' : '#64748b',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="보유 재료만 보기"
        >
          ★
        </button>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '6px' : '8px',
        minHeight: 0
      }}>
        <>
          {filteredMaterials.length === 0 ? (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              {activeTab === 'materials' ? '보유한 재료가 없습니다.' : '보유한 소모품이 없습니다.'}
            </div>
          ) : (
            // Grid View (Always)
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px'
            }}>
              {filteredMaterials.map(material => {
                const quantity = playerMaterials[material.id] || 0
                return (
                  <div
                    key={material.id}
                    onClick={() => handleAddToSlot(material.id)}
                    style={{
                      padding: '12px 8px',
                      background: '#1e293b',
                      border: selectedIngredients[material.id] ? '2px solid #ffd700' : `2px solid ${getRarityColor(material.rarity)}40`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      position: 'relative',
                      opacity: quantity > 0 ? 1 : 0.4,
                      filter: quantity > 0 ? 'none' : 'grayscale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#334155'
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1e293b'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {/* Material Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: getFamilyColor(material.family),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <ResourceIcon resourceId={material.id} size={32} iconUrl={material.icon_url} />
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: getRarityColor(material.rarity),
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {material.name}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#f0e68c',
                      marginRight: '8px',
                      display: 'inline-block'
                    }}>
                      ×{quantity}
                    </div>
                    {material.is_special && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontSize: '8px',
                        padding: '2px 4px',
                        background: '#7c3aed',
                        color: 'white',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                      }}>
                        특수
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      </div>

      {/* 안내 */}
      <div style={{
        padding: isMobile ? '10px' : '12px',
        borderTop: '1px solid #4a5568',
        background: '#0f172a',
        fontSize: isMobile ? '10px' : '11px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        재료를 클릭하여 연금솥에 추가하세요
      </div>
    </div>
  )
}
