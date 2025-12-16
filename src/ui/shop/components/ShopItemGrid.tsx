// src/ui/shop/components/ShopItemGrid.tsx
import React from 'react';

interface ShopItemGridProps {
  children: React.ReactNode;
}

const ShopItemGrid: React.FC<ShopItemGridProps> = ({ children }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.25rem',
      width: '100%',
    }}>
      {children}
    </div>
  );
};

export default ShopItemGrid;
