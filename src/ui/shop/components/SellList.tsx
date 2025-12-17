// src/ui/shop/components/SellList.tsx
import React from 'react';
import { colors, fontFamily } from '../../../constants/designTokens';
import { formatNumber } from '../../../utils/numberUtils';
import { MATERIALS } from '../../../data/alchemyData';

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'N' | 'R' | 'SR' | 'SSR' | string;

export interface SellItem {
  id: string;
  name: string;
  type: 'material' | 'legacy';
  count: number;
  price: number;
  rarity?: Rarity;
}

interface SellListProps {
  items: SellItem[];
  selectedItems: Set<string>;
  onSelectionChange: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  sellQuantities: Record<string, number>;
}

const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
        case 'UNCOMMON': return colors.green500;
        case 'RARE': case 'R': return colors.blue500;
        case 'EPIC': case 'SR': return colors.purple400;
        case 'LEGENDARY': case 'SSR': return colors.primary;
        case 'COMMON': case 'N':
        default: return colors.gray500;
    }
}

const SellList: React.FC<SellListProps> = ({ items, selectedItems, onSelectionChange, onQuantityChange, sellQuantities }) => {
  return (
    <div style={{
      backgroundColor: colors.surfaceDark,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1px solid ${colors.borderDark}`,
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: colors.gray300 }}>
        <thead>
          <tr style={{ backgroundColor: colors.surfaceDarker, borderBottom: `1px solid ${colors.borderDark}` }}>
            <th style={{ padding: '0.75rem', width: '40px' }}><input type="checkbox" /></th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Owned</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Quantity to Sell</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Price</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isSelected = selectedItems.has(item.id);
            const quantity = sellQuantities[item.id] || 1;
            const totalValue = quantity * item.price;
            const material = item.type === 'material' ? MATERIALS[item.id] : null;

            return (
              <tr key={item.id} style={{
                borderBottom: `1px solid ${colors.borderDark}`,
                backgroundColor: isSelected ? 'rgba(231, 179, 8, 0.05)' : 'transparent',
              }}>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectionChange(item.id)}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {material && (
                      <img src={material.iconUrl} alt={material.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }}/>
                    )}
                    <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                    {item.rarity && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        backgroundColor: getRarityColor(item.rarity),
                        color: colors.white,
                      }}>{item.rarity}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center', color: colors.gray400 }}>{formatNumber(item.count)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value))}
                    min="1"
                    max={item.count}
                    style={{
                      width: '60px',
                      textAlign: 'center',
                      backgroundColor: colors.surfaceDarker,
                      color: colors.white,
                      border: `1px solid ${colors.borderDark}`,
                      borderRadius: '0.25rem',
                      padding: '0.25rem',
                    }}
                  />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: colors.gray400 }}>{item.price}G</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: colors.primaryLight }}>{formatNumber(totalValue)}G</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SellList;
