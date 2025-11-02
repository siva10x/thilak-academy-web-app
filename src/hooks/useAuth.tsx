import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signInWithGoogle: () => Promise<{ error: any }>
    signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        // Get the correct redirect URL based on environment
        const getRedirectUrl = () => {
            // For production, use the actual deployed domain
            if (typeof window !== 'undefined') {
                const currentUrl = window.location.origin;

                // Check if we're on Vercel or your production domain
                if (currentUrl.includes('.vercel.app') || currentUrl.includes('your-domain.com')) {
                    return `${currentUrl}/dashboard`;
                }

                // For local development
                if (currentUrl.includes('localhost')) {
                    return `${currentUrl}/dashboard`;
                }
            }

            // Fallback - let Supabase handle default redirect
            return undefined;
        };

        const redirectTo = getRedirectUrl();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: redirectTo ? { redirectTo } : {},
        })
        return { error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signInWithGoogle,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}