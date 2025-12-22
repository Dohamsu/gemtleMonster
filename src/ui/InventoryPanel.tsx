import React, { useState, useEffect } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { isMobileView } from '../utils/responsiveUtils'
import { getFamilyColor, getRarityColor } from '../utils/materialUtils'
import ResourceIcon from './ResourceIcon'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'

export const InventoryPanel: React.FC = () => {
  const [isMobile, setIsMobile] = useState(isMobileView())
  const { allMaterials, favoriteMaterials, toggleFavoriteMaterial } = useAlchemyStore()

  const { materialCounts: playerMaterials } = useUnifiedInventory()

  const [activeTab, setActiveTab] = useState<'materials' | 'consumables'>('materials')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

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
    .filter(m => !showOnlyFavorites || favoriteMaterials.has(m.id))

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

        {/* Favorites Filter */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          style={{
            width: '32px',
            height: '32px',
            background: showOnlyFavorites ? '#334155' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            marginRight: '4px'
          }}
          title="즐겨찾기만 보기"
        >
          <img
            src="/assets/ui/gold_star.png"
            alt="Favorites"
            style={{
              width: '20px',
              height: '20px',
              opacity: showOnlyFavorites ? 1 : 0.4,
              filter: showOnlyFavorites ? 'none' : 'grayscale(1)'
            }}
          />
        </button>

        {/* Owned Filter */}
        <button
          onClick={() => setShowOnlyOwned(!showOnlyOwned)}
          style={{
            width: '32px',
            height: '32px',
            background: showOnlyOwned ? '#334155' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="보유 재료만 보기"
        >
          <img
            src="/assets/ui/suede_bag.png"
            alt="Owned"
            style={{
              width: '20px',
              height: '20px',
              opacity: showOnlyOwned ? 1 : 0.4,
              filter: showOnlyOwned ? 'none' : 'grayscale(1)'
            }}
          />
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
              {showOnlyFavorites
                ? '즐겨찾기한 아이템이 없습니다.'
                : showOnlyOwned
                  ? '보유 중인 아이템이 없습니다.'
                  : (activeTab === 'materials' ? '보유한 재료가 없습니다.' : '보유한 소모품이 없습니다.')
              }
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
                const isFavorite = favoriteMaterials.has(material.id)

                return (
                  <div
                    key={material.id}
                    style={{
                      padding: '12px 8px',
                      background: '#1e293b',
                      border: `2px solid ${getRarityColor(material.rarity)}40`,
                      borderRadius: '8px',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      position: 'relative',
                      opacity: quantity > 0 ? 1 : 0.4,
                      filter: quantity > 0 ? 'none' : 'grayscale(1)'
                    }}
                  >
                    {/* Favorite Toggle (Top Left) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteMaterial(material.id)
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        cursor: 'pointer',
                        zIndex: 10,
                        opacity: isFavorite ? 1 : 0.3, // Always visible if favorite, else dim
                        transition: 'opacity 0.2s'
                      }}
                      title="즐겨찾기"
                    >
                      <img
                        src="/assets/ui/gold_star.png"
                        alt="Fav"
                        style={{
                          width: '14px',
                          height: '14px',
                          filter: isFavorite ? 'none' : 'grayscale(1) brightness(2)' // Bright gray when inactive
                        }}
                      />
                    </div>

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
        보유 중인 재료 및 소모품 목록
      </div>
    </div>
  )
}
