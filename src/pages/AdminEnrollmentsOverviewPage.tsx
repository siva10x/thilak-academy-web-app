import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useAdminPendingEnrollments } from '../hooks/useCourses'
import { useIsAdmin } from '../hooks/useAdmin'
import { Layout } from '../components/layout/Layout'
import { LoadingPage } from '../components/ui/Loading'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

interface CourseEnrollmentSummary {
    courseId: string
    courseTitle: string
    pendingCount: number
    totalEnrollments: number
    enrollments: any[]
}

export function AdminEnrollmentsOverviewPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id)
    const { data: pendingEnrollments = [], isLoading: pendingLoading } = useAdminPendingEnrollments()

    const handleBack = () => {
        navigate('/dashboard')
    }

    // Group pending enrollments by course
    const courseEnrollmentSummary: CourseEnrollmentSummary[] = pendingEnrollments.reduce((acc: CourseEnrollmentSummary[], enrollment: any) => {
        const existingCourse = acc.find(item => item.courseId === enrollment.course_id)

        if (existingCourse) {
            existingCourse.pendingCount++
            existingCourse.enrollments.push(enrollment)
        } else {
            acc.push({
                courseId: enrollment.course_id,
                courseTitle: enrollment.course?.title || 'Unknown Course',
                pendingCount: 1,
                totalEnrollments: 1, // We'll show just pending for now
                enrollments: [enrollment]
            })
        }

        return acc
    }, [])

    if (adminLoading || pendingLoading) {
        return <LoadingPage message="Loading admin panel..." />
    }

    if (!isAdmin) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
                    <Button onClick={handleBack}>
                        Back to Dashboard
                    </Button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-4 md:space-y-6">
                {/* Navigation Header */}
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 md:p-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                        </button>
                        <div className="flex items-center text-sm md:text-base text-gray-600">
                            <Link to="/dashboard" className="flex items-center hover:text-primary-600 transition-colors">
                                <HomeIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Home</span>
                            </Link>
                            <ChevronRightIcon className="h-4 w-4 mx-1 md:mx-2 text-gray-400" />
                            <span className="text-gray-900 font-medium">Admin: Enrollment Overview</span>
                        </div>
                    </div>
                </div>

                {/* Page Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Enrollment Management
                            </h1>
                            <p className="text-gray-600">
                                Review and manage pending course enrollments
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                                {pendingEnrollments.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                Pending Enrollments
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses with Pending Enrollments */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                        <h3 className="text-lg font-semibold">Courses with Pending Enrollments</h3>
                    </div>

                    <div className="p-4 md:p-6">
                        {courseEnrollmentSummary.length > 0 ? (
                            <div className="space-y-4">
                                {courseEnrollmentSummary.map((courseSummary) => (
                                    <Card key={courseSummary.courseId} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                                        {courseSummary.courseTitle}
                                                    </h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span className="flex items-center">
                                                            <ClockIcon className="h-4 w-4 mr-1 text-orange-500" />
                                                            {courseSummary.pendingCount} pending enrollment{courseSummary.pendingCount > 1 ? 's' : ''}
                                                        </span>
                                                    </div>

                                                    {/* Preview of pending students */}
                                                    <div className="mt-2 space-y-1">
                                                        {courseSummary.enrollments.slice(0, 3).map((enrollment: any) => (
                                                            <div key={enrollment.id} className="text-sm text-gray-700">
                                                                • {enrollment.profile?.full_name || enrollment.profile?.username || 'Unknown User'}
                                                                <span className="text-gray-500 ml-1">
                                                                    ({new Date(enrollment.enrolled_at).toLocaleDateString()})
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {courseSummary.enrollments.length > 3 && (
                                                            <div className="text-sm text-gray-500">
                                                                ... and {courseSummary.enrollments.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {/* Pending Count Badge */}
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {courseSummary.pendingCount} pending
                                                </div>

                                                {/* Action Button */}
                                                <Link to={`/admin/course/${courseSummary.courseId}/enrollments`}>
                                                    <Button variant="primary" size="sm">
                                                        Manage
                                                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-green-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                                <p className="text-sm md:text-base">No pending enrollments require attention at this time.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}