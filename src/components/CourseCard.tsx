import { Card, CardHeader, CardContent } from './ui'
import { Button } from './ui'
import { truncateText } from '../lib/utils'
import type { Course } from '../types'

interface CourseCardProps {
    course: Course
    isEnrolled?: boolean
    onEnroll?: (courseId: string) => void
    enrollLoading?: boolean
}

export function CourseCard({ course, isEnrolled = false, onEnroll, enrollLoading = false }: CourseCardProps) {
    return (
        <Card hover>
            <CardHeader className="pb-3">
                {course.thumbnail_url && (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-36 md:h-48 object-cover rounded-lg mb-3 md:mb-4"
                    />
                )}
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                    {course.title}
                </h3>
            </CardHeader>

            <CardContent className="pt-0">
                <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
                    {truncateText(course.description, 100)}
                </p>

                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs md:text-sm rounded font-medium">
                        {course.course_type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs md:text-sm rounded">
                        {course.num_videos} videos
                    </span>
                    {course.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm rounded">
                            {tag}
                        </span>
                    ))}
                    {course.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs md:text-sm rounded">
                            +{course.tags.length - 2} more
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {isEnrolled ? (
                        <Button variant="secondary" size="sm" className="w-full">
                            Continue Learning
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onEnroll?.(course.id)}
                            loading={enrollLoading}
                            size="sm"
                            className="w-full"
                        >
                            Enroll Now
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}