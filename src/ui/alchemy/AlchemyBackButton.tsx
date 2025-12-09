import React from 'react'
// import { isMobileView } from '../../utils/responsiveUtils'

interface AlchemyBackButtonProps {
    onBack: () => void
}

export const AlchemyBackButton: React.FC<AlchemyBackButtonProps> = ({ onBack }) => {
    // const isMobile = isMobileView()

    const buttonStyle: React.CSSProperties = {
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '100px',
        height: '40px',
        backgroundColor: '#4a3a30',
        border: '2px solid #8a6a50',
        borderRadius: '8px',
        color: '#e0c0a0',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 100,
        transition: 'all 0.2s ease',
        pointerEvents: 'auto'
    }

    return (
        <button
            style={buttonStyle}
            onClick={onBack}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a4a40'
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4a3a30'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            ← 나가기
        </button>
    )
}
