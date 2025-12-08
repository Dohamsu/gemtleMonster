import { useState, useRef, useEffect } from 'react'

interface Option {
    value: string
    label: string
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    placeholder?: string
    style?: React.CSSProperties
}

export default function CustomSelect({ value, onChange, options, placeholder, style }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || value

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                minWidth: '140px',
                ...style
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(30, 41, 59, 0.9)',
                    border: isOpen ? '1px solid #3b82f6' : '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* {icon && <span>{icon}</span>} */}
                    {selectedLabel}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 50,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: option.value === value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: option.value === value ? '#60a5fa' : '#cbd5e1',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {option.label}
                            {option.value === value && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
