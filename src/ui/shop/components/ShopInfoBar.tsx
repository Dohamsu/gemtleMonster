// src/ui/shop/components/ShopInfoBar.tsx
import React from 'react';
import { colors, fontFamily } from '../../../constants/designTokens';

interface ShopInfoBarProps {
  timeLeft: string;
}

const ShopInfoBar: React.FC<ShopInfoBarProps> = ({ timeLeft }) => {
  const [hours, minutes, seconds] = timeLeft.split(':');

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '2rem',
      borderBottom: `1px solid ${colors.borderDark}80`,
      paddingBottom: '2rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        <p style={{
          color: colors.gray400,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginLeft: '0.25rem',
        }}>Shop Refreshes In</p>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          fontFamily: fontFamily.display,
        }}>
          <TimeUnit value={hours} label="Hrs" />
          <div style={{ display: 'flex', alignItems: 'center', color: colors.gray600 }}>:</div>
          <TimeUnit value={minutes} label="Min" />
          <div style={{ display: 'flex', alignItems: 'center', color: colors.gray600 }}>:</div>
          <TimeUnit value={seconds} label="Sec" isPrimary />
        </div>
      </div>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        width: '100%',
        justifyContent: 'flex-end',
      }}>
        <FilterChip label="All Items" isActive />
        <FilterChip label="Consumables" />
        <FilterChip label="Equipment" />
        <FilterChip label="Materials" />
      </div>
    </div>
  );
};

const TimeUnit: React.FC<{ value: string; label: string; isPrimary?: boolean }> = ({ value, label, isPrimary }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
    border: `1px solid ${colors.primary}30`,
    borderRadius: '0.5rem',
    width: '4rem',
    height: '3.5rem',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
  }}>
    <span style={{
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: isPrimary ? colors.primary : colors.white,
    }}>{value || '00'}</span>
    <span style={{
      fontSize: '0.625rem',
      color: colors.gray500,
      textTransform: 'uppercase',
    }}>{label}</span>
  </div>
);

const FilterChip: React.FC<{ label: string; isActive?: boolean }> = ({ label, isActive }) => (
  <button style={{
    whiteSpace: 'nowrap',
    padding: '0.5rem 1rem',
    backgroundColor: isActive ? `${colors.primary}30` : colors.surfaceDark,
    border: `1px solid ${isActive ? colors.primary : colors.borderDark}`,
    color: isActive ? colors.primary : colors.gray400,
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: fontFamily.display,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
  }}>
    {label}
  </button>
);

export default ShopInfoBar;
