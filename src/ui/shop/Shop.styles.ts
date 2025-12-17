export const shopStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    .shop-container {
        font-family: 'Space Grotesk', sans-serif;
        background: #1c1917;
        color: #f3f4f6;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        position: relative;
    }
    
    .shop-container * {
        box-sizing: border-box;
    }
    
    .shop-container::-webkit-scrollbar {
        width: 8px;
    }
    .shop-container::-webkit-scrollbar-track {
        background: #1c1917;
    }
    .shop-container::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 4px;
    }
    .shop-container::-webkit-scrollbar-thumb:hover {
        background: #e7b308;
    }
    
    .item-card {
        background: rgba(42, 42, 42, 0.6);
        border: 1px solid #444;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(8px);
    }
    
    .item-card:hover {
        transform: translateY(-4px);
        background: rgba(42, 42, 42, 0.8);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    
    .item-icon-box {
        width: 80px;
        height: 80px;
        background: rgba(0,0,0,0.5);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .purchase-btn {
        background: #eab308;
        color: #1a1a1a;
        border: none;
        padding: 10px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        font-size: 14px;
        letter-spacing: 0.05em;
    }
    
    .purchase-btn:hover:not(:disabled) {
        background: #ca8a04;
        transform: scale(1.02);
        box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
    }
    
    .purchase-btn:disabled {
        background: #4b5563;
        color: #9ca3af;
        cursor: not-allowed;
    }
    
    .no-gold-btn {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 10px;
        border-radius: 8px;
        font-weight: 700;
        cursor: not-allowed;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.05em;
    }
    
    .qty-input-container {
        display: flex;
        align-items: center;
        background: #171717;
        border-radius: 8px;
        padding: 4px;
        border: 1px solid #444;
    }
    
    .qty-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
    }
    
    .qty-btn:hover {
        background: rgba(255,255,255,0.1);
        color: white;
    }
    
    .qty-input {
        width: 48px;
        background: transparent;
        border: none;
        text-align: center;
        color: white;
        font-weight: 700;
        font-size: 14px;
        outline: none;
    }

    .filter-chip {
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(42, 42, 42, 0.6);
        border: 1px solid rgba(255,255,255,0.1);
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .filter-chip.active {
        background: rgba(234, 179, 8, 0.2);
        border-color: #eab308;
        color: #eab308;
    }

    .filter-chip:hover:not(.active) {
        background: rgba(255,255,255,0.1);
        color: white;
    }

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
        background: #1c1917;
        width: 100%;
        max-width: 400px;
        padding: 32px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sell-action-bar {
        background: rgba(42, 42, 42, 0.5);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .sell-btn {
        background: #eab308;
        color: #1a1a1a;
        font-weight: 700;
        padding: 8px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .sell-btn:disabled {
        background: #444444;
        color: #9ca3af;
        cursor: not-allowed;
    }

    .pixelated {
        image-rendering: pixelated;
    }

    .sold-out-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
        backdrop-filter: blur(2px);
    }

    .sold-out-badge {
        background: #ef4444;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        transform: rotate(-5deg);
        box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    .timer-box {
        background: #292524;
        border: 1px solid #44403c;
        border-radius: 8px;
        padding: 4px 10px;
        min-width: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`
