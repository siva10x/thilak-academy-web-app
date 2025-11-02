import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingPage } from '../components/ui/Loading'

export function AuthCallbackPage() {
    const { user, loading } = useAuth()

    useEffect(() => {
        // Clean up URL hash fragments after OAuth callback
        if (window.location.hash) {
            const cleanUrl = window.location.pathname + window.location.search
            window.history.replaceState({}, document.title, cleanUrl)
        }
    }, [])

    // Show loading while processing authentication
    if (loading) {
        return <LoadingPage message="Completing sign in..." />
    }

    // Redirect to dashboard if authenticated
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
}