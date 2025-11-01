import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useIsAdmin(userId: string | undefined) {
    return useQuery({
        queryKey: ['is-admin', userId],
        queryFn: async () => {
            if (!userId) return false

            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error checking admin status:', error)
                return false
            }

            return data?.is_admin || false
        },
        enabled: !!userId,
    })
}

export function useUserProfile(userId: string | undefined) {
    return useQuery({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            if (!userId) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data as Profile
        },
        enabled: !!userId,
    })
}