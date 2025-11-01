import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingPage } from '../components/ui/Loading'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return <LoadingPage message="Checking authentication..." />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}