// src/ui/shop/components/ShopItemCard.tsx
import React, { useState } from 'react';
import { colors, fontFamily } from '../../../constants/designTokens';
import { formatNumber } from '../../../utils/numberUtils';
import { MATERIALS } from '../../../data/alchemyData';
import type { ShopSaleItem } from '../../../store/useShopStore';

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'N' | 'R' | 'SR' | 'SSR' | string;


interface ShopItemCardProps {
  item: ShopSaleItem;
  playerGold: number;
  onPurchase: (item: ShopSaleItem, quantity: number) => void;
  isPurchasing: boolean;
  inStock: number;
}

const getRarityStyles = (rarity: Rarity) => {
    switch (rarity) {
        case 'UNCOMMON': return { name: 'Uncommon', color: colors.green500, borderColor: colors.green500, shadowColor: 'rgba(34,197,94,0.15)' };
        case 'RARE': case 'R': return { name: 'Rare', color: colors.blue400, borderColor: colors.blue500, shadowColor: 'rgba(59,130,246,0.15)' };
        case 'EPIC': case 'SR': return { name: 'Epic', color: colors.purple400, borderColor: colors.purple400, shadowColor: 'rgba(168,85,247,0.15)' };
        case 'LEGENDARY': case 'SSR': return { name: 'Legendary', color: colors.primaryLight, borderColor: colors.primary, shadowColor: 'rgba(231,179,8,0.25)' };
        case 'COMMON': case 'N':
        default:
            return { name: 'Common', color: colors.gray500, borderColor: colors.gray500, shadowColor: 'rgba(231,179,8,0.1)' };
    }
}


const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, playerGold, onPurchase, isPurchasing, inStock }) => {
  const [quantity, setQuantity] = useState(1);
  const material = MATERIALS[item.id];

  if (!material) return null;

  const rarity = getRarityStyles(material.rarity as Rarity);
  const totalCost = item.price * quantity;
  const canAfford = playerGold >= totalCost;
  const isSoldOut = inStock === 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, inStock)));
  };

  const handlePurchase = () => {
    if (!isSoldOut && canAfford && !isPurchasing) {
      onPurchase(item, quantity);
    }
  };

  const buttonState = () => {
    if (isSoldOut) return { text: 'Out of Stock', disabled: true, style: 'disabled' as const };
    if (!canAfford) return { text: 'Not Enough Gold', disabled: true, style: 'insufficient' as const };
    if (isPurchasing) return { text: 'Processing...', disabled: true, style: 'loading' as const };
    return { text: 'Purchase', disabled: false, style: 'default' as const };
  }

  const currentButtonState = buttonState();

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'rgba(42, 42, 42, 0.8)',
      backdropFilter: 'blur(4px)',
      border: `1px solid ${colors.borderDark}`,
      borderRadius: '0.75rem',
      padding: '1rem',
      transition: 'all 0.3s',
      opacity: isSoldOut ? 0.75 : 1,
    }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', filter: isSoldOut ? 'grayscale(1)' : 'none' }}>
        <div style={{
          position: 'relative',
          width: '5rem',
          height: '5rem',
          flexShrink: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: '0.5rem',
          border: `2px solid ${rarity.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 0 10px ${rarity.shadowColor}`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: rarity.color, opacity: 0.1 }}></div>
          <img src={material.iconUrl} alt={material.name} style={{ width: '3.5rem', height: '3.5rem', objectFit: 'contain', zIndex: 10 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.25rem 0' }}>
          <div>
            <h3 style={{ color: colors.white, fontWeight: 'bold', fontSize: '1.125rem', lineHeight: 1.2 }}>{material.name}</h3>
            <span style={{ fontSize: '0.75rem', color: rarity.color, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>{rarity.name}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.gray400, backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', alignSelf: 'flex-start' }}>
            In Stock: <span style={{ color: colors.white, fontFamily: 'monospace' }}>{inStock}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: colors.primaryLight }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>toll</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{formatNumber(item.price)}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: colors.gray500 }}>Per unit</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          max={inStock}
          disabled={isSoldOut}
        />
        <PurchaseButton
          text={currentButtonState.text}
          disabled={currentButtonState.disabled}
          onClick={handlePurchase}
          styleType={currentButtonState.style}
        />
      </div>
    </div>
  );
};

// Sub-components for clarity
const QuantityInput: React.FC<{ value: number, onChange: (val: number) => void, max: number, disabled?: boolean }> = ({ value, onChange, max, disabled }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceDarker, borderRadius: '0.5rem', border: `1px solid ${colors.borderDark}`, height: '2.5rem', padding: '0 0.25rem', opacity: disabled ? 0.5 : 1 }}>
        <button onClick={() => onChange(Math.max(1, value - 1))} disabled={disabled} style={{ width: '2rem', height: '100%', color: colors.gray400, background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>remove</span>
        </button>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(1, Math.min(parseInt(e.target.value) || 1, max)))}
            disabled={disabled}
            style={{ width: '100%', backgroundColor: 'transparent', textAlign: 'center', color: colors.white, fontWeight: 'bold', border: 'none', padding: 0 }}
        />
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled} style={{ width: '2rem', height: '100%', color: colors.gray400, background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
        </button>
    </div>
);

type ButtonStyleType = 'default' | 'insufficient' | 'disabled' | 'loading';

const PurchaseButton: React.FC<{ text: string, disabled?: boolean, onClick: () => void, styleType: ButtonStyleType }> = ({ text, disabled, onClick, styleType }) => {
    const baseStyle: React.CSSProperties = {
        width: '100%',
        height: '2.5rem',
        fontFamily: fontFamily.display.join(','),
        fontWeight: 'bold',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    };

    const styles: Record<ButtonStyleType, React.CSSProperties> = {
        default: { backgroundColor: colors.primary, color: colors.surfaceDarker },
        insufficient: { backgroundColor: colors.surfaceDarker, border: `1px solid ${colors.red900}80`, color: `${colors.red400}B3` },
        disabled: { backgroundColor: colors.surfaceDark, border: `1px solid ${colors.borderDark}`, color: colors.gray500 },
        loading: { backgroundColor: colors.primaryLight, color: colors.surfaceDarker },
    };

    const style = { ...baseStyle, ...styles[styleType] };


    return (
        <button onClick={onClick} disabled={disabled} style={style}>
            {text}
        </button>
    )
};


export default ShopItemCard;
