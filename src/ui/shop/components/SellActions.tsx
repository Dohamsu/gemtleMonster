// src/ui/shop/components/SellActions.tsx
import React from 'react';
import { colors, fontFamily } from '../../../constants/designTokens';
import { formatNumber } from '../../../utils/numberUtils';

interface SellActionsProps {
  selectedItemCount: number;
  totalSelectedValue: number;
  onSell: () => void;
  isSelling: boolean;
}

const SellActions: React.FC<SellActionsProps> = ({ selectedItemCount, totalSelectedValue, onSell, isSelling }) => {
  const canSell = selectedItemCount > 0 && !isSelling;

  return (
    <div style={{
      backgroundColor: colors.surfaceDark,
      padding: '1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: `1px solid ${colors.borderDark}`,
      marginBottom: '1.5rem',
    }}>
      <div style={{
        color: colors.gray300,
        fontWeight: 'bold',
      }}>
        Selected Items: <span style={{ color: colors.white }}>{selectedItemCount}</span>
        <span style={{ margin: '0 1rem', color: colors.gray600 }}>|</span>
        Total Value: <span style={{ color: colors.primaryLight }}>{formatNumber(totalSelectedValue)}G</span>
      </div>
      <button
        onClick={onSell}
        disabled={!canSell}
        style={{
          backgroundColor: canSell ? colors.primary : colors.gray600,
          color: canSell ? colors.surfaceDarker : colors.gray400,
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          cursor: canSell ? 'pointer' : 'not-allowed',
          fontFamily: fontFamily.display,
          fontWeight: 'bold',
          fontSize: '1rem',
          textTransform: 'uppercase',
        }}
      >
        {isSelling ? 'Selling...' : 'Sell Selected'}
      </button>
    </div>
  );
};

export default SellActions;
