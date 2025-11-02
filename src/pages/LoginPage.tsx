import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export function LoginPage() {
    const { user, signInWithGoogle } = useAuth()
    const [loading, setLoading] = useState(false)

    // Redirect if already logged in
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        const { error } = await signInWithGoogle()

        if (error) {
            toast.error(error.message || 'Failed to sign in with Google')
            setLoading(false)
        }
        // Don't set loading to false here since we're redirecting
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
            {/* Mobile-first hero section */}
            <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
                {/* Logo and branding */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="mb-6">
                        {/* Academy logo/icon */}
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Thilak Sir Academy
                    </h1>

                    {/* Prominent hashtag */}
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-lg"></div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 inline-block">
                            <span className="text-lg sm:text-xl font-bold tracking-wide">
                                #RiseWithThilakSir
                            </span>
                        </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
                        Join thousands of students in their journey to academic success
                    </p>
                </div>

                {/* Login card */}
                <div className="w-full max-w-sm mx-auto">
                    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl rounded-2xl">
                        <CardContent className="p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                                    Welcome Back
                                </h2>
                                {/* Prominent description */}
                                <div className="relative mb-2">
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
                                        <p className="text-sm font-medium text-blue-800 leading-relaxed">
                                            Sign in using your <span className="font-bold text-blue-900">registered email account</span> to access your courses
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                loading={loading}
                                disabled={loading}
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    {!loading && (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                    )}
                                    {loading && (
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                    )}
                                    <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                                </div>
                            </Button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    By continuing, you agree to our{' '}
                                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Terms</span>{' '}
                                    and{' '}
                                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Privacy Policy</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-6 px-4">
                <p className="text-sm text-gray-400">
                    © 2025 Thilak Sir Academy. All rights reserved.
                </p>
            </div>
        </div>
    )
}