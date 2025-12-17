export const shopStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    .shop-container {
        font-family: 'Space Grotesk', sans-serif;
        background: #2a1810;
        color: #f0d090;
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
        background: #2a1810;
    }
    .shop-container::-webkit-scrollbar-thumb {
        background: #5a4030;
        border-radius: 4px;
        border: 1px solid #4a3020;
    }
    .shop-container::-webkit-scrollbar-thumb:hover {
        background: #facc15;
    }
    
    .item-card {
        background: rgba(42, 42, 42, 0.8);
        border: 1px solid #444444;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }
    
    .item-card:hover {
        transform: translateY(-4px);
        background: rgba(60, 60, 60, 0.9);
        border-color: #facc15;
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
        border: 1px solid #4a3020;
    }
    
    .purchase-btn {
        background: #facc15;
        color: #2a1810;
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
        background: #fbbf24;
        transform: scale(1.02);
        box-shadow: 0 0 15px rgba(250, 204, 21, 0.4);
    }
    
    .purchase-btn:disabled {
        background: #4a3020;
        color: #785a40;
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
        background: #1a0f0a;
        border-radius: 8px;
        padding: 4px;
        border: 1px solid #4a3020;
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
        background: rgba(250, 204, 21, 0.1);
        color: #facc15;
    }
    
    .qty-input {
        width: 48px;
        background: transparent;
        border: none;
        text-align: center;
        color: #f0d090;
        font-weight: 700;
        font-size: 14px;
        outline: none;
    }

    .filter-chip {
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(90, 64, 48, 0.3);
        border: 1px solid rgba(240, 208, 144, 0.1);
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .filter-chip.active {
        background: rgba(250, 204, 21, 0.2);
        border-color: #facc15;
        color: #facc15;
    }

    .filter-chip:hover:not(.active) {
        background: rgba(250, 204, 21, 0.1);
        color: #f0d090;
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
        background: #2a1810;
        width: 100%;
        max-width: 400px;
        padding: 32px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        border: 1px solid #5a4030;
        animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .sell-action-bar {
        background: rgba(42, 24, 16, 0.8);
        backdrop-filter: blur(8px);
        border: 1px solid #5a4030;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .sell-btn {
        background: #facc15;
        color: #2a1810;
        font-weight: 700;
        padding: 8px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .sell-btn:disabled {
        background: #4a3020;
        color: #785a40;
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
        background: #4a3020;
        border: 1px solid #5a4030;
        border-radius: 8px;
        padding: 4px 10px;
        min-width: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #facc15;
    }
`
