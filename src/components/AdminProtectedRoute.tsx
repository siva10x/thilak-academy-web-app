import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useIsAdmin } from '../hooks/useAdmin'
import { LoadingPage } from '../components/ui/Loading'

interface AdminProtectedRouteProps {
    children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth()
    const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id)

    if (authLoading || adminLoading) {
        return <LoadingPage message="Verifying admin access..." />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}