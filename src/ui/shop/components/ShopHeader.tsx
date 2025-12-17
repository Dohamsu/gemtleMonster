// src/ui/shop/components/ShopHeader.tsx
import React from 'react';
import { colors, fontFamily } from '../../../constants/designTokens';
import { formatNumber } from '../../../utils/numberUtils';

interface ShopHeaderProps {
  gold: number;
  activeTab: 'buy' | 'sell';
  setActiveTab: (tab: 'buy' | 'sell') => void;
  onLeave: () => void;
}

const ShopHeader: React.FC<ShopHeaderProps> = ({ gold, activeTab, setActiveTab, onLeave }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(28, 25, 23, 0.95)',
      backdropFilter: 'blur(4px)',
      borderBottom: '1px solid #494022',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <button onClick={onLeave} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.surfaceDark,
            border: `1px solid ${colors.borderDark}`,
            borderRadius: '0.5rem',
            color: colors.gray300,
            cursor: 'pointer',
            fontFamily: fontFamily.display,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span>Leave</span>
          </button>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: colors.textGold,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>Imperial Outpost</h1>
            <div style={{
              height: '2px',
              width: '6rem',
              background: `linear-gradient(to right, transparent, ${colors.primary}, transparent)`,
              marginTop: '0.25rem',
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1.25rem',
            backgroundColor: colors.surfaceDark,
            border: `1px solid ${colors.primary}30`,
            borderRadius: '9999px',
            boxShadow: '0 0 15px rgba(231, 179, 8, 0.15)',
          }}>
            <span className="material-symbols-outlined" style={{ color: colors.primary, fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span style={{
              color: colors.primaryLight,
              fontWeight: 'bold',
              fontSize: '1.125rem',
              letterSpacing: '0.025em',
            }}>{formatNumber(gold)}</span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            width: '100%',
            maxWidth: '28rem',
            backgroundColor: colors.surfaceDarker,
            borderRadius: '0.5rem',
            padding: '0.25rem',
            border: `1px solid ${colors.borderDark}`,
          }}>
            <button onClick={() => setActiveTab('buy')} style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: activeTab === 'buy' ? colors.primary : 'transparent',
              color: activeTab === 'buy' ? colors.surfaceDarker : colors.gray500,
              fontFamily: fontFamily.display,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer',
            }}>
              Buy Items
            </button>
            <button onClick={() => setActiveTab('sell')} style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: activeTab === 'sell' ? colors.primary : 'transparent',
              color: activeTab === 'sell' ? colors.surfaceDarker : colors.gray500,
              fontFamily: fontFamily.display,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer',
            }}>
              Sell Loot
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
