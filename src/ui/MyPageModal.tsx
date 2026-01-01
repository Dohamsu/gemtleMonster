/* eslint-disable no-console */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface MyPageModalProps {
    onClose: () => void
}

export default function MyPageModal({ onClose }: MyPageModalProps) {
    const { user, signOut } = useAuth()
    const [nickname, setNickname] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        if (!user) return

        const userId = user.id

        async function fetchProfile() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('nickname')
                    .eq('id', userId)
                    .single()

                if (data) {
                    setNickname(data.nickname)
                } else if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error)
                }
            } catch (err) {
                console.error('Exception fetching profile:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user])

    const handleSaveNickname = async () => {
        if (!user || !editValue.trim()) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ nickname: editValue.trim() })
                .eq('id', user.id)

            if (error) throw error

            setNickname(editValue.trim())
            setIsEditing(false)
        } catch (err) {
            console.error('Error updating nickname:', err)
            // Optionally show error to user
        }
    }

    const startEditing = () => {
        setEditValue(nickname)
        setIsEditing(true)
    }

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="animate-slide-up" style={{
                width: '90%',
                maxWidth: '400px',
                background: '#1a1612',
                border: '2px solid #facc15',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 0 20px rgba(250, 204, 21, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#facc15', margin: 0, fontSize: '24px' }}>내 정보</h2>
                    <button onClick={onClose} style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: '#231f10', border: '1px solid #494122',
                        color: '#7a7a7a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div style={{
                    background: '#231f10',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #494122',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        background: '#3a2e18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #facc15'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#facc15' }}>person</span>
                    </div>

                    {loading ? (
                        <div style={{ color: '#9ca3af', fontSize: '14px' }}>로딩 중...</div>
                    ) : isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: '#0c0a09',
                                    border: '1px solid #494122',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    textAlign: 'center'
                                }}
                            />
                            <button onClick={handleSaveNickname} style={{
                                background: '#4ade80', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#000' }}>check</span>
                            </button>
                            <button onClick={() => setIsEditing(false)} style={{
                                background: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>close</span>
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                    {nickname || '이름 없음'}
                                </p>
                                <button onClick={startEditing} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af'
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                </button>
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{user?.email || 'Guest User'}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={signOut}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span className="material-symbols-outlined">logout</span>
                    로그아웃
                </button>
            </div>
        </div>
    )
}
