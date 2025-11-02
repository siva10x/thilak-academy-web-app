import type { ReactNode } from 'react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import toast from 'react-hot-toast'

interface HeaderProps {
    children?: ReactNode
}

export function Header({ children }: HeaderProps) {
    const { user, signOut } = useAuth()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            const { error } = await signOut()

            // Only show error if it's a real error (not session missing)
            if (error && !error.message?.includes('Auth session missing')) {
                console.error('Sign out error:', error)
                toast.error('Sign out failed. Please try again.')
                return
            }

            // Show success message briefly
            toast.success('Signed out successfully')

            // Small delay to show the toast, then force reload to login
            setTimeout(() => {
                // Force a complete page reload to clear all cached state
                window.location.replace('/login')
            }, 1000)

        } catch (err) {
            console.error('Sign out failed:', err)
            // Force sign out by clearing everything and reloading
            localStorage.clear()
            sessionStorage.clear()
            window.location.replace('/login')
        } finally {
            // Don't set loading to false if we're about to reload
            // setIsSigningOut(false)
        }
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 md:h-16">
                    <div className="flex items-center">
                        <h1 className="text-lg md:text-2xl font-bold text-primary-600">
                            Thilak Sir Academy
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        {children}
                        {user && (
                            <div className="flex items-center space-x-2 md:space-x-4">
                                <span className="hidden sm:block text-xs md:text-sm text-gray-700 truncate max-w-32 md:max-w-none">
                                    {user.email}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                    loading={isSigningOut}
                                    disabled={isSigningOut}
                                >
                                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}