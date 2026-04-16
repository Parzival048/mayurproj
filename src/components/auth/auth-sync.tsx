'use client'

import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { resolveUserRole } from '@/lib/auth'
import type { Profile } from '@/types'

function mapProfile(
    authUser: { id: string; email?: string | null; user_metadata?: { full_name?: string | null } } | null,
    profile: Partial<Profile> | null
): Profile | null {
    if (!authUser) return null

    return {
        id: authUser.id,
        email: profile?.email || authUser.email || '',
        full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: resolveUserRole(profile?.role, authUser.email),
        avatar_url: profile?.avatar_url ?? null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
    }
}

export function AuthSync() {
    const supabase = useMemo(() => createClient(), [])
    const { setUser, setLoading } = useAuthStore()

    useEffect(() => {
        const syncUser = async () => {
            setLoading(true)
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser()

            if (!authUser) {
                setUser(null)
                setLoading(false)
                return
            }

            await supabase.from('profiles').upsert(
                {
                    id: authUser.id,
                    email: authUser.email || '',
                    full_name: authUser.user_metadata?.full_name ?? null,
                },
                {
                    onConflict: 'id',
                    ignoreDuplicates: true,
                }
            )

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single()

            setUser(mapProfile(authUser, profile))
            setLoading(false)
        }

        syncUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_, session) => {
            if (!session?.user) {
                setUser(null)
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            setUser(mapProfile(session.user, profile))
        })

        return () => subscription.unsubscribe()
    }, [supabase, setUser, setLoading])

    return null
}
