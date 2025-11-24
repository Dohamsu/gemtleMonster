import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useResources(userId: string | undefined) {
    const [resources, setResources] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchResources = async () => {
            const { data } = await supabase
                .from('player_resource')
                .select('resource_id, amount')
                .eq('user_id', userId)

            if (data) {
                const resourceMap: Record<string, number> = {}
                data.forEach(r => {
                    resourceMap[r.resource_id] = r.amount
                })
                setResources(resourceMap)
            }

            setLoading(false)
        }

        fetchResources()

        // Subscribe to real-time updates
        const subscription = supabase
            .channel('player_resources')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'player_resource',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        const newData = payload.new as { resource_id: string; amount: number }
                        setResources(prev => ({ ...prev, [newData.resource_id]: newData.amount }))
                    }
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    return { resources, loading }
}
