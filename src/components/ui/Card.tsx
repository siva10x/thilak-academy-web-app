import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'card',
                hover && 'hover:shadow-md transition-shadow cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}