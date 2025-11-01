import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardContent } from '../components/ui/Card'

export function LoginPage() {
    const { user, signInWithOtp, verifyOtp } = useAuth()
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [loading, setLoading] = useState(false)

    // Redirect if already logged in
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)
        const { error } = await signInWithOtp(email)

        if (error) {
            toast.error(error.message || 'Failed to send OTP')
        } else {
            toast.success('OTP sent to your email!')
            setStep('otp')
        }
        setLoading(false)
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp.trim()) {
            toast.error('Please enter the OTP')
            return
        }

        setLoading(true)
        const { error } = await verifyOtp(email, otp)

        if (error) {
            toast.error(error.message || 'Invalid OTP')
        } else {
            toast.success('Login successful!')
            // Navigation will happen automatically due to auth state change
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-bold text-primary-600 mb-2">
                    Thilak Sir Academy
                </h1>
                <h2 className="text-center text-2xl font-semibold text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card>
                    {step === 'email' ? (
                        <form onSubmit={handleSendOtp}>
                            <CardHeader>
                                <h3 className="text-lg font-medium">Enter your email</h3>
                                <p className="text-sm text-gray-600">
                                    We'll send you an OTP to verify your identity
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <Input
                                    label="Email address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    loading={loading}
                                >
                                    Send OTP
                                </Button>
                            </CardContent>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <CardHeader>
                                <h3 className="text-lg font-medium">Enter OTP</h3>
                                <p className="text-sm text-gray-600">
                                    We've sent a 6-digit code to {email}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <Input
                                    label="OTP Code"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                />

                                <div className="space-y-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        loading={loading}
                                    >
                                        Verify OTP
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setStep('email')
                                            setOtp('')
                                        }}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    )
}