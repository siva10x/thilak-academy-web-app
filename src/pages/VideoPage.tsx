import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon, ChevronRightIcon, DocumentIcon, LinkIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCourse, useCourseVideos, useIsEnrolled, useEnrollInCourse, useEnrollmentStatus, useUpdateEnrollmentStatus } from '../hooks/useCourses'
import { Layout } from '../components/layout/Layout'
import { LoadingPage } from '../components/ui/Loading'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { Video, CourseVideo } from '../types'

export function VideoPage() {
    const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
    const [courseVideo, setCourseVideo] = useState<CourseVideo | null>(null)

    const { data: course } = useCourse(courseId!)
    const { data: courseVideos = [] } = useCourseVideos(courseId!)
    const { data: isEnrolled = false } = useIsEnrolled(user?.id || '', courseId!)
    const { data: enrollmentStatus } = useEnrollmentStatus(user?.id || '', courseId!)
    const enrollInCourseMutation = useEnrollInCourse()
    const updateEnrollmentMutation = useUpdateEnrollmentStatus()

    const handleEnroll = async () => {
        if (!user || !courseId) return

        try {
            // If enrollment exists and is expired, update it to pending
            if (enrollmentStatus?.status === 'expired') {
                await updateEnrollmentMutation.mutateAsync({
                    enrollmentId: enrollmentStatus.id,
                    status: 'pending'
                })
                toast.success('Enrollment renewed! Waiting for admin approval.')
            } else {
                // Create new enrollment with pending status
                await enrollInCourseMutation.mutateAsync({
                    userId: user.id,
                    courseId: courseId,
                })
                toast.success('Enrollment request submitted! Waiting for admin approval.')
            }
        } catch (error) {
            toast.error('Failed to enroll in course')
            console.error('Enrollment error:', error)
        }
    }

    const getEnrollmentButtonState = () => {
        if (!enrollmentStatus) {
            return {
                text: 'Enroll in Course',
                disabled: false,
                loading: enrollInCourseMutation.isPending
            }
        }

        switch (enrollmentStatus.status) {
            case 'pending':
                return {
                    text: 'Enrollment Pending',
                    disabled: true,
                    loading: false
                }
            case 'suspended':
                return {
                    text: 'Enrollment Suspended',
                    disabled: true,
                    loading: false
                }
            case 'expired':
                return {
                    text: 'Renew Enrollment',
                    disabled: false,
                    loading: updateEnrollmentMutation.isPending
                }
            case 'active':
                return {
                    text: 'Already Enrolled',
                    disabled: true,
                    loading: false
                }
            default:
                return {
                    text: 'Enroll in Course',
                    disabled: false,
                    loading: enrollInCourseMutation.isPending
                }
        }
    }

    useEffect(() => {
        if (courseVideos.length > 0 && videoId) {
            const foundCourseVideo = courseVideos.find(cv => cv.video_id === videoId)
            if (foundCourseVideo) {
                setCourseVideo(foundCourseVideo)
                setCurrentVideo(foundCourseVideo.video)
            }
        }
        setIsLoading(false)
    }, [courseVideos, videoId])

    const handleBack = () => {
        navigate(`/course/${courseId}`)
    }

    const getVimeoEmbedUrl = (vimeoId: string) => {
        return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=2563eb&title=0&byline=0&portrait=0`
    }

    const canAccess = courseVideo?.preview_enabled || isEnrolled

    if (isLoading) {
        return <LoadingPage message="Loading video..." />
    }

    if (!currentVideo || !courseVideo) {
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
                                <span className="text-gray-900 font-medium">Video Not Found</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-12">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
                        <p className="text-gray-600 mb-6">The video you're looking for doesn't exist or you don't have access to it.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button onClick={handleBack} className="btn-primary">
                                Back to Course
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!canAccess) {
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
                                <Link to={`/course/${courseId}`} className="hover:text-primary-600 transition-colors truncate">
                                    {course?.title || 'Course'}
                                </Link>
                                <ChevronRightIcon className="h-4 w-4 mx-1 md:mx-2 text-gray-400" />
                                <span className="text-gray-900 font-medium truncate">Access Restricted</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <LockClosedIcon className="h-8 w-8 text-orange-600" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Premium Video Content</h1>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            This video is part of the premium course content. Enroll in "{course?.title}" to access this and all other course videos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            {(() => {
                                const buttonState = getEnrollmentButtonState()
                                return (
                                    <Button
                                        onClick={handleEnroll}
                                        loading={buttonState.loading}
                                        disabled={buttonState.disabled}
                                        size="lg"
                                        variant={buttonState.disabled ? "outline" : "primary"}
                                    >
                                        {buttonState.text}
                                    </Button>
                                )
                            })()}
                            <Button onClick={handleBack} variant="outline" size="lg">
                                Back to Course
                            </Button>
                        </div>

                        {/* Status Message */}
                        {enrollmentStatus && (
                            <div className="mt-4 text-center">
                                {enrollmentStatus.status === 'pending' && (
                                    <p className="text-sm text-yellow-600">
                                        Your enrollment request is pending admin approval
                                    </p>
                                )}
                                {enrollmentStatus.status === 'suspended' && (
                                    <p className="text-sm text-red-600">
                                        Your enrollment has been suspended. Contact admin for assistance.
                                    </p>
                                )}
                                {enrollmentStatus.status === 'expired' && (
                                    <p className="text-sm text-orange-600">
                                        Your enrollment has expired. Click "Renew Enrollment" to request reactivation.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
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
                            aria-label="Go back to course"
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
                            <Link to={`/course/${courseId}`} className="hover:text-primary-600 transition-colors truncate max-w-32 md:max-w-none">
                                {course?.title || 'Course'}
                            </Link>
                            <ChevronRightIcon className="h-4 w-4 mx-1 md:mx-2 text-gray-400" />
                            <span className="text-gray-900 font-medium truncate max-w-32 md:max-w-none">
                                {currentVideo.title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Player */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="relative">
                        {currentVideo.vimeo_id ? (
                            <div className="relative bg-black">
                                <iframe
                                    src={getVimeoEmbedUrl(currentVideo.vimeo_id)}
                                    className="w-full aspect-video"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title={currentVideo.title}
                                />
                            </div>
                        ) : (
                            <div className="aspect-video flex items-center justify-center bg-gray-100">
                                <p className="text-gray-600">Video not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Information */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                        {currentVideo.title}
                    </h1>

                    {courseVideo.preview_enabled && (
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                Free Preview
                            </span>
                        </div>
                    )}

                    {currentVideo.description && (
                        <div className="prose prose-sm md:prose-base max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {currentVideo.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Video Resources */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                    {currentVideo.resources && (Array.isArray(currentVideo.resources) ? currentVideo.resources.length > 0 : currentVideo.resources) ? (
                        <div className="space-y-3">
                            {Array.isArray(currentVideo.resources) ? (
                                currentVideo.resources.map((resource: any, index: number) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {resource.type === 'link' ? (
                                                    <LinkIcon className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <DocumentIcon className="h-5 w-5 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                {resource.url ? (
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        {resource.title || resource.name || 'Resource'}
                                                    </a>
                                                ) : (
                                                    <span className="font-medium text-gray-900">
                                                        {resource.title || resource.name || 'Resource'}
                                                    </span>
                                                )}
                                                {resource.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {resource.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <DocumentIcon className="h-5 w-5 text-gray-600" />
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">Additional Resources</span>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {typeof currentVideo.resources === 'string'
                                                    ? currentVideo.resources
                                                    : JSON.stringify(currentVideo.resources)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <DocumentIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm md:text-base">No resources available</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}