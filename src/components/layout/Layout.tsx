import type { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
    children: ReactNode
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}