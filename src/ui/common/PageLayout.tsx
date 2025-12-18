import React from 'react'
import ResourceHeader from './ResourceHeader'
import { isMobileView } from '../../utils/responsiveUtils'

interface PageLayoutProps {
    children: React.ReactNode
    sidebar?: React.ReactNode
    onBack?: () => void
    title?: string
    header?: React.ReactNode
}

export default function PageLayout({ children, sidebar, onBack, title, header }: PageLayoutProps) {
    const isMobile = isMobileView()

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#1a0f0a',
            color: '#f0d090',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            {header ? header : <ResourceHeader onBack={onBack || (() => window.history.back())} />}

            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                boxShadow: !isMobile ? '0 0 50px rgba(0,0,0,0.5)' : 'none' // Optional: adds depth to the centered column
            }}>
                {/* Sidebar (Optional) */}
                {!isMobile && sidebar && (
                    <div style={{
                        width: '280px',
                        background: '#2a1810',
                        borderRight: '2px solid #5a4030',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                    }}>
                        {sidebar}
                    </div>
                )}

                {/* Main Content Area */}
                <div style={{
                    flex: 1,
                    padding: isMobile ? '15px' : '25px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.3)',
                    position: 'relative'
                }}>
                    {title && (
                        <h1 style={{
                            margin: '0 0 20px 0',
                            fontSize: isMobile ? '1.4em' : '1.8em',
                            color: '#facc15',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {title}
                        </h1>
                    )}
                    {children}
                </div>
            </div>
        </div>
    )
}
