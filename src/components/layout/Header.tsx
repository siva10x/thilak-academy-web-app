import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

interface HeaderProps {
    children?: ReactNode
}

export function Header({ children }: HeaderProps) {
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
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
                                <Button variant="outline" size="sm" onClick={handleSignOut}>
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}