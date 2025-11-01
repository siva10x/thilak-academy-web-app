
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PlayIcon, ChevronRightIcon, ArrowLeftIcon, HomeIcon, LockClosedIcon, CogIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCourse, useCourseVideos, useIsEnrolled, useEnrollmentStatus, useEnrollInCourse, useUpdateEnrollmentStatus } from '../hooks/useCourses'
import { useIsAdmin } from '../hooks/useAdmin'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingPage } from '../components/ui/Loading'
import type { Video } from '../types'


export function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()

    const { data: course, isLoading: courseLoading } = useCourse(courseId!)
    const { data: courseVideos = [], isLoading: videosLoading } = useCourseVideos(courseId!)
    const { data: isEnrolled = false, isLoading: enrollmentLoading } = useIsEnrolled(user?.id || '', courseId!)
    const { data: enrollmentStatus } = useEnrollmentStatus(user?.id || '', courseId!)
    const { data: isAdmin = false } = useIsAdmin(user?.id)

    const enrollMutation = useEnrollInCourse()
    const updateEnrollmentMutation = useUpdateEnrollmentStatus()

    const handleBack = () => {
        navigate(-1) // Go back to previous page
    }

    const handleEnroll = async () => {
        if (!user || !courseId) {
            toast.error('Please log in to enroll in this course')
            return
        }

        try {
            // If enrollment exists (expired, suspended, etc.), update it to pending
            if (enrollmentStatus) {
                await updateEnrollmentMutation.mutateAsync({
                    enrollmentId: enrollmentStatus.id,
                    status: 'pending'
                })
                toast.success('Enrollment renewed! Waiting for admin approval.')
            } else {
                // Create new enrollment with pending status
                await enrollMutation.mutateAsync({
                    userId: user.id,
                    courseId: courseId
                })
                toast.success('Enrollment request submitted! Your enrollment is pending admin approval.')
            }
        } catch (error) {
            console.error('Enrollment error:', error)
            toast.error('Failed to submit enrollment request. Please try again.')
        }
    }

    const handleVideoClick = (video: Video, canAccess: boolean) => {
        if (canAccess) {
            navigate(`/course/${courseId}/video/${video.id}`)
        } else {
            // Navigate to video page which will show enrollment prompt
            navigate(`/course/${courseId}/video/${video.id}`)
        }
    }

    if (courseLoading || enrollmentLoading) {
        return <LoadingPage message="Loading course details..." />
    }

    if (!course) {
        return (
            <Layout>
                <div className="space-y-4 md:space-y-6">
                    {/* Navigation Header for Not Found */}
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
                                <span className="text-gray-900 font-medium">Course Not Found</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-12">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
                        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Button onClick={handleBack} variant="outline">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                            <Link to="/dashboard">
                                <Button>Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // Show all videos, but control access based on enrollment and preview status
    const displayVideos = courseVideos


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
                            <span className="text-gray-900 font-medium truncate">
                                {course ? course.title : 'Course Details'}
                            </span>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="flex items-center space-x-2">
                            <Link to={`/admin/course/${courseId}/enrollments`}>
                                <Button variant="outline" size="sm">
                                    <CogIcon className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Manage Enrollments</span>
                                    <span className="sm:hidden">Admin</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Course Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg text-white p-4 md:p-8">
                    <div className="max-w-4xl">
                        <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">{course.title}</h1>
                        <p className="text-primary-100 text-sm md:text-lg mb-4 md:mb-6 leading-relaxed">{course.description}</p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-primary-100">
                            <div className="flex items-center">
                                <PlayIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                                <span className="text-sm md:text-base">{courseVideos.length} videos</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs md:text-sm bg-primary-500 px-2 py-1 rounded">
                                    {course.course_type}
                                </span>
                            </div>
                            {course.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {course.tags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="text-xs bg-primary-500 bg-opacity-50 px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isEnrolled && (
                            <div className="mt-4 md:mt-6">
                                {enrollmentStatus?.status === 'pending' ? (
                                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full sm:w-auto cursor-not-allowed opacity-75"
                                            disabled
                                        >
                                            Enrollment Pending
                                        </Button>
                                        <p className="text-sm text-gray-600 sm:self-center">
                                            Your enrollment request is pending admin approval
                                        </p>
                                    </div>
                                ) : enrollmentStatus?.status === 'suspended' ? (
                                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full sm:w-auto cursor-not-allowed opacity-75"
                                            disabled
                                        >
                                            Enrollment Suspended
                                        </Button>
                                        <p className="text-sm text-gray-600 sm:self-center">
                                            Your enrollment has been suspended. Contact admin for assistance.
                                        </p>
                                    </div>
                                ) : enrollmentStatus?.status === 'expired' ? (
                                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-full sm:w-auto"
                                            onClick={handleEnroll}
                                            disabled={updateEnrollmentMutation.isPending}
                                        >
                                            {updateEnrollmentMutation.isPending ? 'Renewing...' : 'Renew Enrollment'}
                                        </Button>
                                        <p className="text-sm text-gray-600 sm:self-center">
                                            Your enrollment has expired. Click to request reactivation.
                                        </p>
                                    </div>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="w-full sm:w-auto"
                                        onClick={handleEnroll}
                                        disabled={enrollMutation.isPending || updateEnrollmentMutation.isPending}
                                    >
                                        {(enrollMutation.isPending || updateEnrollmentMutation.isPending) ? 'Enrolling...' : 'Enroll Now'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Videos */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                        <h3 className="text-base md:text-lg font-semibold">Course Videos ({courseVideos.length})</h3>
                    </div>

                    <div className="p-3 md:p-6">
                        <div className="space-y-3 md:space-y-4">
                            {videosLoading ? (
                                <div className="text-center py-8 text-sm md:text-base">Loading videos...</div>
                            ) : displayVideos.length > 0 ? (
                                <div className="space-y-3 md:space-y-4">
                                    {displayVideos.map((courseVideo, index) => {
                                        const canAccess = courseVideo.preview_enabled || isEnrolled
                                        return (
                                            <Card key={courseVideo.id} hover>
                                                <div
                                                    className={`flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 md:p-4 ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                                                    onClick={() => handleVideoClick(courseVideo.video, canAccess)}
                                                >
                                                    {/* Video Thumbnail */}
                                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                                        <div className="relative w-full sm:w-32 h-32 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                            {courseVideo.video.thumbnail_url ? (
                                                                <img
                                                                    src={courseVideo.video.thumbnail_url}
                                                                    alt={courseVideo.video.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                                                                    <PlayIcon className="h-12 w-12 sm:h-8 sm:w-8 text-primary-600" />
                                                                </div>
                                                            )}
                                                            {/* Play Button Overlay */}
                                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                                                <div className="w-12 h-12 sm:w-8 sm:h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                                    {canAccess ? (
                                                                        <PlayIcon className="h-6 w-6 sm:h-4 sm:w-4 text-gray-900 ml-0.5" />
                                                                    ) : (
                                                                        <LockClosedIcon className="h-6 w-6 sm:h-4 sm:w-4 text-gray-900" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Video Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 pr-2">
                                                                <h4 className="font-semibold text-gray-900 text-base md:text-lg mb-2 leading-tight">
                                                                    {index + 1}. {courseVideo.video.title}
                                                                </h4>

                                                                {courseVideo.video.description && (
                                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                                        {courseVideo.video.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
                                                                    {courseVideo.preview_enabled && (
                                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                                            Free Preview
                                                                        </span>
                                                                    )}
                                                                    {!isEnrolled && !courseVideo.preview_enabled && (
                                                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                                            Premium
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="ml-2 flex-shrink-0">
                                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm md:text-base">
                                    No videos available in this course
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}