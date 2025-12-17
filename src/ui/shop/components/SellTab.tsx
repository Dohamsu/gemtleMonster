// src/ui/shop/components/SellTab.tsx
import React, { useState, useMemo } from 'react';
import SellActions from './SellActions';
import SellList, { SellItem } from './SellList';
import { colors } from '../../../constants/designTokens';

interface SellTabProps {
  sellItems: SellItem[];
  onSellItems: (items: { id: string; quantity: number; type: 'material' | 'legacy' }[]) => Promise<void>;
}

const SellTab: React.FC<SellTabProps> = ({ sellItems, onSellItems }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});
  const [isSelling, setIsSelling] = useState(false);

  const handleSelectionChange = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = sellItems.find(i => i.id === id);
    if (!item) return;
    const clampedQuantity = Math.max(1, Math.min(newQuantity, item.count));
    setSellQuantities(prev => ({ ...prev, [id]: clampedQuantity }));
  };

  const totalSelectedValue = useMemo(() => {
    return Array.from(selectedItems).reduce((sum, id) => {
      const item = sellItems.find(i => i.id === id);
      if (!item) return sum;
      const quantity = sellQuantities[id] || 1;
      return sum + (item.price * quantity);
    }, 0);
  }, [selectedItems, sellItems, sellQuantities]);

  const handleSell = async () => {
    if (selectedItems.size === 0) return;
    setIsSelling(true);

    const itemsToSell = Array.from(selectedItems).map(id => {
        const item = sellItems.find(i => i.id === id);
        return {
            id,
            quantity: sellQuantities[id] || 1,
            type: item!.type
        }
    });

    await onSellItems(itemsToSell);

    setIsSelling(false);
    setSelectedItems(new Set());
    setSellQuantities({});
  };

  if (sellItems.length === 0) {
    return (
      <div style={{ color: colors.gray400, textAlign: 'center', marginTop: '4rem' }}>
        You have no items to sell.
      </div>
    );
  }

  return (
    <div>
      <SellActions
        selectedItemCount={selectedItems.size}
        totalSelectedValue={totalSelectedValue}
        onSell={handleSell}
        isSelling={isSelling}
      />
      <SellList
        items={sellItems}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        onQuantityChange={handleQuantityChange}
        sellQuantities={sellQuantities}
      />
    </div>
  );
};

export default SellTab;
