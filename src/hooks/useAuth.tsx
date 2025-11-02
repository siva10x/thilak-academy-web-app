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
        // Handle OAuth callback if URL has hash fragments
        const handleAuthCallback = async () => {
            console.log('Auth callback check:', {
                hasHash: !!window.location.hash,
                hash: window.location.hash,
                pathname: window.location.pathname,
                href: window.location.href
            })

            // Check if we're handling an OAuth callback
            if (window.location.hash && window.location.hash.includes('access_token')) {
                console.log('OAuth callback detected, processing tokens...')
                setLoading(true)
                try {
                    // Supabase will automatically parse the tokens from URL
                    const { data, error } = await supabase.auth.getSession()
                    console.log('Session check result:', { hasSession: !!data.session, error })

                    if (error) {
                        console.error('Auth callback error:', error)
                    } else if (data.session) {
                        console.log('Setting session for user:', data.session.user.email)
                        setSession(data.session)
                        setUser(data.session.user)

                        // Clean up the URL by removing the hash
                        const cleanUrl = window.location.pathname + window.location.search
                        console.log('Cleaning URL from', window.location.href, 'to', cleanUrl)
                        window.history.replaceState({}, document.title, cleanUrl)

                        // Redirect to dashboard if we're not already there
                        if (window.location.pathname !== '/dashboard') {
                            console.log('Redirecting to dashboard from', window.location.pathname)
                            window.location.replace('/dashboard')
                        } else {
                            console.log('Already on dashboard, no redirect needed')
                        }
                    } else {
                        console.log('No session found after OAuth callback')
                    }
                } catch (err) {
                    console.error('Failed to handle auth callback:', err)
                } finally {
                    setLoading(false)
                }
                return
            }

            // Normal session check for non-callback scenarios
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Session check error:', error)
                setSession(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        handleAuthCallback()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event)
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                // Handle successful sign in from OAuth
                if (event === 'SIGNED_IN' && session) {
                    // Clean URL if it has hash fragments
                    if (window.location.hash) {
                        window.history.replaceState({}, document.title, window.location.pathname)
                    }

                    // Redirect to dashboard if not already there
                    if (window.location.pathname !== '/dashboard') {
                        window.location.replace('/dashboard')
                    }
                }
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
        try {
            // Always attempt to sign out from Supabase first (this clears browser storage)
            const { error } = await supabase.auth.signOut()

            // Clear local React state
            setUser(null)
            setSession(null)

            // Clear any remaining auth data from localStorage/sessionStorage
            if (typeof window !== 'undefined') {
                // Clear Supabase auth tokens using environment variable
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                if (supabaseUrl) {
                    const projectRef = supabaseUrl.split('//')[1].split('.')[0]
                    localStorage.removeItem(`sb-${projectRef}-auth-token`)
                    sessionStorage.removeItem(`sb-${projectRef}-auth-token`)
                }

                // Clear any other auth-related items
                const keysToRemove: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-'))) {
                        keysToRemove.push(key)
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key))
            }

            // Return success even if there was a "session missing" error
            if (error && error.message && error.message.includes('Auth session missing')) {
                return { error: null }
            }

            return { error }
        } catch (err) {
            console.error('Sign out failed:', err)

            // Force clear everything even on error
            setUser(null)
            setSession(null)

            // Clear browser storage as fallback
            if (typeof window !== 'undefined') {
                localStorage.clear()
                sessionStorage.clear()
            }

            return { error: err }
        }
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