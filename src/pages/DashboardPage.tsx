import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCourses, useUserEnrollments, useEnrollInCourse, useAdminPendingEnrollments } from '../hooks/useCourses'
import { useIsAdmin } from '../hooks/useAdmin'
import { Layout } from '../components/layout/Layout'
import { CourseCard } from '../components/CourseCard'
import { LoadingSpinner } from '../components/ui/Loading'
import type { Course } from '../types'

export function DashboardPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled')

    const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useCourses()
    const { data: enrollments = [], isLoading: enrollmentsLoading, error: enrollmentsError } = useUserEnrollments(user?.id || '')
    const enrollInCourseMutation = useEnrollInCourse()

    // Admin hooks
    const { data: isAdmin = false } = useIsAdmin(user?.id)
    const { data: pendingEnrollments = [] } = useAdminPendingEnrollments()

    // Create a map of course ID to enrollment status
    const enrollmentStatusMap = new Map(enrollments.map(e => [e.course_id, e.status]))

    const enrolledCourses = enrollments.map(enrollment => enrollment.course)
    const enrolledCourseIds = new Set(enrollments.map(e => e.course_id))
    const availableCourses = courses.filter(course => !enrolledCourseIds.has(course.id))

    const handleEnroll = async (courseId: string) => {
        if (!user) return

        try {
            await enrollInCourseMutation.mutateAsync({
                userId: user.id,
                courseId,
            })
            toast.success('Enrollment request submitted! Waiting for admin approval.')
        } catch (error) {
            toast.error('Failed to enroll in course')
            console.error('Enrollment error:', error)
        }
    }

    const getEnrollmentStatusLabel = (courseId: string, showNotEnrolled: boolean = false) => {
        const status = enrollmentStatusMap.get(courseId)

        const statusConfig = {
            active: { label: 'Enrolled', color: 'bg-green-100 text-green-800' },
            pending: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
            suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800' },
            expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
            notEnrolled: { label: 'Not Enrolled', color: 'bg-blue-100 text-blue-800' }
        }

        let config
        if (!status && showNotEnrolled) {
            config = statusConfig.notEnrolled
        } else if (status) {
            config = statusConfig[status as keyof typeof statusConfig] ||
                { label: status, color: 'bg-gray-100 text-gray-800' }
        } else {
            return null
        }

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        )
    }

    const renderCourseGrid = (courseList: Course[], showEnrollButton = false) => {
        if (courseList.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {showEnrollButton ? 'No courses available at the moment.' : 'You haven\'t enrolled in any courses yet.'}
                    </p>
                    {!showEnrollButton && (
                        <button
                            onClick={() => setActiveTab('available')}
                            className="mt-2 text-primary-600 hover:text-primary-700"
                        >
                            Browse available courses →
                        </button>
                    )}
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {courseList.map((course) => (
                    <div key={course.id} className="relative">
                        {/* Status Label */}
                        <div className="absolute top-2 right-2 z-10">
                            {getEnrollmentStatusLabel(course.id, showEnrollButton)}
                        </div>

                        <Link to={`/course/${course.id}`}>
                            <CourseCard
                                course={course}
                                isEnrolled={!showEnrollButton}
                                onEnroll={showEnrollButton ? handleEnroll : undefined}
                                enrollLoading={enrollInCourseMutation.isPending}
                            />
                        </Link>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Layout>
            <div className="space-y-4 md:space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        Welcome back!
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">
                        Continue your learning journey with Thilak Sir Academy
                    </p>
                </div>

                {/* Admin Action Required */}
                {isAdmin && pendingEnrollments.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 md:p-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-orange-800 font-semibold text-base md:text-lg">
                                    Action Required
                                </h3>
                                <p className="text-orange-700 text-sm md:text-base mt-1 mb-3">
                                    {pendingEnrollments.length} enrollment{pendingEnrollments.length > 1 ? 's' : ''} awaiting approval
                                </p>
                                <div className="space-y-2">
                                    {pendingEnrollments.slice(0, 3).map((enrollment: any) => (
                                        <div key={enrollment.id} className="text-sm text-orange-700">
                                            • {enrollment.profile?.full_name || enrollment.profile?.username || 'Unknown User'}
                                            {' '} → {enrollment.course?.title || 'Unknown Course'}
                                        </div>
                                    ))}
                                    {pendingEnrollments.length > 3 && (
                                        <div className="text-sm text-orange-700">
                                            ... and {pendingEnrollments.length - 3} more
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <Link
                                        to="/admin/enrollments"
                                        className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 hover:border-orange-400 transition-colors"
                                    >
                                        Review All Enrollments
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {(coursesError || enrollmentsError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                        {coursesError && (
                            <p className="text-red-600 text-sm mt-1">
                                Courses: {coursesError.message}
                            </p>
                        )}
                        {enrollmentsError && (
                            <p className="text-red-600 text-sm mt-1">
                                Enrollments: {enrollmentsError.message}
                            </p>
                        )}
                        <p className="text-red-600 text-sm mt-2">
                            Please make sure your Supabase database tables are set up correctly.
                        </p>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('enrolled')}
                                className={`flex-1 py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium border-b-2 text-center ${activeTab === 'enrolled'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="hidden sm:inline">My Courses </span>
                                <span className="sm:hidden">My </span>
                                ({enrolledCourses.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`flex-1 py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium border-b-2 text-center ${activeTab === 'available'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="hidden sm:inline">Available Courses </span>
                                <span className="sm:hidden">Available </span>
                                ({availableCourses.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-4 md:p-6">
                        {activeTab === 'enrolled' && (
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Enrolled Courses</h2>
                                {enrollmentsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    renderCourseGrid(enrolledCourses)
                                )}
                            </div>
                        )}

                        {activeTab === 'available' && (
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Available Courses</h2>
                                {coursesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    renderCourseGrid(availableCourses, true)
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}